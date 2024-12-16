import {numberFormat} from "../../../../helper/NumberFormat";
import {PrintFooter} from "../PrintFooter";
import {PrintHeader} from "../PrintHeader";

export async function PrintPaymentType(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: any,
  initPrint: any,
  masterFiles: any
) {
  console.log(formValue);

  let arrayColumn: any = [];
  let pageBreak = 0;

  arrayColumn[0] = initPrint.LEFT;
  arrayColumn[1] = arrayColumn[0] + 40;
  arrayColumn[2] = arrayColumn[1] + 25;
  arrayColumn[3] = arrayColumn[2] + 25;
  arrayColumn[4] = arrayColumn[3] + 60;
  arrayColumn[5] = arrayColumn[4] + 7;

  jspdf.setFontSize(9);
  jspdf.setFont("NotoSansCJKtc-Regular", "normal");

  let totalAmount = 0;
  for (const xdata_val of Object.values(reportData["detailed"])) {
    const record: any = xdata_val;
    jspdf.text(record["ordocnum"], arrayColumn[0], initPrint.TOP, "left");
    jspdf.text(record["date"], arrayColumn[1], initPrint.TOP, "left");
    jspdf.text(record["time"], arrayColumn[2], initPrint.TOP, "left");
    jspdf.text(record["paymentType"], arrayColumn[3], initPrint.TOP, "left");

    if (record["refund"] === 1) {
      jspdf.text(
        `-${numberFormat(record["amount"], 2)}`,
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
    } else {
      jspdf.text(
        numberFormat(record["amount"], 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
    }
    jspdf.text(
      record["cashier"].toUpperCase(),
      arrayColumn[5],
      initPrint.TOP,
      "left"
    );

    if (record["refund"] === 1) {
      totalAmount -= parseFloat(record["amount"])
    } else {
      totalAmount += parseFloat(record["amount"]);
    }

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

    initPrint.TOP += 5;
  }

  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  jspdf.text("Total ", arrayColumn[3], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(totalAmount, 2),
    arrayColumn[4],
    initPrint.TOP,
    "right"
  );

  initPrint.TOP += 5;

  // SUMMARY
  jspdf.text("SUMMARY", arrayColumn[0], initPrint.TOP, "left");

  initPrint.TOP += 5;

  jspdf.text("PAYMENT TYPE", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text("AMOUNT", arrayColumn[1] + 25, initPrint.TOP, "right");

  initPrint.TOP += 5;

  jspdf.setFont("NotoSansCJKtc-Regular", "normal");
  totalAmount = 0;
  console.log(reportData["summary"]);

  for (const xdata_val of Object.values(reportData["summary"])) {
    let record: any = xdata_val;

    jspdf.text(record["paymentType"], arrayColumn[0], initPrint.TOP, "left");
    jspdf.text(
      numberFormat(record["amount"], 2),
      arrayColumn[1] + 25,
      initPrint.TOP,
      "right"
    );
    console.log(record);
    console.log(record["amount"]);

    totalAmount += parseFloat(record["amount"]);

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

    initPrint.TOP += 5;
  }

  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  jspdf.text("Total ", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(totalAmount, 2),
    arrayColumn[1] + 25,
    initPrint.TOP,
    "right"
  );

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
