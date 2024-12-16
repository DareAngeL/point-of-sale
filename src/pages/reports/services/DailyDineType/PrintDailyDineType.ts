import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintFooter } from "../PrintFooter";
import { PrintHeader } from "../PrintHeader";

export async function PrintDailyDineType(
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
  arrayColumn[2] = arrayColumn[1] + 30;
  arrayColumn[3] = arrayColumn[2];
  arrayColumn[4] = arrayColumn[3] + 30;
  arrayColumn[5] = arrayColumn[4] + 30;
  arrayColumn[6] = arrayColumn[5] + 30;

  let grandTotalQty = 0;
  let grandTotalAmt = 0;
  let grandTotal = 0;
  let grandTotalDiscount = 0;
  let grandTotalVatadj = 0;

  let xcount_item = 1;
  for (const [keyDineType, arrayDineType] of Object.entries(reportData)) {
    // this.socketService.emit(
    //   "managers_finishing",
    //   `<b>Daily Dine Type</b><br>Finishing ${(
    //     (xcount_item / Object.entries(reportData).length) *
    //     100
    //   ).toFixed(2)}%`
    // );
    xcount_item++;
    jspdf.setFont("NotoSansCJKtc-Regular", "bold");
    let xdineType =
      formValue?.dineType && formValue?.dineType.length > 0
        ? masterFiles.dineType.find((e: any) => e.postypcde === keyDineType)
            .postypdsc
        : keyDineType;
    jspdf.text(xdineType, arrayColumn[0] + 5, initPrint.TOP, "left");
    initPrint.TOP += 5;

    let subTotalQty = 0;
    let subTotalAmt = 0;
    let subTotal = 0;
    let subTotalDiscount = 0;
    let subTotalVatadj = 0;
    const xarrayDineType: any = arrayDineType;
    for (const xdata_val of Object.values(xarrayDineType)) {
      const item: any = xdata_val;
      console.log("item: ", item);
      
      let value = item["itmdsc"];
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
      var xsplitText = jspdf.splitTextToSize(value.toString(), 40);
      var xincTOP = 0;
      for (var xi = 0; xi < xsplitText.length; xi++) {
        jspdf.text(
          xsplitText[xi],
          arrayColumn[0] + 10,
          initPrint.TOP + xincTOP
        );
        if (xsplitText.length > 1) {
          xincTOP += 5;
        }
      }
      jspdf.text(
        numberFormat(item["qty"], 0),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(item["amount"], 2),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(item["vatadj"], 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(item["discount"], 2),
        arrayColumn[5],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(item["total"], 2),
        arrayColumn[6],
        initPrint.TOP,
        "right"
      );

      if (xincTOP != 0) {
        initPrint.TOP += xincTOP;
      } else {
        initPrint.TOP += 5;
      }

      subTotalQty += Number(parseFloat(item["qty"]));
      subTotalAmt += Number(parseFloat(item["amount"]));
      subTotalDiscount += Number(parseFloat(item["discount"]));
      subTotalVatadj += Number(parseFloat(item["vatadj"]));
      subTotal += Number(parseFloat(item["total"]));
      grandTotalQty += Number(parseFloat(item["qty"]));
      grandTotalAmt += Number(parseFloat(item["amount"]));
      grandTotalDiscount += Number(parseFloat(item["discount"]));
      grandTotalVatadj += Number(parseFloat(item["vatadj"]));
      grandTotal += Number(parseFloat(item["total"]));

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

    jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
    initPrint.TOP += 3;
    jspdf.setFont("NotoSansCJKtc-Regular", "bold");

    jspdf.text("SUBTOTAL", arrayColumn[0] + 10, initPrint.TOP, "left");
    jspdf.text(
      numberFormat(subTotalQty, 0),
      arrayColumn[1],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(subTotalAmt, 2),
      arrayColumn[2],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(subTotalVatadj, 2),
      arrayColumn[4],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(subTotalDiscount, 2),
      arrayColumn[5],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(subTotal, 2),
      arrayColumn[6],
      initPrint.TOP,
      "right"
    );
    initPrint.TOP += 8;

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

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
