import jsPDF from "jspdf";
import { Alignment } from "../../enums/report";

interface XZTextTypes {
  str: string;
  alignment: Alignment;
  adjustLeftMargin?: number;
}

export interface XZReportData {
  label: string;
  subLbls?: string | Array<any>;
  qty?: number;
  value: string;
  isSubItem?: boolean | false;
}

export interface XZReportHeader {
  [key: string]: string;
  business1: string,
  // business2: string,
  business3: string,
  tin: string,
  address1: string,
  address2: string,
  address3: string,
  machserlno: string,
  title: string,
  date: string,
}

export function useXZPDFReportBuilder() {

  const verticalSpacing = 5;
  const margin = 20;
  const font = "helvetica";
  const defaultFontSize = 10;
  const defaultFontWeight = "normal";
  const mainLblFontSize = 12;
  const mainLblFontWeight = "bold";

  let totalOccupiedWidth = 0;
  let totalOccupiedHeight = margin;

  let header: XZReportHeader = {
    business1: "",
    business2: "",
    business3: "",
    tin: "",
    address1: "",
    address2: "",
    address3: "",
    machserlno: "",
    title: "",
    date: ""
  };

  const isNewPage = (pdf: jsPDF) => {

    const pageHeight = pdf.internal.pageSize.height;
    const threshold = margin * 2;

    const bool = pageHeight - totalOccupiedHeight <= threshold;
    if (bool) {
      totalOccupiedHeight = margin;
    }

    return bool;
  }

  const reset = () => {
    totalOccupiedWidth = 0;
    totalOccupiedHeight = margin;
  }

  const Tool = () => {

    /**
     * Creates the header of the report
     * @param pdf the jsPDF instance
     * @param reportHeaderData the data to be used in the header
     */
    const createHeader = (pdf: jsPDF, reportHeaderData: XZReportHeader) => {
      pdf.setFontSize(10);
      pdf.setFont(font, "bold");

      header = reportHeaderData;
  
      for (const key in reportHeaderData) {
        const text = reportHeaderData[key];
        if (!text) continue;

        if (key === "title") {
          createText(
            pdf,
            text,
            mainLblFontSize,
            Alignment.CENTER,
            mainLblFontWeight,
            { top: 1, bottom: 0 }
          );

          continue;
        } else if (key === "date") {
          createText(
            pdf,
            text,
            mainLblFontSize,
            Alignment.CENTER,
            mainLblFontWeight,
            { top: 1, bottom: 1 }
          );
          continue;
        }
        
        createText(pdf, text, defaultFontSize, Alignment.CENTER);
      }
    };

    /**
     * Layout all texts in a single line
     * @param pdf the jsPDF instance
     * @param texts the texts to be laid out 
     * @param size the font size
     */
    const createInlineText = (pdf: jsPDF, texts: XZTextTypes[], size: number) => {

      if (isNewPage(pdf)) { 
        pdf.addPage();
        createHeader(pdf, header);
      }

      pdf.setFontSize(size);
      pdf.setFont(font, "normal");
  
      const y = totalOccupiedHeight;
      const txtHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
  
      for (const { str, alignment, adjustLeftMargin } of texts) {
        
        const txtWidth =
          (pdf.getStringUnitWidth(str) * pdf.getFontSize()) /
          pdf.internal.scaleFactor;

        const textX =
          alignment === Alignment.CENTER
            ? pdf.internal.pageSize.width / 2 - txtWidth / 2
            : alignment === Alignment.LEFT
            ? adjustLeftMargin
              ? adjustLeftMargin +
                (pdf.internal.pageSize.width / 2 - totalOccupiedWidth / 2 - 20)
              : pdf.internal.pageSize.width / 2 - totalOccupiedWidth / 2 - 20
            : (pdf.internal.pageSize.width / 2) +
              totalOccupiedWidth / 2 -
              txtWidth +
              20;
  
        pdf.text(str, textX, y);
      }
  
      totalOccupiedHeight += (txtHeight + verticalSpacing) * 0.75;
    };

    /**
     * Create a single text in a single line
     * @param pdf the jsPDF instance
     * @param text the text to be laid out
     * @param size the font size
     * @param alignment the alignment of the text 
     * @param weight the font weight
     * @param borderTB the border top and bottom
     * @param adjustLeftMargin the left margin (only applies if the alignment is left)
     */
    const createText = (
      pdf: jsPDF,
      text: string,
      size: number,
      alignment?: Alignment | Alignment.CENTER,
      weight?: string | "bold",
      borderTB?: { top: number; bottom: number },
      adjustLeftMargin?: number
    ) => {

      if (isNewPage(pdf)) { 
        pdf.addPage();
        createHeader(pdf, header);
      }

      pdf.setFontSize(size);
      pdf.setFont(font, weight);
  
      const dottedLineFromX =
        pdf.internal.pageSize.width / 2 - totalOccupiedWidth / 2 - 20;
      const dottedLineToX = dottedLineFromX + totalOccupiedWidth + 20 * 2;
  
      if (borderTB?.top && borderTB?.top > 0) {
        dottedLine(
          pdf,
          dottedLineFromX,
          totalOccupiedHeight,
          dottedLineToX,
          totalOccupiedHeight,
          2
        );
      }
  
      const y = totalOccupiedHeight;
  
      const txtWidth =
        (pdf.getStringUnitWidth(text) * pdf.getFontSize()) /
        pdf.internal.scaleFactor;
      const txtHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
      const textX =
          alignment === Alignment.CENTER
            ? pdf.internal.pageSize.width / 2 - txtWidth / 2
            : alignment === Alignment.LEFT
            ? adjustLeftMargin
              ? adjustLeftMargin +
                (pdf.internal.pageSize.width / 2 - totalOccupiedWidth / 2 - 20)
              : pdf.internal.pageSize.width / 2 - totalOccupiedWidth / 2 - 20
            : (pdf.internal.pageSize.width / 2) +
              totalOccupiedWidth / 2 -
              txtWidth +
              20;
  
      pdf.text(text, textX, y);
      totalOccupiedWidth = Math.max(totalOccupiedWidth, txtWidth);
      totalOccupiedHeight += (txtHeight + verticalSpacing) * 0.75;
  
      if (borderTB?.bottom && borderTB?.bottom > 0) {
        dottedLine(
          pdf,
          dottedLineFromX,
          totalOccupiedHeight,
          dottedLineToX,
          totalOccupiedHeight,
          2
        );
      }
    };

    /**
     * Layout a list of texts
     * @param pdf the jsPDF instance
     * @param texts the list of texts to be laid out
     * @param size the font size
     */
    const createItems = (pdf: jsPDF, texts: XZTextTypes[][], size: number) => {
      // loop data
      for (const text of texts) {
        createInlineText(pdf, text, size);
      }
    };

    const separator = (pdf: jsPDF) => {
      const dottedLineFromX =
        pdf.internal.pageSize.width / 2 - totalOccupiedWidth / 2 - 20;
      const dottedLineToX = dottedLineFromX + totalOccupiedWidth + 20 * 2;

      dottedLine(
        pdf,
        dottedLineFromX,
        totalOccupiedHeight,
        dottedLineToX,
        totalOccupiedHeight,
        2
      );
    }

    const dottedLine = (
      pdf: jsPDF,
      xFrom: number,
      yFrom: number,
      xTo: number,
      yTo: number,
      width: number,
    ) => {
      // calculate line length (c)
      const a = Math.abs(xTo - xFrom);
      const b = Math.abs(yTo - yFrom);
      const c = Math.sqrt(a * a + b * b);
  
      // make sure na merong odd number (drawn or blank) para ma fit ng maayos
      const fractions = c / width;
      const adjustedWidth =
        ((Math.floor(fractions) % 2 === 0
          ? Math.ceil(fractions)
          : Math.floor(fractions)) *
          width) /
        fractions;
      const segments = c / adjustedWidth;
  
      // calculate x, y deltas per segment
      const deltaX = adjustedWidth * (a / c);
      const deltaY = adjustedWidth * (b / c);
  
      let currX = xFrom,
        currY = yFrom;
  
      let draw = true; // gamit para sa pag toggle kung draw or not (gap)
  
      for (let i = 0; i < segments; i++) {
        if (draw) {
          pdf.line(currX, currY, currX + deltaX, currY + deltaY);
        }
  
        currX += deltaX;
        currY += deltaY;
        draw = !draw;
      }
  
      totalOccupiedHeight +=
        pdf.getLineHeight() / pdf.internal.scaleFactor + verticalSpacing;
    };

    return {
      separator,
      createText,
      createInlineText,
      createItems,
      createHeader,
    }
  }

  return {
    defaultFontSize,
    defaultFontWeight,
    mainLblFontSize,
    mainLblFontWeight,
    reset,
    Tool,
  };
}