#!/usr/bin/env node
/**
 * =====================================================================
 * TechPyre — True Mobile Emulation & Viewport Audit via Chrome DevTools Protocol (CDP)
 *
 * Perché esiste questo modulo:
 *   Lanciare Chromium/Brave con `--window-size=390,844 --screenshot` NON attiva
 *   l'emulazione mobile (viewport meta tag, touch e mobile media queries) e sul Mac
 *   forza una finestra desktop minima (~500-800px) ritagliata a 390px, facendo sembrare
 *   TUTTI i siti "tagliati a destra".
 *
 *   Questo modulo apre una sessione CDP reale via WebSocket e imposta:
 *     - Emulation.setDeviceMetricsOverride({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
 *     - User-Agent reale iPhone iOS 17 Safari
 *     - Misurazione reale nel DOM mobile (scrollWidth vs innerWidth, form visibile above-the-fold,
 *       altezza in % di eventuale cookie banner/popup, numero link menu, Performance timing reale).
 * =====================================================================
 */
import { spawn } from 'child_process';
import fs from 'fs';

const BRAVE_PATHS = [
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

export function getBrowserBin() {
  return BRAVE_PATHS.find((p) => fs.existsSync(p)) || null;
}

export async function runTrueMobileAuditAndScreenshot(url, screenshotPath, waitMs = 3500) {
  const browserBin = getBrowserBin();
  if (!browserBin) {
    throw new Error('Nessun browser Chromium/Brave trovato in /Applications.');
  }

  const userDataDir = `/tmp/techpyre-cdp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const proc = spawn(browserBin, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ]);

  let ws = null;
  try {
    const wsUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout avvio CDP DevTools')), 10000);
      proc.stderr.on('data', (chunk) => {
        const match = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) {
          clearTimeout(timer);
          resolve(match[1]);
        }
      });
      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const baseHttp = wsUrl.replace(/^ws:\/\//, 'http://').replace(/\/devtools\/browser\/.*$/, '');
    let targets = await fetch(`${baseHttp}/json/list`).then((r) => r.json()).catch(() => []);
    let pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) {
      // Se nessun target aperto, creane uno nuovo
      pageTarget = await fetch(`${baseHttp}/json/new`).then((r) => r.json()).catch(() => null);
    }
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error('Nessun target pagina trovato in CDP.');
    }

    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    let msgId = 1;
    const pending = new Map();
    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch {
        // ignore parse errors
      }
    });

    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = msgId++;
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Timeout CDP comando: ${method}`));
        }, 20000);
        pending.set(id, {
          resolve: (res) => {
            clearTimeout(timeout);
            resolve(res);
          },
          reject: (err) => {
            clearTimeout(timeout);
            reject(err);
          },
        });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await send('Page.enable');
    await send('Network.enable');
    await send('Runtime.enable');

    // Imposta User-Agent e Device Metrics REALI di un iPhone (390x844 @2x mobile:true)
    await send('Network.setUserAgentOverride', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      acceptLanguage: 'it-IT,it;q=0.9',
    });

    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      screenWidth: 390,
      screenHeight: 844,
    });

    await send('Emulation.setTouchEmulationEnabled', { enabled: true });

    await send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, waitMs));
    await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 2500);' });
    await new Promise((r) => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const winW = window.innerWidth || 390;
        const winH = window.innerHeight || 844;
        const docW = document.documentElement.scrollWidth || winW;

        // Controlla se esiste un form realmente visibile nella prima schermata (above the fold)
        const forms = [...document.querySelectorAll('form')];
        const visibleForms = forms.filter((f) => {
          const style = window.getComputedStyle(f);
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
          const r = f.getBoundingClientRect();
          return r.width > 120 && r.height > 40;
        });

        const formVisibleAboveTheFold = visibleForms.some((f) => {
          const r = f.getBoundingClientRect();
          return r.top < winH - 60 && r.bottom > 40;
        });

        // Posizione verticale del primo form visibile (quanti schermi bisogna scorrere per trovarlo)
        let firstFormTopPx = null;
        if (visibleForms.length > 0) {
          firstFormTopPx = Math.round(Math.min(...visibleForms.map((f) => f.getBoundingClientRect().top + window.scrollY)));
        }

        // Controlla se c'è un banner cookie o popup che copre parte della prima schermata
        const overlaySelectors = [
          '[id*="cookie" i]',
          '[class*="cookie" i]',
          '[id*="iubenda" i]',
          '[class*="iubenda" i]',
          '[id*="gdpr" i]',
          '[class*="gdpr" i]',
          '[class*="popup" i]',
          '[class*="modal" i]'
        ];
        let maxOverlayAreaRatio = 0;
        const overlays = document.querySelectorAll(overlaySelectors.join(','));
        for (const el of overlays) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
          if (style.position !== 'fixed' && style.position !== 'sticky' && style.position !== 'absolute') continue;
          const r = el.getBoundingClientRect();
          const visibleW = Math.max(0, Math.min(r.right, winW) - Math.max(r.left, 0));
          const visibleH = Math.max(0, Math.min(r.bottom, winH) - Math.max(r.top, 0));
          const ratio = (visibleW * visibleH) / (winW * winH);
          if (ratio > maxOverlayAreaRatio && ratio < 0.98) {
            maxOverlayAreaRatio = ratio;
          }
        }

        // Controlla pulsanti / CTA visibili nella prima schermata
        const visibleCtasAboveFold = [...document.querySelectorAll('a, button')]
          .filter((el) => {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') return false;
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.top < winH && r.width > 70 && r.height >= 28;
          })
          .map((el) => (el.innerText || '').replace(/\\s+/g, ' ').trim())
          .filter((t) => t.length > 1 && t.length < 60)
          .slice(0, 8);

        const h1El = document.querySelector('h1');
        const h1Text = h1El ? (h1El.innerText || '').replace(/\\s+/g, ' ').trim() : '';

        return {
          viewportWidth: winW,
          viewportHeight: winH,
          documentScrollWidth: docW,
          hasRealHorizontalOverflow: docW > winW + 12,
          formVisibleAboveTheFold,
          firstFormTopPx,
          screensToReachForm: firstFormTopPx !== null ? Number((firstFormTopPx / winH).toFixed(1)) : null,
          visibleFormsCount: visibleForms.length,
          cookieOrPopupCoverPercent: Math.round(maxOverlayAreaRatio * 100),
          visibleCtasAboveFold,
          h1Text
        };
      })()`,
    });

    if (screenshotPath) {
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 },
      });
      fs.writeFileSync(screenshotPath, Buffer.from(shot.data, 'base64'));
    }

    return evalRes?.result?.value || null;
  } finally {
    try {
      if (ws) ws.close();
    } catch {}
    try {
      proc.kill('SIGKILL');
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

export async function fetchRenderedHtmlViaCdp(url, waitMs = 5000) {
  const browserBin = getBrowserBin();
  if (!browserBin) {
    throw new Error('Nessun browser Chromium/Brave trovato in /Applications.');
  }

  const userDataDir = `/tmp/techpyre-cdp-html-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const proc = spawn(browserBin, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ]);

  let ws = null;
  try {
    const wsUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout avvio CDP DevTools')), 10000);
      proc.stderr.on('data', (chunk) => {
        const match = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) {
          clearTimeout(timer);
          resolve(match[1]);
        }
      });
      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const baseHttp = wsUrl.replace(/^ws:\/\//, 'http://').replace(/\/devtools\/browser\/.*$/, '');
    let targets = await fetch(`${baseHttp}/json/list`).then((r) => r.json()).catch(() => []);
    let pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) {
      pageTarget = await fetch(`${baseHttp}/json/new`).then((r) => r.json()).catch(() => null);
    }
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error('Nessun target pagina trovato in CDP.');
    }

    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    let msgId = 1;
    const pending = new Map();
    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch {}
    });

    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = msgId++;
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Timeout CDP comando: ${method}`));
        }, 20000);
        pending.set(id, {
          resolve: (res) => {
            clearTimeout(timeout);
            resolve(res);
          },
          reject: (err) => {
            clearTimeout(timeout);
            reject(err);
          },
        });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await send('Page.enable');
    await send('Network.enable');
    await send('Runtime.enable');

    await send('Network.setUserAgentOverride', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      platform: 'MacIntel',
      acceptLanguage: 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    await send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, waitMs));
    await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 2500);' });
    await new Promise((r) => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: 'document.documentElement.outerHTML',
    });

    return evalRes?.result?.value || '';
  } finally {
    try {
      if (ws) ws.close();
    } catch {}
    try {
      proc.kill('SIGKILL');
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

// Uso da CLI: node scripts/mobile-audit-cdp.mjs <url> <out.png>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , targetUrl, outPng] = process.argv;
  if (!targetUrl) {
    console.error('Uso: node scripts/mobile-audit-cdp.mjs <url> [screenshot.png]');
    process.exit(1);
  }
  runTrueMobileAuditAndScreenshot(targetUrl, outPng)
    .then((metrics) => console.log(JSON.stringify(metrics, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
