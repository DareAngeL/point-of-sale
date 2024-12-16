import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintFooter } from "../PrintFooter";
import { PrintHeader } from "../PrintHeader";

export async function PrintVoidTransaction(
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
  arrayColumn[1] = arrayColumn[0] + 40;
  arrayColumn[2] = arrayColumn[1] + 25;
  arrayColumn[3] = arrayColumn[2] + 55;
  arrayColumn[4] = arrayColumn[3] + 25;
  arrayColumn[5] = arrayColumn[4] + 5;

  let grandTotalNet = 0;
  let grandTotalGross = 0;

  for (const record of reportData) {
    let trimText = "";
    let tablecde = record["tablecde"];
    if (jspdf.getTextWidth(tablecde.toString()) >= 23) {
      for (let cntChar = 0; cntChar < tablecde.toString().length; cntChar++) {
        if (Math.ceil(jspdf.getTextWidth(trimText.toString()) + 3) >= 23) {
          tablecde = `${trimText}...`;
          break;
        } else {
          trimText += tablecde[cntChar];
        }
      }
    }

    trimText = "";
    let voidreason = record["voidreason"] ? record["voidreason"] : "";
    if (jspdf.getTextWidth(voidreason.toString()) >= 45) {
      for (let cntChar = 0; cntChar < voidreason.toString().length; cntChar++) {
        if (Math.ceil(jspdf.getTextWidth(trimText.toString()) + 3) >= 45) {
          voidreason = `${trimText}...`;
          break;
        } else {
          trimText += voidreason[cntChar];
        }
      }
    }

    jspdf.text(
      `${record["trndte"]} ${record["logtim"]}`,
      arrayColumn[0],
      initPrint.TOP,
      "left"
    );
    jspdf.text(tablecde, arrayColumn[1], initPrint.TOP, "left");
    jspdf.text(record["ordocnum"], arrayColumn[2], initPrint.TOP, "left");
    jspdf.text(
      numberFormat(record["groext"], 2),
      arrayColumn[3],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["extprc"], 2),
      arrayColumn[4],
      initPrint.TOP,
      "right"
    );
    jspdf.text(voidreason, arrayColumn[5], initPrint.TOP, "left");

    grandTotalNet += record["extprc"];
    grandTotalGross += record["groext"];

    initPrint.TOP += 5;

    pageBreak =
      initPrint.reportSetup.orientation === "portrait"
        ? initPrint.reportSetup.format === "Letter"
          ? 260
          : 280
        : 195;
    if (initPrint.TOP > pageBreak) {
      initPrint.TOP = 10;
      jspdf.addPage();
      await PrintHeader(jspdf, reportType, formValue, initPrint, masterFiles);
      await PrintFooter(jspdf, initPrint.reportSetup, initPrint.totalPagesExp);
    }
  }

  jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
  initPrint.TOP += 3;
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");

  jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(grandTotalGross, 2),
    arrayColumn[3],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalNet, 2),
    arrayColumn[4],
    initPrint.TOP,
    "right"
  );

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
