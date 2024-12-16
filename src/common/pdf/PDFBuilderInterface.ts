export interface PDFOptions {
  orientation: "portrait" | "landscape";
  format?: "a3" | "a4" | "a5" | "letter" | "legal" | "tabloid" | [number, number];
  compress?: boolean;
  fontSize?: number;
  lineSpacing?: number;
  showHeaderEveryPage?: boolean;
  includePageNumber?: boolean;
  margin?:
    | {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      }
    | number;
}

interface Canvas {
  createHorizontalLine: (pdfLine: PDFLine) => void;
  createText: (pdfTexts: PDFText[]) => void;
  createInlineTexts: (pdfTexts: PDFInlineText) => void;
  createSpace: (spaces: number) => void;
}

export interface PDFCanvas extends Canvas {
  init?: (opt: PDFOptions) => void;
  createHeader: (build: (header: PDFHeader) => void) => void;
  print?: () => void;
  getPDFBase64: () => string;
  close: () => void;
}

export type PDFHeader = Canvas;

export enum GraphicsType {
  LINE,
  TEXT,
  INLINE_TEXT,
}

export interface PDFGraphics {
  id: GraphicsType;
  data: any;
}
/**
 * @param text the text to be laid out (if array, each text will be laid out in a new line)
 * @param fontSize the font size
 * @param fontWeight the font weight
 * @param align the alignment of the text in the page
 */
export interface PDFText {
  text: string | string[];
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  align: "center" | "left" | "right";
}

export interface PDFInlineText extends PDFText {
  lineItemsAlign?: "left" | "center" | "right" | "justify";
  txtSpacing?: number;
}

export interface PDFLine {
  width: number | "full_width";
  align?: "left" | "center" | "right";
  style?: "solid" | "dotted" | "dashed";
}

export interface PDFDottedLine {
  xFrom: number;
  yFrom: number;
  xTo: number;
  yTo: number;
  width: number;
}