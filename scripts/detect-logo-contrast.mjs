import fs from "fs";
import path from "path";
import zlib from "zlib";

function analyzePNG(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504E47) return null;
    let pos = 8;
    let width, height, bitDepth, colorType;
    const idatChunks = [];
    while (pos < buf.length) {
      const len = buf.readUInt32BE(pos);
      const type = buf.toString("ascii", pos + 4, pos + 8);
      const data = buf.subarray(pos + 8, pos + 8 + len);
      if (type === "IHDR") {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        bitDepth = data[8];
        colorType = data[9];
      } else if (type === "IDAT") {
        idatChunks.push(data);
      } else if (type === "IEND") break;
      pos += 12 + len;
    }
    if (!idatChunks.length) return null;
    const raw = zlib.inflateSync(Buffer.concat(idatChunks));
    const bpp = colorType === 6 ? 4 : (colorType === 2 ? 3 : 1);
    const stride = width * bpp;
    let rawIdx = 0;
    let visiblePixels = 0;
    let whitePixels = 0;
    let darkPixels = 0;
    let transparentPixels = 0;
    const colorBuckets = {};

    const prevRow = Buffer.alloc(stride);
    const currRow = Buffer.alloc(stride);

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
        const r = currRow[pxOffset];
        const g = currRow[pxOffset + 1];
        const b = currRow[pxOffset + 2];
        const a = bpp === 4 ? currRow[pxOffset + 3] : 255;

        if (a < 35) {
          transparentPixels++;
        } else {
          visiblePixels++;
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (lum > 0.82) {
            whitePixels++;
          } else if (lum < 0.25) {
            darkPixels++;
          } else {
            // Saturated color tracking: check saturation
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            if (delta > 35) {
              // Quantize to 16-step palette
              const qr = Math.round(r / 16) * 16;
              const qg = Math.round(g / 16) * 16;
              const qb = Math.round(b / 16) * 16;
              const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
              colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
            }
          }
        }
      }
      currRow.copy(prevRow);
    }

    const total = width * height;
    const transparentRatio = transparentPixels / total;
    const whiteRatio = visiblePixels > 0 ? (whitePixels / visiblePixels) : 0;
    const darkRatio = visiblePixels > 0 ? (darkPixels / visiblePixels) : 0;
    const isTransparent = transparentRatio > 0.15;
    const hasWhiteElements = (isTransparent && whiteRatio > 0.10) || (whiteRatio > 0.55);

    // Find top saturated color
    const sortedColors = Object.entries(colorBuckets).sort((a, b) => b[1] - a[1]);
    const dominantColor = sortedColors.length > 0 ? sortedColors[0][0] : null;

    return {
      width,
      height,
      total,
      visiblePixels,
      transparentRatio,
      whiteRatio,
      darkRatio,
      hasWhiteElements,
      dominantColor,
      recommendedHeaderBgMode: hasWhiteElements ? "dark" : "light",
      recommendedLogoBrightness: hasWhiteElements ? "light" : "dark"
    };
  } catch (e) {
    return null;
  }
}

const leadsDir = path.join(process.cwd(), "src", "data", "leads");
const files = fs.readdirSync(leadsDir).filter(f => f.endsWith(".json"));

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(leadsDir, file);
  try {
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const slug = json.slug || file.replace(/\.json$/, "");
    const logoPng = path.join(process.cwd(), "public", "leads", slug, "logo.png");

    if (fs.existsSync(logoPng)) {
      const stats = analyzePNG(logoPng);
      if (stats) {
        let changed = false;

        if (stats.hasWhiteElements) {
          if (json.theme.headerBgMode !== "dark" || json.theme.logoBrightness !== "light") {
            json.theme.headerBgMode = "dark";
            json.theme.headerBgHex = "#0E1013";
            json.theme.logoBrightness = "light";
            changed = true;
          }
        } else {
          // Logo is dark / solid background
          if (json.theme.headerBgMode === "dark" && stats.whiteRatio < 0.15 && stats.darkRatio > 0.40) {
            json.theme.headerBgMode = "light";
            json.theme.headerBgHex = "#FFFFFF";
            json.theme.logoBrightness = "dark";
            changed = true;
          }
        }

        // Special check for professionistidelserramento or logos with dominant brand color
        if (slug === "professionistidelserramento") {
          json.theme.headerBgMode = "dark";
          json.theme.headerBgHex = "#0E1013";
          json.theme.logoBrightness = "light";
          json.theme.primaryHex = "#E31E24"; // Real red from the tie and brand
          json.theme.accentHex = "#1E293B";
          json.theme.secondaryHex = "#C4181D";
          changed = true;
        }

        if (changed) {
          fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
          console.log(`[UPDATE] ${slug}: headerBgMode=${json.theme.headerBgMode}, logoBrightness=${json.theme.logoBrightness}, whiteRatio=${Math.round(stats.whiteRatio * 100)}%`);
          updatedCount++;
        }
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

console.log(`\nUpdated ${updatedCount} leads for dynamic logo contrast.`);
