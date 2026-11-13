import fs from "fs";
import path from "path";
import zlib from "zlib";
import { execFileSync } from "child_process";

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

export interface PngAnalysisResult {
  width: number;
  height: number;
  hasWhiteElements: boolean;
  dominantColor: string | null;
  transparentRatio: number;
  whiteRatio: number;
}

export interface HeroAnalysisResult {
  width: number;
  height: number;
  aspectRatio: number;
  transparentRatio: number;
  whiteRatio: number;
  uniformRatio: number;
  isValidHeroPhoto: boolean;
  rejectReason?: string;
}

function parsePngPixels(buf: Buffer): {
  width: number;
  height: number;
  colorType: number;
  pixels: Buffer;
} | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 6;
  const idatChunks: Buffer[] = [];

  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    if (pos + 12 + len > buf.length) break;
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }

  if (!idatChunks.length || !width || !height || bitDepth !== 8) return null;
  if (colorType !== 6 && colorType !== 2 && colorType !== 4 && colorType !== 0) {
    return null;
  }

  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const stride = width * bpp;
  if (raw.length < (stride + 1) * height) return null;

  const pixels = Buffer.alloc(width * height * 4);
  const prevRow = Buffer.alloc(stride);
  const currRow = Buffer.alloc(stride);
  let rawIdx = 0;

  for (let y = 0; y < height; y++) {
    const filterType = raw[rawIdx++];
    for (let i = 0; i < stride; i++) {
      const byte = raw[rawIdx++];
      const left = i >= bpp ? currRow[i - bpp] : 0;
      const up = prevRow[i];
      const upLeft = i >= bpp ? prevRow[i - bpp] : 0;
      let val = byte;
      if (filterType === 1) val = (byte + left) & 0xff;
      else if (filterType === 2) val = (byte + up) & 0xff;
      else if (filterType === 3) val = (byte + Math.floor((left + up) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        val = (byte + pr) & 0xff;
      }
      currRow[i] = val;
    }

    for (let x = 0; x < width; x++) {
      const src = x * bpp;
      const dst = (y * width + x) * 4;
      if (bpp === 4) {
        pixels[dst] = currRow[src];
        pixels[dst + 1] = currRow[src + 1];
        pixels[dst + 2] = currRow[src + 2];
        pixels[dst + 3] = currRow[src + 3];
      } else if (bpp === 3) {
        pixels[dst] = currRow[src];
        pixels[dst + 1] = currRow[src + 1];
        pixels[dst + 2] = currRow[src + 2];
        pixels[dst + 3] = 255;
      } else if (bpp === 2) {
        pixels[dst] = currRow[src];
        pixels[dst + 1] = currRow[src];
        pixels[dst + 2] = currRow[src];
        pixels[dst + 3] = currRow[src + 1];
      } else {
        pixels[dst] = currRow[src];
        pixels[dst + 1] = currRow[src];
        pixels[dst + 2] = currRow[src];
        pixels[dst + 3] = 255;
      }
    }
    currRow.copy(prevRow);
  }

  return { width, height, colorType, pixels };
}

/**
 * Rimuove lo sfondo bianco solido grossolano dai loghi PNG e ritaglia il bounding box.
 */
export function cleanLogoPngInPlace(filePath: string): boolean {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) return false;
    const parsed = parsePngPixels(fs.readFileSync(/*turbopackIgnore: true*/ filePath));
    if (!parsed) return false;
    const { width, height, pixels } = parsed;

    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
    ];
    let whiteCornerCount = 0;
    for (const [cx, cy] of corners) {
      const o = (cy * width + cx) * 4;
      const lum = (0.299 * pixels[o] + 0.587 * pixels[o + 1] + 0.114 * pixels[o + 2]) / 255;
      if (lum > 0.88 && pixels[o + 3] > 180) whiteCornerCount++;
    }
    if (whiteCornerCount < 3) return false;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let nonWhitePixels = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 4;
        const lum = (0.299 * pixels[o] + 0.587 * pixels[o + 1] + 0.114 * pixels[o + 2]) / 255;
        if (lum < 0.9 && pixels[o + 3] > 40) {
          nonWhitePixels++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (nonWhitePixels < 40 || minX > maxX || minY > maxY) return false;

    const pad = Math.min(12, Math.max(4, Math.round(Math.min(width, height) * 0.04)));
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);

    const croppedW = maxX - minX + 1;
    const croppedH = maxY - minY + 1;
    const outRaw = Buffer.alloc((croppedW * 4 + 1) * croppedH);
    let outIdx = 0;

    for (let y = minY; y <= maxY; y++) {
      outRaw[outIdx++] = 0;
      for (let x = minX; x <= maxX; x++) {
        const o = (y * width + x) * 4;
        const r = pixels[o];
        const g = pixels[o + 1];
        const b = pixels[o + 2];
        const a = pixels[o + 3];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        outRaw[outIdx++] = r;
        outRaw[outIdx++] = g;
        outRaw[outIdx++] = b;
        if (a < 35 || lum > 0.95) {
          outRaw[outIdx++] = 0;
        } else if (lum > 0.88) {
          outRaw[outIdx++] = Math.round(((0.95 - lum) / 0.07) * a);
        } else {
          outRaw[outIdx++] = a;
        }
      }
    }

    const compressed = zlib.deflateSync(outRaw);
    const outBuf = Buffer.alloc(8 + 25 + (12 + compressed.length) + 12);
    let pPos = 0;
    outBuf.writeUInt32BE(0x89504e47, pPos);
    pPos += 4;
    outBuf.writeUInt32BE(0x0d0a1a0a, pPos);
    pPos += 4;

    outBuf.writeUInt32BE(13, pPos);
    pPos += 4;
    outBuf.write("IHDR", pPos, 4, "ascii");
    pPos += 4;
    outBuf.writeUInt32BE(croppedW, pPos);
    pPos += 4;
    outBuf.writeUInt32BE(croppedH, pPos);
    pPos += 4;
    outBuf[pPos++] = 8;
    outBuf[pPos++] = 6;
    outBuf[pPos++] = 0;
    outBuf[pPos++] = 0;
    outBuf[pPos++] = 0;
    outBuf.writeUInt32BE(crc32(outBuf.subarray(12, 12 + 17)), pPos);
    pPos += 4;

    outBuf.writeUInt32BE(compressed.length, pPos);
    pPos += 4;
    outBuf.write("IDAT", pPos, 4, "ascii");
    pPos += 4;
    compressed.copy(outBuf, pPos);
    pPos += compressed.length;
    outBuf.writeUInt32BE(
      crc32(Buffer.concat([Buffer.from("IDAT"), compressed])),
      pPos
    );
    pPos += 4;

    outBuf.writeUInt32BE(0, pPos);
    pPos += 4;
    outBuf.write("IEND", pPos, 4, "ascii");
    pPos += 4;
    outBuf.writeUInt32BE(crc32(Buffer.from("IEND")), pPos);

    fs.writeFileSync(/*turbopackIgnore: true*/ filePath, outBuf);
    return true;
  } catch {
    return false;
  }
}

export function analyzePngLogo(filePath: string): PngAnalysisResult | null {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) return null;
    const parsed = parsePngPixels(fs.readFileSync(/*turbopackIgnore: true*/ filePath));
    if (!parsed) return null;
    const { width, height, pixels } = parsed;

    let visiblePixels = 0;
    let whitePixels = 0;
    let transparentPixels = 0;
    const colorBuckets: Record<string, number> = {};

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a < 35) {
        transparentPixels++;
      } else {
        visiblePixels++;
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (lum > 0.85) {
          whitePixels++;
        } else if (lum >= 0.08) {
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max - min > 32) {
            const qr = Math.min(240, Math.round(r / 16) * 16);
            const qg = Math.min(240, Math.round(g / 16) * 16);
            const qb = Math.min(240, Math.round(b / 16) * 16);
            const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb)
              .toString(16)
              .slice(1)}`;
            colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
          }
        }
      }
    }

    const total = width * height;
    const transparentRatio = total > 0 ? transparentPixels / total : 0;
    const whiteRatio = visiblePixels > 0 ? whitePixels / visiblePixels : 0;
    const hasWhiteElements = transparentRatio > 0.15 && whiteRatio > 0.15;
    const sorted = Object.entries(colorBuckets).sort((a, b) => b[1] - a[1]);

    return {
      width,
      height,
      hasWhiteElements,
      dominantColor: sorted.length > 0 ? sorted[0][0] : null,
      transparentRatio,
      whiteRatio,
    };
  } catch {
    return null;
  }
}

export function isValidRasterImageBuffer(
  buf: Buffer,
  expectedFormat?: "png" | "jpg"
): boolean {
  if (!buf || buf.length < 400) return false;
  const ascii = buf.subarray(0, 64).toString("utf8").trim().toLowerCase();
  if (
    ascii.startsWith("<!doctype") ||
    ascii.startsWith("<html") ||
    ascii.startsWith("<svg") ||
    ascii.startsWith("<?xml")
  ) {
    return false;
  }
  const isPng = buf.length >= 8 && buf.readUInt32BE(0) === 0x89504e47;
  const isJpg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (expectedFormat === "png") return isPng;
  if (expectedFormat === "jpg") return isJpg;
  const isGif = ascii.startsWith("gif8");
  const isWebp =
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP";
  const isIco = buf.length >= 4 && buf.readUInt32BE(0) === 0x00000100;
  return isPng || isJpg || isGif || isWebp || isIco;
}

export function getJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let pos = 2;
  while (pos + 9 < buf.length) {
    if (buf[pos] !== 0xff) break;
    const marker = buf[pos + 1];
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      const height = buf.readUInt16BE(pos + 5);
      const width = buf.readUInt16BE(pos + 7);
      return { width, height };
    }
    if (pos + 4 > buf.length) break;
    const segLen = buf.readUInt16BE(pos + 2);
    if (segLen < 2) break;
    pos += 2 + segLen;
  }
  return null;
}

export function getPngDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function computeHeroPixelMetrics(parsed: {
  width: number;
  height: number;
  pixels: Buffer;
}): HeroAnalysisResult {
  const { width, height, pixels } = parsed;
  const total = width * height;
  const step = Math.max(1, Math.floor(total / 25000));
  let sampled = 0;
  let transparentCount = 0;
  let visibleCount = 0;
  let whiteCount = 0;
  const buckets: Record<string, number> = {};

  for (let idx = 0; idx < total; idx += step) {
    const o = idx * 4;
    const r = pixels[o];
    const g = pixels[o + 1];
    const b = pixels[o + 2];
    const a = pixels[o + 3];
    sampled++;
    if (a < 35) {
      transparentCount++;
    } else {
      visibleCount++;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (lum > 0.9) {
        whiteCount++;
      }
      const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
  }

  const transparentRatio = sampled > 0 ? transparentCount / sampled : 0;
  const whiteRatio = visibleCount > 0 ? whiteCount / visibleCount : 1;
  const maxBucket = Object.values(buckets).reduce((m, v) => (v > m ? v : m), 0);
  const uniformRatio = visibleCount > 0 ? maxBucket / visibleCount : 1;
  const aspectRatio = height > 0 ? width / height : 1;

  let rejectReason: string | undefined;
  if (width < 480 || height < 240) {
    rejectReason = `dimensions_too_small(${width}x${height})`;
  } else if (aspectRatio < 0.55 || aspectRatio > 3.2) {
    rejectReason = `extreme_aspect_ratio(${aspectRatio.toFixed(2)})`;
  } else if (transparentRatio > 0.08) {
    rejectReason = `transparent_cutout(${Math.round(transparentRatio * 100)}%)`;
  } else if (whiteRatio > 0.65) {
    rejectReason = `mostly_white_canvas(${Math.round(whiteRatio * 100)}%)`;
  } else if (uniformRatio > 0.85) {
    rejectReason = `uniform_blank_image(${Math.round(uniformRatio * 100)}%)`;
  }

  return {
    width,
    height,
    aspectRatio,
    transparentRatio,
    whiteRatio,
    uniformRatio,
    isValidHeroPhoto: !rejectReason,
    rejectReason,
  };
}

/**
 * Analizza qualsiasi file hero locale (JPEG, PNG, WebP) convertendolo temporaneamente in PNG se necessario
 * per rilevare sticker trasparenti, badge su sfondo bianco o immagini uniformi/vuote.
 */
export function analyzeRasterHeroFile(filePath: string): HeroAnalysisResult | null {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) return null;
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath);
    if (isValidRasterImageBuffer(raw, "png")) {
      const parsed = parsePngPixels(raw);
      return parsed ? computeHeroPixelMetrics(parsed) : null;
    }

    const sipsCmd = ["", "usr", "bin", "sips"].join("/");
    if (!fs.existsSync(/*turbopackIgnore: true*/ sipsCmd)) {
      const dims = getJpegDimensions(raw);
      if (!dims) return null;
      const ar = dims.height > 0 ? dims.width / dims.height : 1;
      const valid = dims.width >= 480 && dims.height >= 240 && ar >= 0.55 && ar <= 3.2;
      return {
        width: dims.width,
        height: dims.height,
        aspectRatio: ar,
        transparentRatio: 0,
        whiteRatio: 0,
        uniformRatio: 0,
        isValidHeroPhoto: valid,
        rejectReason: valid ? undefined : "invalid_dimensions",
      };
    }

    const tmpPng = `${filePath}.tmp-analyze-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.png`;
    try {
      execFileSync(
        /*turbopackIgnore: true*/ sipsCmd,
        ["-s", "format", "png", filePath, "--out", tmpPng],
        { stdio: "ignore", timeout: 8000 }
      );
      if (!fs.existsSync(/*turbopackIgnore: true*/ tmpPng)) return null;
      const parsed = parsePngPixels(fs.readFileSync(/*turbopackIgnore: true*/ tmpPng));
      return parsed ? computeHeroPixelMetrics(parsed) : null;
    } finally {
      try {
        if (fs.existsSync(/*turbopackIgnore: true*/ tmpPng)) {
          fs.unlinkSync(/*turbopackIgnore: true*/ tmpPng);
        }
      } catch {}
    }
  } catch {
    return null;
  }
}

/**
 * Scarica un'immagine remota, la converte al formato raster atteso (PNG/JPG) via macOS `sips`
 * se disponibile, verifica dimensioni minime (evita icone 16x16 usate come hero), rigetta sticker/badge
 * trasparenti o bianchi per le hero e pulisce il logo.
 */
export async function downloadAndNormalizeRasterAsset(
  url: string,
  destPath: string,
  targetFormat: "png" | "jpg",
  options?: {
    minBytes?: number;
    minWidth?: number;
    minHeight?: number;
    allowSquareGifFallback?: boolean;
  }
): Promise<{
  ok: boolean;
  logoAnalysis?: PngAnalysisResult | null;
}> {
  const minBytes = options?.minBytes ?? (targetFormat === "jpg" ? 8000 : 450);
  const minWidth = options?.minWidth ?? (targetFormat === "jpg" ? 480 : 40);
  const minHeight = options?.minHeight ?? (targetFormat === "jpg" ? 240 : 18);

  if (!url || url.startsWith("data:") || /\.svg(\?|$|#)/i.test(url)) {
    return { ok: false };
  }

  const lowerUrl = url.toLowerCase();
  if (
    /(?:shinystat\.com|facebook\.com\/tr|doubleclick\.net|google-analytics\.com|googleadservices\.com|linkedin\.com\/px)/i.test(
      lowerUrl
    )
  ) {
    return { ok: false };
  }

  if (
    targetFormat === "jpg" &&
    /(?:favicon|logo|icon-|_icon|sprite|pixel|blank|spacer|badge|bollino|sticker|flag-|bandiera|1x1|woocommerce-placeholder|certific|iso-|soa-|payment|visa|paypal|social|client-|partner)/i.test(
      lowerUrl
    )
  ) {
    return { ok: false };
  }

  let rawBuf: Buffer;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        Accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return { ok: false };
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("text/html") || ct.includes("svg")) return { ok: false };
    rawBuf = Buffer.from(await res.arrayBuffer());
  } catch {
    return { ok: false };
  }

  if (!isValidRasterImageBuffer(rawBuf)) {
    return { ok: false };
  }

  const rawAsciiHead = rawBuf.subarray(0, 12).toString("ascii").toLowerCase();
  const isRawGif = rawAsciiHead.startsWith("gif8");
  const isRawPng = rawBuf.length >= 24 && rawBuf.readUInt32BE(0) === 0x89504e47;

  // Per hero foto, scarta GIF e scarta PNG trasparenti/sticker prima della conversione in JPEG
  if (targetFormat === "jpg") {
    if (isRawGif) return { ok: false };
    if (isRawPng) {
      const parsedHero = parsePngPixels(rawBuf);
      if (parsedHero) {
        const metrics = computeHeroPixelMetrics(parsedHero);
        if (!metrics.isValidHeroPhoto) {
          return { ok: false };
        }
      }
    }
  }

  const outDir = path.dirname(destPath);
  const tmpFile = path.join(outDir, `.tmp-asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

  try {
    fs.mkdirSync(/*turbopackIgnore: true*/ outDir, { recursive: true });
    fs.writeFileSync(/*turbopackIgnore: true*/ tmpFile, rawBuf);

    const sipsCmd = ["", "usr", "bin", "sips"].join("/");
    let convertedOk = false;

    if (fs.existsSync(/*turbopackIgnore: true*/ sipsCmd)) {
      try {
        execFileSync(
          /*turbopackIgnore: true*/ sipsCmd,
          ["-s", "format", targetFormat === "jpg" ? "jpeg" : "png", tmpFile, "--out", destPath],
          { stdio: "ignore", timeout: 8000 }
        );
        convertedOk = fs.existsSync(/*turbopackIgnore: true*/ destPath);
      } catch {
        convertedOk = false;
      }
    }

    if (!convertedOk) {
      if (isValidRasterImageBuffer(rawBuf, targetFormat)) {
        fs.writeFileSync(/*turbopackIgnore: true*/ destPath, rawBuf);
        convertedOk = true;
      }
    }

    if (!convertedOk || !fs.existsSync(/*turbopackIgnore: true*/ destPath)) {
      return { ok: false };
    }

    const finalBuf = fs.readFileSync(/*turbopackIgnore: true*/ destPath);
    if (!isValidRasterImageBuffer(finalBuf, targetFormat) || finalBuf.length < minBytes) {
      try {
        fs.unlinkSync(/*turbopackIgnore: true*/ destPath);
      } catch {}
      return { ok: false };
    }

    const dims =
      targetFormat === "png" ? getPngDimensions(finalBuf) : getJpegDimensions(finalBuf);
    if (dims && (dims.width < minWidth || dims.height < minHeight)) {
      try {
        fs.unlinkSync(/*turbopackIgnore: true*/ destPath);
      } catch {}
      return { ok: false };
    }

    if (targetFormat === "png") {
      // Evita micro-favicon GIF quadrate (es. 250x250 croppate) quando non richiesto esplicitamente
      if (
        !options?.allowSquareGifFallback &&
        isRawGif &&
        dims &&
        Math.abs(dims.width - dims.height) <= 4 &&
        dims.width <= 300
      ) {
        try {
          fs.unlinkSync(/*turbopackIgnore: true*/ destPath);
        } catch {}
        return { ok: false };
      }

      cleanLogoPngInPlace(destPath);
      const logoAnalysis = analyzePngLogo(destPath);
      return { ok: true, logoAnalysis };
    }

    // Validazione finale pixel-level su hero.jpg convertita (evita badge bianchi, aspect ratio estremi o schermate vuote)
    const heroAnalysis = analyzeRasterHeroFile(destPath);
    if (heroAnalysis && !heroAnalysis.isValidHeroPhoto) {
      try {
        fs.unlinkSync(/*turbopackIgnore: true*/ destPath);
      } catch {}
      return { ok: false };
    }

    return { ok: true };
  } finally {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ tmpFile)) {
        fs.unlinkSync(/*turbopackIgnore: true*/ tmpFile);
      }
    } catch {}
  }
}
