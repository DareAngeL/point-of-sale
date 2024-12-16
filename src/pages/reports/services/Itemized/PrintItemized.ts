import {numberFormat} from "../../../../helper/NumberFormat";
import {PosfileModel} from "../../../../models/posfile";
import {PrintFooter} from "../PrintFooter";
import {PrintHeader} from "../PrintHeader";

export async function PrintItemized(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: PosfileModel,
  initPrint: any,
  masterFiles: any
) {
  console.log("baka ito", reportData);

  let arrayColumn: any = [];
  arrayColumn[0] = initPrint.LEFT;
  arrayColumn[1] = arrayColumn[0] + 75;
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

  jspdf.setFontSize(10);

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    if (formValue?.detailedSumOption === "detailed") {
      let xcount_item = 1;
      for (const [keyDay, arrayDay] of Object.entries(reportData)) {
        // this.socketService.emit(
        //   "managers_finishing",
        //   `<b>Itemized</b><br>Finishing ${(
        //     (xcount_item / Object.entries(reportData).length) *
        //     100
        //   ).toFixed(2)}%`
        // );
        xcount_item++;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyDay, arrayColumn[0], initPrint.TOP, "left");
        initPrint.TOP += 5;

        let dailyQtyTotal = 0;
        let dailyAmtTotal = 0;
        let dailyTotal = 0;
        let dailyDiscount = 0;
        let dailyVatadj = 0;
        let dailyVatable = 0;
        let dailyVatamount = 0;
        let dailyVatexempt = 0;
        let dailyVatexemptLessDisc = 0;
        let dailyVateNet = 0;

        for (const [keyDine, arrayDine] of Object.entries(arrayDay)) {
          const xarrayDine: any = arrayDine;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(
            masterFiles.dineType.find((e: any) => e.postypcde === keyDine)
              .postypdsc,
            arrayColumn[0] + 2,
            initPrint.TOP,
            "left"
          );
          initPrint.TOP += 5;

          let dinetypeQtyTotal = 0;
          let dinetypeAmtTotal = 0;
          let dinetypeTotal = 0;
          let dinetypeDiscount = 0;
          let dinetypeVatadj = 0;
          let dinetypeVatable = 0;
          let dinetypeVatamount = 0;
          let dinetypeVatexempt = 0;
          let dinetypeVatexemptLessDisc = 0;
          let dinetypeVateNet = 0;

          for (const [keyClass, arrayClass] of Object.entries(xarrayDine)) {
            const xarrayClass: any = arrayClass;
            let classQtyTotal = 0;
            let classAmtTotal = 0;
            let classTotal = 0;
            let classDiscount = 0;
            let classVatadj = 0;
            let classVatable = 0;
            let classVatamount = 0;
            let classVatexempt = 0;
            let classVatexemptLessDisc = 0;
            let classVateNet = 0;
            jspdf.setFont("NotoSansCJKtc-Regular", "bold");
            jspdf.text(keyClass, arrayColumn[0] + 5, initPrint.TOP, "left");
            initPrint.TOP += 5;
            for (const [keySubClass, arraySubClass] of Object.entries(
              xarrayClass
            )) {
              const xarraySubClass: any = arraySubClass;
              jspdf.setFont("NotoSansCJKtc-Regular", "bold");
              jspdf.text(
                keySubClass,
                arrayColumn[0] + 10,
                initPrint.TOP,
                "left"
              );
              initPrint.TOP += 5;

              for (const xdata_val of Object.values(xarraySubClass)) {
                const item: any = xdata_val;
                let value = item["itmdsc"];
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

                classQtyTotal += parseFloat(item["qty"]);
                classAmtTotal += parseFloat(item["amount"]);
                classTotal += parseFloat(item["total"]);
                classDiscount += parseFloat(item["discount"]);
                classVatadj += parseFloat(item["vatadj"]);
                classVatable += parseFloat(item["xvatable"]);
                classVatamount += parseFloat(item["xvatamount"]);
                classVatexempt += parseFloat(item["xvatexempt"]);
                classVateNet += parseFloat(item["vat_exempt_net"]);
                classVatexemptLessDisc += parseFloat(
                  item["xvatexempt_less_disc"]
                );

                dinetypeQtyTotal += parseFloat(item["qty"]);
                dinetypeAmtTotal += parseFloat(item["amount"]);
                dinetypeTotal += parseFloat(item["total"]);
                dinetypeDiscount += parseFloat(item["discount"]);
                dinetypeVatadj += parseFloat(item["vatadj"]);
                dinetypeVatable += parseFloat(item["xvatable"]);
                dinetypeVatamount += parseFloat(item["xvatamount"]);
                dinetypeVatexempt += parseFloat(item["xvatexempt"]);
                dinetypeVateNet += parseFloat(item["vat_exempt_net"]);
                dinetypeVatexemptLessDisc += parseFloat(
                  item["xvatexempt_less_disc"]
                );

                dailyQtyTotal += parseFloat(item["qty"]);
                dailyAmtTotal += parseFloat(item["amount"]);
                dailyTotal += parseFloat(item["total"]);
                dailyDiscount += parseFloat(item["discount"]);
                dailyVatadj += parseFloat(item["vatadj"]);
                dailyVatable += parseFloat(item["xvatable"]);
                dailyVatamount += parseFloat(item["xvatamount"]);
                dailyVatexempt += parseFloat(item["xvatexempt"]);
                dailyVateNet += parseFloat(item["vat_exempt_net"]);
                dailyVatexemptLessDisc += parseFloat(
                  item["xvatexempt_less_disc"]
                );

                grandTotalQty += parseFloat(item["qty"]);
                grandTotalAmt += parseFloat(item["amount"]);

                grandTotal += parseFloat(item["total"]);
                grandTotalDiscount += parseFloat(item["discount"]);
                grandTotalVatadj += parseFloat(item["vatadj"]);
                grandTotalVatable += parseFloat(item["xvatable"]);
                grandTotalVatamount += parseFloat(item["xvatamount"]);
                grandTotalVatExempt += parseFloat(item["xvatexempt"]);
                grandTotalVateNet += parseFloat(item["vat_exempt_net"]);
                grandTotalVatExemptLessDisc += parseFloat(
                  item["xvatexempt_less_disc"]
                );

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

            jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
            initPrint.TOP += 3;
            jspdf.setFont("NotoSansCJKtc-Regular", "bold");

            jspdf.text(keyClass, arrayColumn[0] + 10, initPrint.TOP, "left");
            jspdf.text(
              numberFormat(classAmtTotal, 2),
              arrayColumn[1],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classQtyTotal, 0),
              arrayColumn[2],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classVatadj, 2),
              arrayColumn[4],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classDiscount, 2),
              arrayColumn[5],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classVatexempt, 2),
              arrayColumn[6],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classVatexemptLessDisc, 2),
              arrayColumn[7],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classVatable, 2),
              arrayColumn[8],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classVatamount, 2),
              arrayColumn[9],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classTotal, 2),
              arrayColumn[10],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(classVateNet, 2),
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
            masterFiles.dineType.find((e: any) => e.postypcde === keyDine)
              .postypdsc,
            arrayColumn[0] + 5,
            initPrint.TOP,
            "left"
          );
          jspdf.text(
            numberFormat(dinetypeAmtTotal, 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dinetypeQtyTotal, 0),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
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
            numberFormat(dinetypeVatexempt, 2),
            arrayColumn[6],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dinetypeVatexemptLessDisc, 2),
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

        jspdf.text(keyDay, arrayColumn[0] + 2, initPrint.TOP, "left");
        jspdf.text(
          numberFormat(dailyAmtTotal, 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyQtyTotal, 0),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatadj, 2),
          arrayColumn[4],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyDiscount, 2),
          arrayColumn[5],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatexempt, 2),
          arrayColumn[6],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatexemptLessDisc, 2),
          arrayColumn[7],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatable, 2),
          arrayColumn[8],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatamount, 2),
          arrayColumn[9],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyTotal, 2),
          arrayColumn[10],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVateNet, 2),
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
      for (const [keyDine, arrayDine] of Object.entries(reportData)) {
        // this.socketService.emit(
        //   "managers_finishing",
        //   `<b>Itemized</b><br>Finishing ${(
        //     (xcount_item / Object.entries(reportData).length) *
        //     100
        //   ).toFixed(2)}%`
        // );
        xcount_item++;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(
          masterFiles.dineType.find((e: any) => e.postypcde === keyDine)
            .postypdsc,
          arrayColumn[0] + 2,
          initPrint.TOP,
          "left"
        );
        initPrint.TOP += 5;

        let dinetypeQtyTotal = 0;
        let dinetypeAmtTotal = 0;
        let dinetypeTotal = 0;
        let dinetypeDiscount = 0;
        let dinetypeVatadj = 0;
        let dinetypeVatable = 0;
        let dinetypeVatamount = 0;
        let dinetypeVatexempt = 0;
        let dinetypeVatexemptLessDisc = 0;
        let dinetypeVateNet = 0;

        for (const [keyClass, arrayClass] of Object.entries(arrayDine)) {
          const xarrayClass: any = arrayClass;
          let classQtyTotal = 0;
          let classAmtTotal = 0;
          let classTotal = 0;
          let classDiscount = 0;
          let classVatadj = 0;
          let classVatable = 0;
          let classVatamount = 0;
          let classVatexempt = 0;
          let classVatexemptLessDisc = 0;
          let classVateNet = 0;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(keyClass, arrayColumn[0] + 5, initPrint.TOP, "left");
          initPrint.TOP += 5;
          for (const [keySubClass, arraySubClass] of Object.entries(
            xarrayClass
          )) {
            const xarraySubClass: any = arraySubClass;
            jspdf.setFont("NotoSansCJKtc-Regular", "bold");
            jspdf.text(keySubClass, arrayColumn[0] + 10, initPrint.TOP, "left");
            initPrint.TOP += 5;

            for (const xdata_val of Object.values(xarraySubClass)) {
              const item: any = xdata_val;
              let value = item["itmdsc"];
              jspdf.setFont("NotoSansCJKtc-Regular", "normal");
              var xsplitText = jspdf.splitTextToSize(value, 20);
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

              classQtyTotal += parseFloat(item["qty"]);
              classAmtTotal += parseFloat(item["amount"]);
              classTotal += parseFloat(item["total"]);
              classDiscount += parseFloat(item["discount"]);
              classVatadj += parseFloat(item["vatadj"]);
              classVatable += parseFloat(item["xvatable"]);
              classVatamount += parseFloat(item["xvatamount"]);
              classVatexempt += parseFloat(item["xvatexempt"]);
              classVateNet += parseFloat(item["vat_exempt_net"]);
              classVatexemptLessDisc += parseFloat(
                item["xvatexempt_less_disc"]
              );

              dinetypeQtyTotal += parseFloat(item["qty"]);
              dinetypeAmtTotal += parseFloat(item["amount"]);
              dinetypeTotal += parseFloat(item["total"]);
              dinetypeDiscount += parseFloat(item["discount"]);
              dinetypeVatadj += parseFloat(item["vatadj"]);
              dinetypeVatable += parseFloat(item["xvatable"]);
              dinetypeVatamount += parseFloat(item["xvatamount"]);
              dinetypeVatexempt += parseFloat(item["xvatexempt"]);
              dinetypeVateNet += parseFloat(item["vat_exempt_net"]);
              dinetypeVatexemptLessDisc += parseFloat(
                item["xvatexempt_less_disc"]
              );

              grandTotalQty += parseFloat(item["qty"]);
              grandTotalAmt += parseFloat(item["amount"]);
              grandTotal += parseFloat(item["total"]);
              grandTotalDiscount += parseFloat(item["discount"]);
              grandTotalVatadj += parseFloat(item["vatadj"]);
              grandTotalVatable += parseFloat(item["xvatable"]);
              grandTotalVatamount += parseFloat(item["xvatamount"]);
              grandTotalVatExempt += parseFloat(item["xvatexempt"]);
              grandTotalVateNet += parseFloat(item["vat_exempt_net"]);
              grandTotalVatExemptLessDisc += parseFloat(
                item["xvatexempt_less_disc"]
              );

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

          jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
          initPrint.TOP += 3;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");

          jspdf.text(keyClass, arrayColumn[0] + 10, initPrint.TOP, "left");
          jspdf.text(
            numberFormat(classAmtTotal, 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classQtyTotal, 0),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
          // jspdf.text('0.00', arrayColumn[3], initPrint.TOP, 'right');
          jspdf.text(
            numberFormat(classVatadj, 2),
            arrayColumn[4],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classDiscount, 2),
            arrayColumn[5],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classVatexempt, 2),
            arrayColumn[6],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classVatexemptLessDisc, 2),
            arrayColumn[7],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classVatable, 2),
            arrayColumn[8],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classVatamount, 2),
            arrayColumn[9],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classTotal, 2),
            arrayColumn[10],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(classVateNet, 2),
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
          masterFiles.dineType.find((e: any) => e.postypcde === keyDine)
            .postypdsc,
          arrayColumn[0] + 5,
          initPrint.TOP,
          "left"
        );
        jspdf.text(
          numberFormat(dinetypeAmtTotal, 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dinetypeQtyTotal, 0),
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
          numberFormat(dinetypeVatexempt, 2),
          arrayColumn[6],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dinetypeVatexemptLessDisc, 2),
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
  } else {
    if (formValue?.detailedSumOption === "detailed") {
      let xcount_item = 1;
      for (const [keyDay, arrayDay] of Object.entries(reportData)) {
        // this.socketService.emit(
        //   "managers_finishing",
        //   `<b>Itemized</b><br>Finishing ${(
        //     (xcount_item / Object.entries(reportData).length) *
        //     100
        //   ).toFixed(2)}%`
        // );
        xcount_item++;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyDay, arrayColumn[0], initPrint.TOP, "left");
        initPrint.TOP += 5;
        for (const [keyClass, arrayClass] of Object.entries(arrayDay)) {
          const xarrayClass: any = arrayClass;
          let dailyQtyTotal = 0;
          let dailyAmtTotal = 0;
          let dailyTotal = 0;
          let dailyDiscount = 0;
          let dailyVatadj = 0;
          let dailyVatable = 0;
          let dailyVatamount = 0;
          let dailyVatexempt = 0;
          let dailyVateNet = 0;
          let dailyVatExemptLessDisc = 0;

          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(keyClass, arrayColumn[0] + 5, initPrint.TOP, "left");
          initPrint.TOP += 5;

          for (const [keySubClass, arraySubClass] of Object.entries(
            xarrayClass
          )) {
            const xarraySubClass: any = arraySubClass;
            jspdf.setFont("NotoSansCJKtc-Regular", "bold");
            jspdf.text(keySubClass, arrayColumn[0] + 10, initPrint.TOP, "left");
            initPrint.TOP += 5;

            for (const xdata_val of Object.values(xarraySubClass)) {
              const item: any = xdata_val;
              let value = item["itmdsc"];

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

              dailyQtyTotal += parseFloat(item["qty"]);
              dailyAmtTotal += parseFloat(item["amount"]);
              dailyTotal += parseFloat(item["total"]);
              dailyDiscount += parseFloat(item["discount"]);
              dailyVatadj += parseFloat(item["vatadj"]);
              dailyVatable += parseFloat(item["xvatable"]);
              dailyVatamount += parseFloat(item["xvatamount"]);
              dailyVatexempt += parseFloat(item["xvatexempt"]);
              dailyVateNet += parseFloat(item["vat_exempt_net"]);
              dailyVatExemptLessDisc += parseFloat(
                item["xvatexempt_less_disc"]
              );

              grandTotalQty += parseFloat(item["qty"]);
              grandTotalAmt += parseFloat(item["amount"]);
              grandTotal += parseFloat(item["total"]);
              grandTotalDiscount += parseFloat(item["discount"]);
              grandTotalVatadj += parseFloat(item["vatadj"]);
              grandTotalVatable += parseFloat(item["xvatable"]);
              grandTotalVatamount += parseFloat(item["xvatamount"]);
              grandTotalVatExempt += parseFloat(item["xvatexempt"]);
              grandTotalVateNet += parseFloat(item["vat_exempt_net"]);
              grandTotalVatExemptLessDisc += parseFloat(
                item["xvatexempt_less_disc"]
              );

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

          jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
          initPrint.TOP += 3;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");

          jspdf.text("SUBTOTAL", arrayColumn[0] + 10, initPrint.TOP, "left");
          jspdf.text(
            numberFormat(dailyAmtTotal, 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyQtyTotal, 0),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyVatadj, 2),
            arrayColumn[4],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyDiscount, 2),
            arrayColumn[5],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyVatexempt, 2),
            arrayColumn[6],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyVatExemptLessDisc, 2),
            arrayColumn[7],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyVatable, 2),
            arrayColumn[8],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyVatamount, 2),
            arrayColumn[9],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyTotal, 2),
            arrayColumn[10],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(dailyVateNet, 2),
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
        //   `<b>Itemized</b><br>Finishing ${(
        //     (xcount_item / Object.entries(reportData).length) *
        //     100
        //   ).toFixed(2)}%`
        // );
        xcount_item++;
        let dailyQtyTotal = 0;
        let dailyAmtTotal = 0;
        let dailyTotal = 0;
        let dailyDiscount = 0;
        let dailyVatadj = 0;
        let dailyVatable = 0;
        let dailyVatamount = 0;
        let dailyVatexempt = 0;
        let dailyVateNet = 0;
        let dailyVatExemptLessDisc = 0;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyClass, arrayColumn[0] + 5, initPrint.TOP, "left");
        initPrint.TOP += 5;

        for (const [keySubClass, arraySubClass] of Object.entries(arrayClass)) {
          const xarraySubClass: any = arraySubClass;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(keySubClass, arrayColumn[0] + 10, initPrint.TOP, "left");
          initPrint.TOP += 5;

          for (const xdata_val of Object.values(xarraySubClass)) {
            const item: any = xdata_val;
            let value = item["itmdsc"];
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
              numberFormat(item["qty"], 2),
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

            dailyQtyTotal += parseFloat(item["qty"]);
            dailyAmtTotal += parseFloat(item["amount"]);
            dailyTotal += parseFloat(item["total"]);
            dailyDiscount += parseFloat(item["discount"]);
            dailyVatadj += parseFloat(item["vatadj"]);
            dailyVatable += parseFloat(item["xvatable"]);
            dailyVatamount += parseFloat(item["xvatamount"]);
            dailyVatexempt += parseFloat(item["xvatexempt"]);
            dailyVateNet += parseFloat(item["vat_exempt_net"]);
            dailyVatExemptLessDisc += parseFloat(item["xvatexempt_less_disc"]);

            grandTotalQty += parseFloat(item["qty"]);
            grandTotalAmt += parseFloat(item["amount"]);
            grandTotal += parseFloat(item["total"]);
            grandTotalDiscount += parseFloat(item["discount"]);
            grandTotalVatadj += parseFloat(item["vatadj"]);
            grandTotalVatable += parseFloat(item["xvatable"]);
            grandTotalVatamount += parseFloat(item["xvatamount"]);
            grandTotalVatExempt += parseFloat(item["xvatexempt"]);
            grandTotalVateNet += parseFloat(item["vat_exempt_net"]);
            grandTotalVatExemptLessDisc += parseFloat(
              item["xvatexempt_less_disc"]
            );

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

        jspdf.line(10, initPrint.TOP, 340, initPrint.TOP);
        initPrint.TOP += 3;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");

        jspdf.text(keyClass, arrayColumn[0] + 10, initPrint.TOP, "left");
        jspdf.text(
          numberFormat(dailyAmtTotal, 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyQtyTotal, 2),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatadj, 2),
          arrayColumn[4],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyDiscount, 2),
          arrayColumn[5],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatexempt, 2),
          arrayColumn[6],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatExemptLessDisc, 2),
          arrayColumn[7],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatable, 2),
          arrayColumn[8],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVatamount, 2),
          arrayColumn[9],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyTotal, 2),
          arrayColumn[10],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(dailyVateNet, 2),
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

      jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text(
        numberFormat(grandTotalAmt, 2),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(grandTotalQty, 2),
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
  }

  return jspdf;
}
