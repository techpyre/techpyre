import fs from "fs";
import path from "path";
import { parsePngRgba } from "../src/lib/pngCodec.mjs";

function analyzePNG(filePath) {
  try {
    const parsed = parsePngRgba(fs.readFileSync(filePath));
    if (!parsed) return null;
    const { width, height, pixels } = parsed;
    const total = width * height;
    if (total === 0) return null;

    let visiblePixels = 0;
    let whitePixels = 0;
    let darkPixels = 0;
    let transparentPixels = 0;
    const colorBuckets = {};

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
        } else if (lum < 0.3) {
          darkPixels++;
        } else {
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max - min > 30) {
            const qr = Math.round(r / 16) * 16;
            const qg = Math.round(g / 16) * 16;
            const qb = Math.round(b / 16) * 16;
            const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
            colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
          }
        }
      }
    }

    const transparentRatio = transparentPixels / total;
    const whiteRatio = visiblePixels > 0 ? whitePixels / visiblePixels : 0;
    const darkRatio = visiblePixels > 0 ? darkPixels / visiblePixels : 0;
    const isTransparent = transparentRatio > 0.15;
    const hasWhiteElements = isTransparent && whiteRatio > 0.15;

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
    };
  } catch {
    return null;
  }
}

const leadsDir = path.join(process.cwd(), "src", "data", "leads");
const files = fs.existsSync(leadsDir)
  ? fs.readdirSync(leadsDir).filter((f) => f.endsWith(".json"))
  : [];

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
        const isMedical = json.archetype === "medical-clinic";

        if (stats.hasWhiteElements && !isMedical) {
          if (json.theme.headerBgMode !== "dark" || json.theme.logoBrightness !== "light") {
            json.theme.headerBgMode = "dark";
            json.theme.headerBgHex = "#0E1013";
            json.theme.logoBrightness = "light";
            changed = true;
          }
        } else if (json.theme.headerBgMode !== "light" || json.theme.logoBrightness !== "dark") {
          json.theme.headerBgMode = "light";
          json.theme.headerBgHex = isMedical ? "#FAF8F5" : "#FFFFFF";
          json.theme.logoBrightness = "dark";
          changed = true;
        }

        if (changed) {
          fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
          console.log(`[UPDATE] ${slug}: headerBgMode=${json.theme.headerBgMode}, logoBrightness=${json.theme.logoBrightness}`);
          updatedCount++;
        }
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

console.log(`\nUpdated ${updatedCount} leads for refined logo contrast.`);
