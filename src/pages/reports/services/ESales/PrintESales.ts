import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintFooter } from "../PrintFooter";
import { PrintHeader } from "../PrintHeader";

export async function PrintESales(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: any,
  initPrint: any,
  masterFiles: any
) {
  let arrayColumn: any = [];
  let pageBreak = 0;

  arrayColumn[0] = initPrint.LEFT;
  arrayColumn[1] = arrayColumn[0] + 50;
  arrayColumn[2] = arrayColumn[1];
  arrayColumn[3] = arrayColumn[2] + 25;
  arrayColumn[4] = arrayColumn[3] + 25;
  arrayColumn[5] = arrayColumn[4] + 25;
  arrayColumn[6] = arrayColumn[5] + 27.5;
  arrayColumn[7] = arrayColumn[6] + 22.5;
  arrayColumn[8] = arrayColumn[7] + 25;
  arrayColumn[9] = arrayColumn[8] + 27.5;
  arrayColumn[10] = arrayColumn[9] + 27.5;
  arrayColumn[11] = arrayColumn[10] + 10;
  arrayColumn[12] = arrayColumn[11] + 37.5;

  jspdf.setFontSize(9);
  for (const xdata_val of Object.values(reportData)) {
    const record: any = xdata_val;
    jspdf.text(record["date"], arrayColumn[0], initPrint.TOP, "left");
    jspdf.text(
      numberFormat(record["grossSales"], 2),
      arrayColumn[1],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["vatAdj"], 2),
      arrayColumn[3],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["govDiscount"], 2),
      arrayColumn[4],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["regDiscount"], 2),
      arrayColumn[5],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["totalSales"], 2),
      arrayColumn[6],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["vatableSales"], 2),
      arrayColumn[7],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["vatAmount"], 2),
      arrayColumn[8],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["vatZeroRated"], 2),
      arrayColumn[9],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["vatExemptSales"], 2),
      arrayColumn[10],
      initPrint.TOP,
      "right"
    );
    jspdf.text(record["begOR"], arrayColumn[11], initPrint.TOP, "left");
    jspdf.text(record["endOR"], arrayColumn[12], initPrint.TOP, "left");

    initPrint.TOP += 5;

    pageBreak =
      initPrint.reportSetup.orientation === "portrait"
        ? initPrint.reportSetup.format === "Letter"
          ? 280
          : 300
        : 195;
    if (initPrint.TOP > pageBreak) {
      initPrint.TOP = 10;
      jspdf.addPage();
      await PrintHeader(jspdf, reportType, formValue, initPrint, masterFiles);
      await PrintFooter(jspdf, initPrint.reportSetup, initPrint.totalPagesExp);
    }
  }

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
