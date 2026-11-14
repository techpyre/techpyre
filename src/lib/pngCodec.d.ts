export interface ParsedPngRgba {
  width: number;
  height: number;
  colorType: number;
  bitDepth: number;
  pixels: Buffer;
}

export function crc32(buf: Buffer): number;
export function parsePngRgba(buf: Buffer): ParsedPngRgba | null;
export function encodeRgbaPng(
  width: number,
  height: number,
  rgbaPixels: Buffer
): Buffer;
