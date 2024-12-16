import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintFooter } from "../PrintFooter";
import { PrintHeader } from "../PrintHeader";

export async function PrintHourlySales(
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
  arrayColumn[1] = arrayColumn[0] + 55;
  arrayColumn[2] = arrayColumn[1] + 30;
  arrayColumn[3] = arrayColumn[2];
  arrayColumn[4] = arrayColumn[3] + 30;
  arrayColumn[5] = arrayColumn[4] + 30;
  arrayColumn[6] = arrayColumn[5] + 30;
  arrayColumn[7] = arrayColumn[6] + 15;

  let grandTotalQty = 0;
  let grandTotalAmt = 0;
  let grandTotal = 0;
  let grandTotalTC = 0;
  let grandTotalDiscount = 0;
  let grandTotalVatadj = 0;
  let xcount_item = 1;
  for (const [keyHour, arrayHours] of Object.entries(reportData)) {
    // this.socketService.emit(
    //   "managers_finishing",
    //   `<b>Hourly Sales</b><br>Finishing ${(
    //     (xcount_item / Object.entries(reportData).length) *
    //     100
    //   ).toFixed(2)}%`
    // );
    xcount_item++;
    jspdf.setFont("NotoSansCJKtc-Regular", "bold");
    if (
      (keyHour === "00:00 - 00:59" && !formValue?.time0) ||
      (keyHour === "01:00 - 01:59" && !formValue?.time1) ||
      (keyHour === "02:00 - 02:59" && !formValue?.time2) ||
      (keyHour === "03:00 - 03:59" && !formValue?.time3) ||
      (keyHour === "04:00 - 04:59" && !formValue?.time4) ||
      (keyHour === "05:00 - 05:59" && !formValue?.time5) ||
      (keyHour === "06:00 - 06:59" && !formValue?.time6) ||
      (keyHour === "07:00 - 07:59" && !formValue?.time7) ||
      (keyHour === "08:00 - 08:59" && !formValue?.time8) ||
      (keyHour === "09:00 - 09:59" && !formValue?.time9) ||
      (keyHour === "10:00 - 10:59" && !formValue?.time10) ||
      (keyHour === "11:00 - 11:59" && !formValue?.time11) ||
      (keyHour === "12:00 - 12:59" && !formValue?.time12) ||
      (keyHour === "13:00 - 13:59" && !formValue?.time13) ||
      (keyHour === "14:00 - 14:59" && !formValue?.time14) ||
      (keyHour === "15:00 - 15:59" && !formValue?.time15) ||
      (keyHour === "16:00 - 16:59" && !formValue?.time16) ||
      (keyHour === "17:00 - 17:59" && !formValue?.time17) ||
      (keyHour === "18:00 - 18:59" && !formValue?.time18) ||
      (keyHour === "19:00 - 19:59" && !formValue?.time19) ||
      (keyHour === "20:00 - 20:59" && !formValue?.time20) ||
      (keyHour === "21:00 - 21:59" && !formValue?.time21) ||
      (keyHour === "22:00 - 22:59" && !formValue?.time22) ||
      (keyHour === "23:00 - 23:59" && !formValue?.time23)
    ) {
      continue;
    }
    jspdf.text(keyHour, arrayColumn[0], initPrint.TOP, "left");
    initPrint.TOP += 5;
    const xarrayHours: any = arrayHours;
    for (const [keyOrderType, xarrayOrderType] of Object.entries(xarrayHours)) {
      const arrayOrderType: any = xarrayOrderType;
      if (formValue?.dineType && formValue?.dineType.length > 0) {
        jspdf.text(
          masterFiles.dineType.find((e: any) => e.postypcde === keyOrderType)
            .postypdsc,
          arrayColumn[0] + 5,
          initPrint.TOP,
          "left"
        );
      } else {
        jspdf.text(keyOrderType, arrayColumn[0] + 5, initPrint.TOP, "left");
      }
      jspdf.text(
        numberFormat(arrayOrderType["qty"], 0),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(arrayOrderType["amt"], 2),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(arrayOrderType["vatadj"], 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(arrayOrderType["discount"], 2),
        arrayColumn[5],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(arrayOrderType["totalamt"], 2),
        arrayColumn[6],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(arrayOrderType["tc"], 0, false),
        arrayColumn[7],
        initPrint.TOP,
        "right"
      );
      initPrint.TOP += 5;

      grandTotalQty += parseFloat(arrayOrderType["qty"]);
      grandTotalAmt += parseFloat(arrayOrderType["amt"]);
      grandTotalDiscount += parseFloat(arrayOrderType["discount"]);
      grandTotalVatadj += parseFloat(arrayOrderType["vatadj"]);
      grandTotal += parseFloat(arrayOrderType["totalamt"]);
      grandTotalTC += parseFloat(arrayOrderType["tc"]);

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
        await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );
      }
    }
  }

  console.log("GrandTotal: ", grandTotalQty);
  

  jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
  initPrint.TOP += 3;
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");

  jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(grandTotalQty, 0),
    arrayColumn[1],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalAmt, 2),
    arrayColumn[2],
    initPrint.TOP,
    "right"
  );
  // jspdf.text('0.00', arrayColumn[3], initPrint.TOP, 'right');
  jspdf.text(
    numberFormat(grandTotalVatadj, 2),
    arrayColumn[4],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalDiscount, 2),
    arrayColumn[5],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotal, 2),
    arrayColumn[6],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalTC, 0, false),
    arrayColumn[7],
    initPrint.TOP,
    "right"
  );

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
