import { PaperFormat } from "../enums/report";

export async function PrintFooter(
  jspdf: any,
  reportSetup: any,
  totalPagesExp: any
) {
  let str = "Page " + jspdf.internal.getNumberOfPages();
  if (typeof jspdf.putTotalPages === "function") {
    str = str + " of " + totalPagesExp; // Total page number plugin only available in jspdf v1.0+
  }
  const footerTop =
    reportSetup.format === PaperFormat.Letter
      ? reportSetup.orientation === "portrait"
        ? 270
        : 180
      : reportSetup.orientation === "portrait"
      ? 300
      : 210;
  const footerLeft =
    reportSetup.format === PaperFormat.Letter
      ? reportSetup.orientation === "portrait"
        ? 110
        : 145
      : reportSetup.orientation === "portrait"
      ? 110
      : 170;

  jspdf.text(str, footerLeft, footerTop, "center");

  return jspdf;
}
