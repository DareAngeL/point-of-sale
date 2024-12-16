import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintFooter } from "../PrintFooter";
import { PrintHeader } from "../PrintHeader";

export async function PrintCostAndProfit(
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
  arrayColumn[1] = arrayColumn[0] + 70;
  arrayColumn[2] = arrayColumn[1] + 27;
  arrayColumn[3] = arrayColumn[2];
  arrayColumn[4] = arrayColumn[3] + 27;
  arrayColumn[5] = arrayColumn[4] + 27;
  arrayColumn[6] = arrayColumn[5] + 27;
  arrayColumn[7] = arrayColumn[6] + 32;
  arrayColumn[8] = arrayColumn[7] + 32;
  arrayColumn[9] = arrayColumn[8] + 27;
  arrayColumn[10] = arrayColumn[9] + 27;
  arrayColumn[11] = arrayColumn[10] + 27;

  jspdf.setFontSize(10);
  jspdf.setFont("NotoSansCJKtc-Regular", "normal");
  if (formValue?.dineType && formValue?.dineType.length > 0) {
    for (const [keyDine, arrayDine] of Object.entries(reportData)) {
      jspdf.text(
        masterFiles.dineType.find((e: any) => e.postypcde === keyDine)
          .postypdsc,
        arrayColumn[0],
        initPrint.TOP,
        "left"
      );
      initPrint.TOP += 5;
      const xarrayDine: any = arrayDine;
      for (const xdata_val of Object.values(xarrayDine)) {
        const record: any = xdata_val;
        const averageSalesAmt = record["total"] / record["qty"];
        const averageProfit = record["total"] / record["qty"] - record["cost"];
        const profitPercentage =
          averageProfit > 0 ? (averageProfit / averageSalesAmt) * 100 : 0;
        jspdf.text(record["itmdsc"], arrayColumn[0] + 5, initPrint.TOP, "left");
        jspdf.text(
          numberFormat(record["qty"], 0),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(record["amount"], 2),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(record["vatadj"], 2),
          arrayColumn[4],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(record["discount"], 2),
          arrayColumn[5],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(record["regdiscount"], 2),
          arrayColumn[6],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(record["total"], 2),
          arrayColumn[7],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(averageSalesAmt, 2),
          arrayColumn[8],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(record["cost"], 2),
          arrayColumn[9],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(averageProfit, 2),
          arrayColumn[10],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(profitPercentage, 2),
          arrayColumn[11],
          initPrint.TOP,
          "right"
        );

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
          await PrintHeader(
            jspdf,
            reportType,
            formValue,
            initPrint,
            masterFiles
          );
          await PrintFooter(
            jspdf,
            initPrint.reportSetup,
            initPrint.totalPagesExp
          );
        }
      }
    }

    if (typeof jspdf.putTotalPages === "function") {
      jspdf.putTotalPages(initPrint.totalPagesExp);
    }
  } else {
    console.log("reportData: ", reportData);

    for (const xdata_val of Object.values(reportData)) {
      const record: any = xdata_val;
      const averageSalesAmt = record["total"] / record["qty"];
      const averageProfit = record["total"] / record["qty"] - record["cost"];
      const profitPercentage =
        averageProfit > 0 ? (averageProfit / averageSalesAmt) * 100 : 0;
      jspdf.text(record["itmdsc"], arrayColumn[0], initPrint.TOP, "left");
      jspdf.text(
        numberFormat(record["qty"], 0),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(record["amount"], 2),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(record["vatadj"], 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(record["discount"], 2),
        arrayColumn[5],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(record["regdiscount"], 2),
        arrayColumn[6],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(record["total"], 2),
        arrayColumn[7],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(averageSalesAmt, 2),
        arrayColumn[8],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(record["cost"], 2),
        arrayColumn[9],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(averageProfit, 2),
        arrayColumn[10],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(profitPercentage, 2),
        arrayColumn[11],
        initPrint.TOP,
        "right"
      );

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
        await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );
      }
    }

    if (typeof jspdf.putTotalPages === "function") {
      jspdf.putTotalPages(initPrint.totalPagesExp);
    }
  }

  return jspdf;
}
