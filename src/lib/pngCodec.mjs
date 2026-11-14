import zlib from "node:zlib";

const PNG_SIGNATURE_HI = 0x89504e47;
const PNG_SIGNATURE_LO = 0x0d0a1a0a;

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

export function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function getChannelsForColorType(colorType) {
  switch (colorType) {
    case 0:
      return 1;
    case 2:
      return 3;
    case 3:
      return 1;
    case 4:
      return 2;
    case 6:
      return 4;
    default:
      return 0;
  }
}

function unfilterScanlines(raw, width, height, colorType, bitDepth) {
  const channels = getChannelsForColorType(colorType);
  if (channels === 0) return null;

  const bitsPerPixel = channels * bitDepth;
  const rowBytes = Math.ceil((width * bitsPerPixel) / 8);
  const bpp = Math.max(1, Math.ceil(bitsPerPixel / 8));
  const scanlines = Buffer.alloc(height * rowBytes);
  const prevRow = Buffer.alloc(rowBytes);

  let pos = 0;
  for (let y = 0; y < height; y++) {
    if (pos >= raw.length) return null;
    const filterType = raw[pos++];
    const rowStart = y * rowBytes;

    for (let i = 0; i < rowBytes; i++) {
      if (pos >= raw.length) return null;
      const byte = raw[pos++];
      const left = i >= bpp ? scanlines[rowStart + i - bpp] : 0;
      const up = prevRow[i];
      const upLeft = i >= bpp ? prevRow[i - bpp] : 0;

      let reconstructed = byte;
      if (filterType === 1) {
        reconstructed = (byte + left) & 0xff;
      } else if (filterType === 2) {
        reconstructed = (byte + up) & 0xff;
      } else if (filterType === 3) {
        reconstructed = (byte + ((left + up) >> 1)) & 0xff;
      } else if (filterType === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        reconstructed = (byte + pr) & 0xff;
      }
      scanlines[rowStart + i] = reconstructed;
    }

    scanlines.copy(prevRow, 0, rowStart, rowStart + rowBytes);
  }

  return { scanlines, rowBytes };
}

function readSampleValue(row, bitOffset, bitDepth) {
  if (bitDepth === 8) {
    return row[bitOffset >> 3];
  }
  if (bitDepth === 16) {
    return row[bitOffset >> 3];
  }
  const byteIndex = bitOffset >> 3;
  const shift = 8 - bitDepth - (bitOffset & 7);
  const mask = (1 << bitDepth) - 1;
  return (row[byteIndex] >> shift) & mask;
}

/**
 * Decodes PNG color types 0 (Grayscale), 2 (RGB), 3 (Indexed PLTE+tRNS),
 * 4 (Grayscale+Alpha), and 6 (RGBA) into a flat 8-bit RGBA Buffer.
 * Interlaced (Adam7) PNGs are rejected cleanly with null.
 */
export function parsePngRgba(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 33) return null;
  if (
    buf.readUInt32BE(0) !== PNG_SIGNATURE_HI ||
    buf.readUInt32BE(4) !== PNG_SIGNATURE_LO
  ) {
    return null;
  }

  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 6;
  let interlace = 0;
  let palette = null;
  let trns = null;
  const idatChunks = [];

  let offset = 8;
  while (offset + 12 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const chunkType = buf.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > buf.length) break;

    if (chunkType === "IHDR" && length >= 13) {
      width = buf.readUInt32BE(dataStart);
      height = buf.readUInt32BE(dataStart + 4);
      bitDepth = buf[dataStart + 8];
      colorType = buf[dataStart + 9];
      interlace = buf[dataStart + 12];
    } else if (chunkType === "PLTE") {
      palette = buf.subarray(dataStart, dataEnd);
    } else if (chunkType === "tRNS") {
      trns = buf.subarray(dataStart, dataEnd);
    } else if (chunkType === "IDAT") {
      idatChunks.push(buf.subarray(dataStart, dataEnd));
    } else if (chunkType === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  if (
    !width ||
    !height ||
    width > 4096 ||
    height > 4096 ||
    interlace !== 0 ||
    idatChunks.length === 0
  ) {
    return null;
  }
  if (![1, 2, 4, 8, 16].includes(bitDepth)) return null;
  if (colorType === 3 && !palette) return null;

  let raw;
  try {
    raw = zlib.inflateSync(Buffer.concat(idatChunks));
  } catch {
    return null;
  }

  const unfiltered = unfilterScanlines(raw, width, height, colorType, bitDepth);
  if (!unfiltered) return null;
  const { scanlines, rowBytes } = unfiltered;
  const pixels = Buffer.alloc(width * height * 4);
  const scaleFactor = bitDepth < 8 ? 255 / ((1 << bitDepth) - 1) : 1;
  const channels = getChannelsForColorType(colorType);

  for (let y = 0; y < height; y++) {
    const row = scanlines.subarray(y * rowBytes, (y + 1) * rowBytes);
    for (let x = 0; x < width; x++) {
      const dst = (y * width + x) * 4;
      const baseBit = x * channels * bitDepth;

      if (colorType === 3) {
        const idx = readSampleValue(row, baseBit, bitDepth);
        const palPos = idx * 3;
        if (palPos + 2 < palette.length) {
          pixels[dst] = palette[palPos];
          pixels[dst + 1] = palette[palPos + 1];
          pixels[dst + 2] = palette[palPos + 2];
          pixels[dst + 3] = trns && idx < trns.length ? trns[idx] : 255;
        }
      } else if (colorType === 0) {
        const rawGray = readSampleValue(row, baseBit, bitDepth);
        const gray = bitDepth < 8 ? Math.round(rawGray * scaleFactor) : rawGray;
        const isTransparentKey =
          trns && trns.length >= 2 && trns.readUInt16BE(0) === rawGray;
        pixels[dst] = gray;
        pixels[dst + 1] = gray;
        pixels[dst + 2] = gray;
        pixels[dst + 3] = isTransparentKey ? 0 : 255;
      } else if (colorType === 4) {
        const gray = readSampleValue(row, baseBit, bitDepth);
        const alpha = readSampleValue(row, baseBit + bitDepth, bitDepth);
        pixels[dst] = gray;
        pixels[dst + 1] = gray;
        pixels[dst + 2] = gray;
        pixels[dst + 3] = alpha;
      } else if (colorType === 2) {
        const r = readSampleValue(row, baseBit, bitDepth);
        const g = readSampleValue(row, baseBit + bitDepth, bitDepth);
        const b = readSampleValue(row, baseBit + bitDepth * 2, bitDepth);
        const isTransparentKey =
          trns &&
          trns.length >= 6 &&
          trns.readUInt16BE(0) === r &&
          trns.readUInt16BE(2) === g &&
          trns.readUInt16BE(4) === b;
        pixels[dst] = r;
        pixels[dst + 1] = g;
        pixels[dst + 2] = b;
        pixels[dst + 3] = isTransparentKey ? 0 : 255;
      } else {
        pixels[dst] = readSampleValue(row, baseBit, bitDepth);
        pixels[dst + 1] = readSampleValue(row, baseBit + bitDepth, bitDepth);
        pixels[dst + 2] = readSampleValue(row, baseBit + bitDepth * 2, bitDepth);
        pixels[dst + 3] = readSampleValue(row, baseBit + bitDepth * 3, bitDepth);
      }
    }
  }

  return { width, height, colorType, bitDepth, pixels };
}

export function encodeRgbaPng(width, height, rgbaPixels) {
  const rowStride = width * 4;
  const rawScanlines = Buffer.alloc((rowStride + 1) * height);

  for (let y = 0; y < height; y++) {
    const outRowStart = y * (rowStride + 1);
    rawScanlines[outRowStart] = 0;
    rgbaPixels.copy(
      rawScanlines,
      outRowStart + 1,
      y * rowStride,
      (y + 1) * rowStride
    );
  }

  const compressed = zlib.deflateSync(rawScanlines);
  const outBuf = Buffer.alloc(8 + 25 + (12 + compressed.length) + 12);
  let pos = 0;

  outBuf.writeUInt32BE(PNG_SIGNATURE_HI, pos);
  pos += 4;
  outBuf.writeUInt32BE(PNG_SIGNATURE_LO, pos);
  pos += 4;

  outBuf.writeUInt32BE(13, pos);
  pos += 4;
  outBuf.write("IHDR", pos, 4, "ascii");
  pos += 4;
  outBuf.writeUInt32BE(width, pos);
  pos += 4;
  outBuf.writeUInt32BE(height, pos);
  pos += 4;
  outBuf[pos++] = 8;
  outBuf[pos++] = 6;
  outBuf[pos++] = 0;
  outBuf[pos++] = 0;
  outBuf[pos++] = 0;
  outBuf.writeUInt32BE(crc32(outBuf.subarray(12, 29)), pos);
  pos += 4;

  outBuf.writeUInt32BE(compressed.length, pos);
  pos += 4;
  outBuf.write("IDAT", pos, 4, "ascii");
  pos += 4;
  compressed.copy(outBuf, pos);
  pos += compressed.length;
  outBuf.writeUInt32BE(
    crc32(Buffer.concat([Buffer.from("IDAT"), compressed])),
    pos
  );
  pos += 4;

  outBuf.writeUInt32BE(0, pos);
  pos += 4;
  outBuf.write("IEND", pos, 4, "ascii");
  pos += 4;
  outBuf.writeUInt32BE(crc32(Buffer.from("IEND")), pos);

  return outBuf;
}
