import jsPDF, {TextOptionsLight} from "jspdf";
import {
  PDFOptions,
  PDFCanvas,
  PDFHeader,
  PDFText,
  PDFLine,
  PDFDottedLine,
  PDFInlineText,
  GraphicsType,
  PDFGraphics,
} from "./PDFBuilderInterface";

/**
 * Use this hook to build a PDF file.
 * The pagination is automatically handled by the hook.
 */
export function usePDFBuilder() {
  
  const canvas = usePDFCanvas();

  const buildPDF = (opt: PDFOptions, build: (canvas: PDFCanvas) => void) => {
    const {init, ...tools} = canvas;
    if (init) init(opt);
    build(tools);
  };

  return {
    buildPDF,
  };

}

function usePDFCanvas(): PDFCanvas {
  let pdf: jsPDF;
  let options: PDFOptions;

  let isBuildingHeader = false;
  const header = new Array<PDFGraphics>();

  const font = "helvetica";
  const defaultFontSize = 10;
  const defaultFontWeight = "normal";
  const defaultLineSpacing = 5;
  const margins = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  };

  let occY = 10;

  const init = (opt: PDFOptions) => {
    pdf = new jsPDF({
      orientation: opt.orientation || "portrait",
      unit: "pt",
      format: Array.isArray(opt.format)
        ? opt.format.map((f) => f * 72)
        : opt.format || "letter",
    });
    pdf.setFontSize(opt.fontSize || defaultFontSize);
    pdf.setFont(font, defaultFontWeight);
    pdf.setLineHeightFactor(opt.lineSpacing || defaultLineSpacing);

    options = opt;
    const optMargin =
      typeof opt.margin === "number"
        ? {
            top: opt.margin,
            bottom: opt.margin,
            left: opt.margin,
            right: opt.margin,
          }
        : opt.margin;

    margins.left = optMargin?.left || margins.left;
    margins.right = optMargin?.right || margins.right;
    margins.top = optMargin?.top || margins.top;
    margins.bottom = optMargin?.bottom || margins.bottom;

    occY += margins.top;
  };

  /**
   * Use this to create the header of the page.
   * @param build the function that will build the header
   */
  const createHeader = (build: (header: PDFHeader) => void) => {
    isBuildingHeader = true;
    build({
      createText,
      createHorizontalLine,
      createSpace,
      createInlineTexts,
    });
    isBuildingHeader = false;
  };

  /**
   * Use this to create a single line text in the page.
   * @param pdfTexts the texts to be laid out in the page
   */
  const createText = (pdfTexts: PDFText[]) => {
    if (isBuildingHeader && options.showHeaderEveryPage) {
      header.push({
        id: GraphicsType.TEXT,
        data: pdfTexts,
      });
    }

    if (isCreateNewPage()) {
      close();
      pdf.addPage();
      options.showHeaderEveryPage && rebuildHeader();
    }

    for (const text of pdfTexts) {
      pdf.setFont(font, text.fontWeight || defaultFontWeight);
      pdf.setFontSize(text.fontSize || options.fontSize || defaultFontSize);

      const lines = Array.isArray(text.text) ? text.text : [text.text];
      const pageWidth = pdf.internal.pageSize.width;

      for (const line of lines) {
        const x =
          text.align === "center"
            ? pageWidth / 2
            : text.align === "left"
            ? margins.left
            : pageWidth - margins.right;

        pdf.text(line || "", x || margins.left, occY, {
          align: text.align,
        } as TextOptionsLight);

        occY +=
          (text.fontSize || defaultFontSize) +
          (options.lineSpacing || defaultLineSpacing);
      }
    }
  };

  /**
   * Use this to create an inline set of texts in the page.
   * @param {
   *  text: string | string[]; - the texts to be laid out in a single line <----->
   *  fontSize?: number; - the font size <----->
   *  fontWeight?: "normal" | "bold"; - the font weight <----->
   *  align: "center" | "left" | "right"; - the text alignment <----->
   *  lineItemsAlign?: "left" | "center" | "right" | "justify"; - the alignment of all texts in the line <----->
   *  txtSpacing?: number; - the spacing between each text (only works if the lineItemsAlign is not "justify")
   * }
   */
  const createInlineTexts = ({
    text,
    align,
    lineItemsAlign,
    txtSpacing,
    fontSize,
    fontWeight,
  }: PDFInlineText) => {
    // if this is for the header, store the data to rebuild the header later every after new page
    if (isBuildingHeader && options.showHeaderEveryPage) {
      header.push({
        id: GraphicsType.INLINE_TEXT,
        data: {
          text,
          align,
          lineItemsAlign,
          txtSpacing,
          fontSize,
          fontWeight,
        } as PDFInlineText,
      });
    }

    if (isCreateNewPage()) {
      close();
      pdf.addPage();
      options.showHeaderEveryPage && rebuildHeader();
    }

    pdf.setFont(font, fontWeight || defaultFontWeight);
    pdf.setFontSize(fontSize || options.fontSize || defaultFontSize);

    const cols = Array.isArray(text) ? text : [text];
    const pageWidth = pdf.internal.pageSize.width;
    let largestTextH = 0;

    if (lineItemsAlign && lineItemsAlign !== "justify") {
      let newTxt = "";
      const txtXSpacing = txtSpacing || 0;

      for (const txt of cols) {
        switch (align) {
          case "center":
            newTxt +=
              " ".repeat(txtXSpacing / 2) + txt + " ".repeat(txtXSpacing / 2);
            break;
          case "left":
            newTxt += txt + " ".repeat(txtXSpacing);
            break;
          case "right":
            newTxt += " ".repeat(txtXSpacing) + txt;
            break;
        }
      }

      const txtWidth =
        pdf.getStringUnitWidth(newTxt) *
        (fontSize || options.fontSize || defaultFontSize);

      const lineAlignment = {
        center: pageWidth / 2 - txtWidth / 2,
        left: margins.left,
        right: pageWidth - margins.right - txtWidth,
      };
      const x = lineAlignment[lineItemsAlign || "left"];

      pdf.text(newTxt, x, occY);
      
    } else {
      const availableWArea = pageWidth - margins.left - margins.right;
      const txtPlacement = (margins.left + availableWArea - margins.right) / cols.length;

      const lineAlignment = {
        center: margins.left + (txtPlacement / 2),
        left: margins.left,
        right: margins.left + txtPlacement,
      };

      let xoffset = lineAlignment[align || "left"];

      for (let i = 0; i < cols.length; i++) {
        const textOpts: TextOptionsLight = {
          align: align,
          maxWidth: txtPlacement,
          lineHeightFactor: 1.2,
        }
        pdf.text(cols[i], xoffset, occY, textOpts);

        const fSize = fontSize || options.fontSize || defaultFontSize;

        const tmppdf = new jsPDF({
          orientation: options.orientation,
          unit: "px",
          format: "letter",
        });
        tmppdf.setFont(font, fontWeight || defaultFontWeight);
        tmppdf.setFontSize(fSize);

        tmppdf.text(cols[i], xoffset, occY, textOpts);

        const txtW = pdf.getTextWidth(cols[i]);
        const lines = Math.ceil(txtW / txtPlacement);
        
        const lineH = (fontSize || options.fontSize || defaultFontSize) + (options.lineSpacing || defaultLineSpacing) - 2;
        
        const cellH = lineH * (Math.round(lines+1))

        if (cellH > largestTextH) {
          largestTextH = cellH;
        }

        xoffset += txtPlacement;
      }
    }

    if (isBuildingHeader && options.showHeaderEveryPage) {
      occY += (fontSize || options.fontSize || defaultFontSize) + (options.lineSpacing || defaultLineSpacing);
    } else {
      occY +=
        /**/largestTextH +
        (options.lineSpacing || defaultLineSpacing);
    }
  };

  /**
   * Use this to create a line in the page.
   * @param param0
   */
  const createHorizontalLine = ({width, align, style}: PDFLine) => {
    if (isBuildingHeader && options.showHeaderEveryPage) {
      header.push({
        id: GraphicsType.LINE,
        data: {
          width,
          align,
          style,
        } as PDFLine,
      });
    }

    let fromX = margins.left;
    if (width !== "full_width") {
      const pageWidth = pdf.internal.pageSize.width;
      const alignments = {
        center: pageWidth / 2,
        left: margins.left,
        right: pageWidth - margins.right - width,
      };
      fromX = alignments[align || "left"];
    }

    fromX =
      typeof width === "number"
        ? align === "center"
          ? fromX - width / 2
          : fromX
        : fromX;

    const toX =
      typeof width === "number"
        ? fromX + width
        : pdf.internal.pageSize.width - margins.right;

    const fontSize = options.fontSize || defaultFontSize;

    const xFrom = fromX,
      xTo = toX,
      yFrom = occY - fontSize / 2,
      yTo = occY - fontSize / 2;

    if (!style || style === "solid") {
      pdf.line(xFrom, yFrom, xTo, yTo);
    } else {
      createDottedLine({
        width: style === "dotted" ? 2 : 5,
        xFrom: fromX,
        xTo: toX,
        yFrom: yFrom,
        yTo: yTo,
      });
    }

    occY += fontSize / 2 + (options.lineSpacing || defaultLineSpacing);
  };

  /**
   * Use this to create a dotted line in the page.
   * @param param0
   */
  const createDottedLine = ({xFrom, yFrom, xTo, yTo, width}: PDFDottedLine) => {
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
  };

  /**
   * Use this to leave the current line blank or leave a space in the current line in the page.
   */
  const createSpace = (spaces: number) => {
    for (let i = 0; i < spaces; i++) {
      occY +=
        (options.fontSize || defaultFontSize) +
        (options.lineSpacing || defaultLineSpacing);
    }
  };

  const isCreateNewPage = () => {
    const currPageAvailHArea =
      10 + pdf.internal.pageSize.height - margins.bottom - occY;

    return currPageAvailHArea < (options.fontSize || defaultFontSize);
  };

  const embedPageNumber = () => {
    pdf.setFontSize(8);
    pdf.setFont(font, "normal");

    pdf.text(
      `Page ${pdf.getNumberOfPages()}`,
      pdf.internal.pageSize.width - 20,
      15,
      {
        align: "right",
      }
    );
  };

  const rebuildHeader = () => {
    console.log(header);
    if (header.length > 0) {
      for (const item of header) {
        switch (item.id) {
          case GraphicsType.INLINE_TEXT:
            createInlineTexts(item.data);
            break;
          case GraphicsType.TEXT:
            createText(item.data);
            break;
          case GraphicsType.LINE:
            createHorizontalLine(item.data);
            break;
        }
      }
    }
  };

  const print = () => {
    window.open(pdf.output("bloburl"), "_blank");
  };

  const getPDFBase64 = () => {
    return pdf.output("datauristring");
  };

  /**
   * Closes the operation for the current active page.
   */
  const close = () => {
    occY = 10 + margins.top;
    if (options.includePageNumber)
      embedPageNumber();
  };

  return {
    init,
    createHeader,
    createText,
    createHorizontalLine,
    createInlineTexts,
    createSpace,
    print,
    getPDFBase64,
    close,
  };
}
