import fs from "node:fs";
import sharp from "sharp";
import opentype from "opentype.js";

async function buildAllFavicons() {
  const fontBuffer = fs.readFileSync("/System/Library/Fonts/Supplemental/Arial Bold.ttf");
  const font = opentype.parse(fontBuffer.buffer);

  const fontSize = 350;
  const gap = 16;
  const targetSize = 512;
  const cornerRadius = 80;
  const borderWidth = 16;

  const tRaw = font.getPath("t", 0, 0, fontSize);
  const pRaw = font.getPath("P", 0, 0, fontSize);

  const tBox = tRaw.getBoundingBox();
  const pBox = pRaw.getBoundingBox();

  const tWidth = tBox.x2 - tBox.x1;
  const pWidth = pBox.x2 - pBox.x1;
  const totalWidth = tWidth + gap + pWidth;

  const minY = Math.min(tBox.y1, pBox.y1);
  const maxY = Math.max(tBox.y2, pBox.y2);
  const totalHeight = maxY - minY;

  const startX = (targetSize - totalWidth) / 2 - tBox.x1;
  const startY = (targetSize - totalHeight) / 2 - minY;

  const tPathFinal = font.getPath("t", startX, startY, fontSize);
  const pStartX = startX + tBox.x2 + gap - pBox.x1;
  const pPathFinal = font.getPath("P", pStartX, startY, fontSize);

  const tSvgPath = tPathFinal.toPathData(2);
  const pSvgPath = pPathFinal.toPathData(2);

  const svgContent = `<svg width="${targetSize}" height="${targetSize}" viewBox="0 0 ${targetSize} ${targetSize}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${targetSize}" height="${targetSize}" rx="${cornerRadius}" fill="#F8F7F4" stroke="#C5A059" stroke-width="${borderWidth}"/>
  <path d="${tSvgPath}" fill="#0B1E36"/>
  <path d="${pSvgPath}" fill="#B8860B"/>
</svg>`;

  fs.writeFileSync("src/app/icon.svg", svgContent.trim());
  fs.writeFileSync("public/icon.svg", svgContent.trim());

  const svgBuffer = Buffer.from(svgContent);
  const p16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const p32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const p48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const p180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const p192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const p512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  fs.writeFileSync("src/app/apple-icon.png", p180);
  fs.writeFileSync("public/apple-touch-icon.png", p180);
  fs.writeFileSync("public/icon-192.png", p192);
  fs.writeFileSync("public/icon-512.png", p512);

  const images = [
    { width: 16, height: 16, buffer: p16 },
    { width: 32, height: 32, buffer: p32 },
    { width: 48, height: 48, buffer: p48 },
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
  fs.writeFileSync("src/app/favicon.ico", icoBuffer);
  fs.writeFileSync("public/favicon.ico", icoBuffer);
  console.log("All favicons generated successfully.");
}

buildAllFavicons().catch(console.error);
