import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintFooter } from "../PrintFooter";
import { PrintHeader } from "../PrintHeader";

export async function PrintClassAndSubClass(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: any,
  initPrint: any,
  masterFiles: any
) {
  let arrayColumn: any = [];
  arrayColumn[0] = initPrint.LEFT;
  arrayColumn[1] = arrayColumn[0] + 72;
  arrayColumn[2] = arrayColumn[1] + 23;
  arrayColumn[3] = arrayColumn[2];
  arrayColumn[4] = arrayColumn[3] + 27;
  arrayColumn[5] = arrayColumn[4] + 27;
  arrayColumn[6] = arrayColumn[5] + 27;
  arrayColumn[7] = arrayColumn[6] + 30;
  arrayColumn[8] = arrayColumn[7] + 30;
  arrayColumn[9] = arrayColumn[8] + 30;
  arrayColumn[10] = arrayColumn[9] + 30;
  arrayColumn[11] = arrayColumn[10] + 30;

  let pageBreak = 0;

  let grandTotalQty = 0;
  let grandTotalAmt = 0;
  let grandTotal = 0;
  let grandTotalDiscount = 0;
  let grandTotalVatadj = 0;
  let grandTotalVatable = 0;
  let grandTotalVatamount = 0;
  let grandTotalVatExempt = 0;
  let grandTotalVateNet = 0;
  let grandTotalVatExemptLessDisc = 0;

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    let xcount_item = 1;
    for (const [keyDay, arrayDay] of Object.entries(reportData)) {
      // this.socketService.emit(
      //   "managers_finishing",
      //   `<b>Class and Subclass</b><br>Finishing ${(
      //     (xcount_item / Object.entries(reportData).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      xcount_item++;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(
        masterFiles.dineType.find((e: any) => e.postypcde === keyDay).postypdsc,
        arrayColumn[0] + 2,
        initPrint.TOP,
        "left"
      );
      initPrint.TOP += 5;
      let dinetypeQty = 0;
      let dinetypeAmt = 0;
      let dinetypeDiscount = 0;
      let dinetypeVatadj = 0;
      let dinetypeTotal = 0;
      let dinetypeVatExempt = 0;
      let dinetypeVatExemptLessDisc = 0;
      let dinetypeVatable = 0;
      let dinetypeVatamount = 0;
      let dinetypeVateNet = 0;
      const xarrayDay: any = arrayDay;
      for (const [keyClass, arrayClass] of Object.entries(xarrayDay)) {
        const xarrayClass: any = arrayClass;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyClass, arrayColumn[0] + 5, initPrint.TOP, "left");
        initPrint.TOP += 5;

        let subTotalQty = 0;
        let subTotalAmt = 0;
        let subTotalDiscount = 0;
        let subTotalVatadj = 0;
        let subTotal = 0;
        let subTotalVatExempt = 0;
        let subTotalVatExemptLessDisc = 0;
        let subTotalVatable = 0;
        let subTotalVatamount = 0;
        let subTotalVateNet = 0;

        for (const xdata_val of Object.values(xarrayClass)) {
          const item: any = xdata_val;
          let value = item["itemsubclasscde"];
          jspdf.setFont("NotoSansCJKtc-Regular", "normal");
          var xsplitText = jspdf.splitTextToSize(value.toString(), 20);
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
            numberFormat(item["amount"], 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(item["qty"], 0),
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
            numberFormat(item["xvatexempt"], 2),
            arrayColumn[6],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(item["xvatexempt_less_disc"], 2),
            arrayColumn[7],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(item["xvatable"], 2),
            arrayColumn[8],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(item["xvatamount"], 2),
            arrayColumn[9],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(item["total"], 2),
            arrayColumn[10],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(item["vat_exempt_net"], 2),
            arrayColumn[11],
            initPrint.TOP,
            "right"
          );
          initPrint.TOP += xincTOP + 5;

          dinetypeQty += item["qty"];
          dinetypeAmt += item["amount"];
          dinetypeVatadj += item["vatadj"];
          dinetypeDiscount += item["discount"];
          dinetypeTotal += item["total"];
          dinetypeVatExempt += item["xvatexempt"];
          dinetypeVatable += item["xvatable"];
          dinetypeVatamount += item["xvatamount"];
          dinetypeVateNet += item["vat_exempt_net"];
          dinetypeVatExemptLessDisc += item["xvatexempt_less_disc"];

          subTotalQty += item["qty"];
          subTotalAmt += item["amount"];
          subTotalVatadj += item["vatadj"];
          subTotalDiscount += item["discount"];
          subTotal += item["total"];
          subTotalVatExempt += item["xvatexempt"];
          subTotalVatable += item["xvatable"];
          subTotalVatamount += item["xvatamount"];
          subTotalVateNet += item["vat_exempt_net"];
          subTotalVatExemptLessDisc += item["xvatexempt_less_disc"];

          grandTotalQty += item["qty"];
          grandTotalAmt += item["amount"];
          grandTotal += item["total"];
          grandTotalDiscount += item["discount"];
          grandTotalVatadj += item["vatadj"];
          grandTotalVatExempt += item["xvatexempt"];
          grandTotalVatable += item["xvatable"];
          grandTotalVatamount += item["xvatamount"];
          grandTotalVateNet += item["vat_exempt_net"];
          grandTotalVatExemptLessDisc += item["xvatexempt_less_disc"];

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

        jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
        initPrint.TOP += 3;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");

        jspdf.text(keyClass, arrayColumn[0] + 10, initPrint.TOP, "left");
        jspdf.text(
          numberFormat(subTotalAmt, 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalQty, 0),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        // jspdf.text('0.00', arrayColumn[3], initPrint.TOP, 'right');
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
          numberFormat(subTotalVatExempt, 2),
          arrayColumn[6],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalVatExemptLessDisc, 2),
          arrayColumn[7],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalVatable, 2),
          arrayColumn[8],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalVatamount, 2),
          arrayColumn[9],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotal, 2),
          arrayColumn[10],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalVateNet, 2),
          arrayColumn[11],
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

      jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
      initPrint.TOP += 3;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text(
        masterFiles.dineType.find((e: any) => e.postypcde === keyDay).postypdsc,
        arrayColumn[0] + 5,
        initPrint.TOP,
        "left"
      );
      jspdf.text(
        numberFormat(dinetypeAmt, 2),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeQty, 0),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      // jspdf.text('0.00', arrayColumn[3], initPrint.TOP, 'right');
      jspdf.text(
        numberFormat(dinetypeVatadj, 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeDiscount, 2),
        arrayColumn[5],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeVatExempt, 2),
        arrayColumn[6],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeVatExemptLessDisc, 2),
        arrayColumn[7],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeVatable, 2),
        arrayColumn[8],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeVatamount, 2),
        arrayColumn[9],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeTotal, 2),
        arrayColumn[10],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dinetypeVateNet, 2),
        arrayColumn[11],
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
        await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );
      }
    }
    jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
    initPrint.TOP += 3;
    jspdf.setFont("NotoSansCJKtc-Regular", "bold");

    jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
    jspdf.text(
      numberFormat(grandTotalAmt, 2),
      arrayColumn[1],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalQty, 0),
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
      numberFormat(grandTotalVatExempt, 2),
      arrayColumn[6],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVatExemptLessDisc, 2),
      arrayColumn[7],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVatable, 2),
      arrayColumn[8],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVatamount, 2),
      arrayColumn[9],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotal, 2),
      arrayColumn[10],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVateNet, 2),
      arrayColumn[11],
      initPrint.TOP,
      "right"
    );

    if (typeof jspdf.putTotalPages === "function") {
      jspdf.putTotalPages(initPrint.totalPagesExp);
    }
  } else {
    let xcount_item = 1;
    for (const [keyClass, arrayClass] of Object.entries(reportData)) {
      // this.socketService.emit(
      //   "managers_finishing",
      //   `<b>Class and Subclass</b><br>Finishing ${(
      //     (xcount_item / Object.entries(reportData).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      xcount_item++;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(keyClass, arrayColumn[0] + 5, initPrint.TOP, "left");
      initPrint.TOP += 5;

      let subTotalQty = 0;
      let subTotalAmt = 0;
      let subTotalDiscount = 0;
      let subTotalVatadj = 0;
      let subTotal = 0;
      let subTotalVatExempt = 0;
      let subTotalVatable = 0;
      let subTotalVatamount = 0;
      let subTotalVateNet = 0;
      let subTotalVatExemptLessDisc = 0;
      const xarrayClass: any = arrayClass;
      for (const xdata_val of Object.values(xarrayClass)) {
        const item: any = xdata_val;
        let value = item["itemsubclasscde"];

        jspdf.setFont("NotoSansCJKtc-Regular", "normal");
        var xsplitText = jspdf.splitTextToSize(value.toString(), 20);
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
        // jspdf.text(value, arrayColumn[0] + 10, initPrint.TOP, 'left');
        jspdf.text(
          numberFormat(item["amount"], 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(item["qty"], 0),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        // jspdf.text('0.00', arrayColumn[3], initPrint.TOP, 'right');
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
          numberFormat(item["xvatexempt"], 2),
          arrayColumn[6],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(item["xvatexempt_less_disc"], 2),
          arrayColumn[7],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(item["xvatable"], 2),
          arrayColumn[8],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(item["xvatamount"], 2),
          arrayColumn[9],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(item["total"], 2),
          arrayColumn[10],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(item["vat_exempt_net"], 2),
          arrayColumn[11],
          initPrint.TOP,
          "right"
        );
        initPrint.TOP += 5;

        subTotalQty += item["qty"];
        subTotalAmt += item["amount"];
        subTotalVatadj += item["vatadj"];
        subTotalDiscount += item["discount"];
        subTotal += item["total"];
        subTotalVatExempt += item["xvatexempt"];
        subTotalVatable += item["xvatable"];
        subTotalVatamount += item["xvatamount"];
        subTotalVateNet += item["vat_exempt_net"];
        subTotalVatExemptLessDisc += item["xvatexempt_less_disc"];

        grandTotalQty += item["qty"];
        grandTotalAmt += item["amount"];
        grandTotal += item["total"];
        grandTotalDiscount += item["discount"];
        grandTotalVatadj += item["vatadj"];
        grandTotalVatExempt += item["xvatexempt"];
        grandTotalVatable += item["xvatable"];
        grandTotalVatamount += item["xvatamount"];
        grandTotalVateNet += item["vat_exempt_net"];
        grandTotalVatExemptLessDisc += item["xvatexempt_less_disc"];

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

      jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
      initPrint.TOP += 3;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text("SUBTOTAL", arrayColumn[0] + 10, initPrint.TOP, "left");
      jspdf.text(
        numberFormat(subTotalAmt, 2),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalQty, 0),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      // jspdf.text('0.00', arrayColumn[3], initPrint.TOP, 'right');
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
        numberFormat(subTotalVatExempt, 2),
        arrayColumn[6],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalVatExemptLessDisc, 2),
        arrayColumn[7],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalVatable, 2),
        arrayColumn[8],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalVatamount, 2),
        arrayColumn[9],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotal, 2),
        arrayColumn[10],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalVateNet, 2),
        arrayColumn[11],
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
        await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );
      }
    }
    jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
    initPrint.TOP += 3;
    jspdf.setFont("NotoSansCJKtc-Regular", "bold");

    jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
    jspdf.text(
      numberFormat(grandTotalAmt, 2),
      arrayColumn[1],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalQty, 0),
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
      numberFormat(grandTotalVatExempt, 2),
      arrayColumn[6],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVatExemptLessDisc, 2),
      arrayColumn[7],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVatable, 2),
      arrayColumn[8],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVatamount, 2),
      arrayColumn[9],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotal, 2),
      arrayColumn[10],
      initPrint.TOP,
      "right"
    );
    jspdf.text(
      numberFormat(grandTotalVateNet, 2),
      arrayColumn[11],
      initPrint.TOP,
      "right"
    );

    if (typeof jspdf.putTotalPages === "function") {
      jspdf.putTotalPages(initPrint.totalPagesExp);
    }
  }

  return jspdf;
}
