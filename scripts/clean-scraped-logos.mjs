#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { encodeRgbaPng, parsePngRgba } from '../src/lib/pngCodec.mjs';

export function cleanLogo(filePath) {
  try {
    const parsed = parsePngRgba(fs.readFileSync(filePath));
    if (!parsed) return null;
    const { width, height, pixels } = parsed;

    // Check corners
    const corners = [
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]
    ];
    let whiteCornerCount = 0;
    for (const [cx, cy] of corners) {
      const o = (cy * width + cx) * 4;
      const lum = (0.299 * pixels[o] + 0.587 * pixels[o+1] + 0.114 * pixels[o+2]) / 255;
      if (lum > 0.88 && pixels[o+3] > 180) whiteCornerCount++;
    }

    if (whiteCornerCount < 3) {
      // Not a solid white canvas
      return null;
    }

    // Find bounding box of non-white content
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let nonWhitePixels = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 4;
        const lum = (0.299 * pixels[o] + 0.587 * pixels[o+1] + 0.114 * pixels[o+2]) / 255;
        if (lum < 0.90) {
          nonWhitePixels++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (nonWhitePixels < 50 || minX > maxX || minY > maxY) return null;

    // Add padding
    minX = Math.max(0, minX - 14);
    minY = Math.max(0, minY - 14);
    maxX = Math.min(width - 1, maxX + 14);
    maxY = Math.min(height - 1, maxY + 14);

    const croppedW = maxX - minX + 1;
    const croppedH = maxY - minY + 1;

    const outPixels = Buffer.alloc(croppedW * croppedH * 4);
    let outIdx = 0;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const o = (y * width + x) * 4;
        const r = pixels[o];
        const g = pixels[o + 1];
        const b = pixels[o + 2];
        const a = pixels[o + 3];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        outPixels[outIdx++] = r;
        outPixels[outIdx++] = g;
        outPixels[outIdx++] = b;

        if (a < 35 || lum > 0.95) {
          outPixels[outIdx++] = 0;
        } else if (lum > 0.88) {
          outPixels[outIdx++] = Math.round(((0.95 - lum) / 0.07) * a);
        } else {
          outPixels[outIdx++] = a;
        }
      }
    }

    const outBuf = encodeRgbaPng(croppedW, croppedH, outPixels);
    fs.writeFileSync(filePath, outBuf);
    return {
      original: `${width}x${height}`,
      cropped: `${croppedW}x${croppedH}`,
      bytes: outBuf.length,
    };
  } catch (err) {
    console.error(`Failed to clean ${filePath}:`, err.message);
    return null;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const leadsDir = path.join(process.cwd(), 'public', 'leads');
  const dirs = fs.existsSync(leadsDir)
    ? fs.readdirSync(leadsDir, { withFileTypes: true })
    : [];

  let cleanedCount = 0;
  for (const d of dirs) {
    if (d.isDirectory()) {
      const logoFile = path.join(leadsDir, d.name, 'logo.png');
      if (fs.existsSync(logoFile)) {
        const res = cleanLogo(logoFile);
        if (res) {
          console.log(`[CLEANED] ${d.name}: from ${res.original} to ${res.cropped} (transparent PNG)`);
          cleanedCount++;
        }
      }
    }
  }

  console.log(`\nSuccessfully cleaned ${cleanedCount} scraped logos.`);
}
