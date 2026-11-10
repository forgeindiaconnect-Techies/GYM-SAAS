declare function qrcode(
  typeNumber: number,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
): QRCodeInstance;

export interface QRCodeInstance {
  addData(data: string, mode?: string): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
  createDataURL(cellSize?: number, margin?: number): string;
  createImgTag(cellSize?: number, margin?: number, alt?: string): string;
  createSvgTag(cellSize?: number, margin?: number): string;
  createASCII(cellSize?: number, margin?: number): string;
}

export default qrcode;

