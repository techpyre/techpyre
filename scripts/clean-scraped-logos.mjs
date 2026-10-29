#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Precompute CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

export function cleanLogo(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504E47) return null;
    let pos = 8;
    let width, height, colorType;
    const idatChunks = [];
    while (pos < buf.length) {
      const len = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      const data = buf.subarray(pos + 8, pos + 8 + len);
      if (type === 'IHDR') {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        colorType = data[9];
      } else if (type === 'IDAT') idatChunks.push(data);
      else if (type === 'IEND') break;
      pos += 12 + len;
    }
    if (!idatChunks.length) return null;

    const raw = zlib.inflateSync(Buffer.concat(idatChunks));
    const bpp = colorType === 6 ? 4 : (colorType === 2 ? 3 : 1);
    const stride = width * bpp;
    let rawIdx = 0;
    const prevRow = Buffer.alloc(stride);
    const currRow = Buffer.alloc(stride);

    const pixels = Buffer.alloc(width * height * 4);

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
          const pr = (pa <= pb && pa <= pc) ? left : (pb <= pc ? up : upLeft);
          val = (byte + pr) & 0xff;
        }
        currRow[i] = val;
      }
      for (let x = 0; x < width; x++) {
        const pxOffset = x * bpp;
        const targetOffset = (y * width + x) * 4;
        pixels[targetOffset] = currRow[pxOffset];
        pixels[targetOffset + 1] = currRow[pxOffset + 1];
        pixels[targetOffset + 2] = currRow[pxOffset + 2];
        pixels[targetOffset + 3] = bpp === 4 ? currRow[pxOffset + 3] : 255;
      }
      currRow.copy(prevRow);
    }

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

    // Build transparent output
    const outRaw = Buffer.alloc((croppedW * 4 + 1) * croppedH);
    let outIdx = 0;

    for (let y = minY; y <= maxY; y++) {
      outRaw[outIdx++] = 0; // Filter None
      for (let x = minX; x <= maxX; x++) {
        const o = (y * width + x) * 4;
        const r = pixels[o];
        const g = pixels[o + 1];
        const b = pixels[o + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        outRaw[outIdx++] = r;
        outRaw[outIdx++] = g;
        outRaw[outIdx++] = b;

        // Soft alpha threshold for clean background removal
        if (lum > 0.95) {
          outRaw[outIdx++] = 0;
        } else if (lum > 0.88) {
          const alpha = Math.round((0.95 - lum) / 0.07 * 255);
          outRaw[outIdx++] = alpha;
        } else {
          outRaw[outIdx++] = 255;
        }
      }
    }

    const compressed = zlib.deflateSync(outRaw);
    const outBuf = Buffer.alloc(8 + 25 + (12 + compressed.length) + 12);
    let pPos = 0;
    outBuf.writeUInt32BE(0x89504E47, pPos); pPos += 4;
    outBuf.writeUInt32BE(0x0D0A1A0A, pPos); pPos += 4;

    // IHDR
    outBuf.writeUInt32BE(13, pPos); pPos += 4;
    outBuf.write("IHDR", pPos, 4, "ascii"); pPos += 4;
    outBuf.writeUInt32BE(croppedW, pPos); pPos += 4;
    outBuf.writeUInt32BE(croppedH, pPos); pPos += 4;
    outBuf[pPos++] = 8;
    outBuf[pPos++] = 6; // RGBA
    outBuf[pPos++] = 0;
    outBuf[pPos++] = 0;
    outBuf[pPos++] = 0;
    outBuf.writeUInt32BE(crc32(outBuf.subarray(12, 12 + 17)), pPos); pPos += 4;

    // IDAT
    outBuf.writeUInt32BE(compressed.length, pPos); pPos += 4;
    outBuf.write("IDAT", pPos, 4, "ascii"); pPos += 4;
    compressed.copy(outBuf, pPos); pPos += compressed.length;
    outBuf.writeUInt32BE(crc32(Buffer.concat([Buffer.from("IDAT"), compressed])), pPos); pPos += 4;

    // IEND
    outBuf.writeUInt32BE(0, pPos); pPos += 4;
    outBuf.write("IEND", pPos, 4, "ascii"); pPos += 4;
    outBuf.writeUInt32BE(crc32(Buffer.from("IEND")), pPos); pPos += 4;

    fs.writeFileSync(filePath, outBuf);
    return {
      original: `${width}x${height}`,
      cropped: `${croppedW}x${croppedH}`,
      bytes: outBuf.length
    };
  } catch (err) {
    console.error(`Failed to clean ${filePath}:`, err.message);
    return null;
  }
}

// Process all leads
const leadsDir = path.join(process.cwd(), 'public', 'leads');
const dirs = fs.readdirSync(leadsDir, { withFileTypes: true });

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

console.log(`\nSuccessfully cleaned and background-removed ${cleanedCount} coarsely scraped logos.`);
