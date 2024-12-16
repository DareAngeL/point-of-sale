import {numberFormat} from "../../../../helper/NumberFormat";
import {PaperFormat} from "../../enums/report";
import {PrintFooter} from "../PrintFooter";
import {PrintHeader} from "../PrintHeader";

export async function PrintRefundTransaction(
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
  arrayColumn[2] = arrayColumn[1] + 50;
  arrayColumn[3] = arrayColumn[2] + 35;
  arrayColumn[4] = arrayColumn[3] + 65;
  arrayColumn[5] = arrayColumn[4] + 35;
  arrayColumn[6] = arrayColumn[5] + 15;

  let grandRefTotalNet = 0;
  let grandRefTotalGross = 0;

  console.log("eto na");

  console.log(reportData);

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
    let refundreason = record["refundreason"] ? record["refundreason"] : "";
    if (jspdf.getTextWidth(refundreason.toString()) >= 45) {
      for (
        let cntChar = 0;
        cntChar < refundreason.toString().length;
        cntChar++
      ) {
        if (Math.ceil(jspdf.getTextWidth(trimText.toString()) + 3) >= 45) {
          refundreason = `${trimText}...`;
          break;
        } else {
          trimText += refundreason[cntChar];
        }
      }
    }

    jspdf.text(
      `${record["trndte"]} ${record["logtim"]}`,
      arrayColumn[0],
      initPrint.TOP,
      "left"
    );
    jspdf.text(
      `${record["refunddte"]} ${record["refundlogtim"]}`,
      arrayColumn[1],
      initPrint.TOP,
      "left"
    );
    jspdf.text(tablecde, arrayColumn[2], initPrint.TOP, "left");
    jspdf.text(record["ordocnum"], arrayColumn[3], initPrint.TOP, "left");
    jspdf.text(
      numberFormat(record["groext"], 2),
      arrayColumn[4],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(record["extprc"], 2),
      arrayColumn[5],
      initPrint.TOP,
      "right"
    );
    jspdf.text(refundreason, arrayColumn[6], initPrint.TOP, "left");

    grandRefTotalNet += parseFloat(record["extprc"]);
    grandRefTotalGross += parseFloat(record["groext"]);

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

  jspdf.line(
    10,
    initPrint.TOP,
    initPrint.reportSetup.orientation === "portrait"
      ? 205
      : initPrint.reportSetup.format === PaperFormat.Letter
      ? 285
      : 320,
    initPrint.TOP
  );
  initPrint.TOP += 3;
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");

  jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(grandRefTotalGross, 2),
    arrayColumn[4],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandRefTotalNet, 2),
    arrayColumn[5],
    initPrint.TOP,
    "right"
  );

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
