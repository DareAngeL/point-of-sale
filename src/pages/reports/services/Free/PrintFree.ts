import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintFooter } from "../PrintFooter";
import { PrintHeader } from "../PrintHeader";

export async function PrintFree(
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
  arrayColumn[1] = arrayColumn[0] + 140;
  arrayColumn[2] = arrayColumn[1] + 25;
  arrayColumn[3] = arrayColumn[2] + 25;

  let grandTotalQty = 0;
  let grandTotalAmt = 0;
  let grandTotal = 0;

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    for (const [keyDate, arrayDate] of Object.entries(reportData["detailed"])) {
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(keyDate, arrayColumn[0], initPrint.TOP, "left");
      initPrint.TOP += 5;

      let subTotalPerDateQty = 0;
      let subTotalPerDateAmt = 0;
      let subTotalPerDate = 0;
      const xarrayDate: any = arrayDate;
      for (const [keyDinetype, arrayDinetyp] of Object.entries(xarrayDate)) {
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(
          masterFiles.dineType.find((e: any) => e.postypcde === keyDinetype)
            .postypdsc,
          arrayColumn[0] + 5,
          initPrint.TOP,
          "left"
        );

        initPrint.TOP += 5;
        const arrayDinetype: any = arrayDinetyp;
        for (const [keyFreeReason, arrayFreeReason] of Object.entries(
          arrayDinetype
        )) {
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(keyFreeReason, arrayColumn[0] + 5, initPrint.TOP, "left");

          initPrint.TOP += 5;

          let subTotalPerReasonQty = 0;
          let subTotalPerReasonAmt = 0;
          let subTotalPerReason = 0;
          const xarrayFreeReason: any = arrayFreeReason;
          for (const xdata_val of Object.values(xarrayFreeReason)) {
            const record: any = xdata_val;
            jspdf.setFont("NotoSansCJKtc-Regular", "bold");
            jspdf.text(
              record["itmdsc"],
              arrayColumn[0] + 10,
              initPrint.TOP,
              "left"
            );
            jspdf.text(
              numberFormat(record["amount"], 2),
              arrayColumn[1],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(record["qty"], 0),
              arrayColumn[2],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(record["total"], 2),
              arrayColumn[3],
              initPrint.TOP,
              "right"
            );

            initPrint.TOP += 5;

            subTotalPerReasonQty += parseFloat(record["qty"]);
            subTotalPerReasonAmt += parseFloat(record["amount"]);
            subTotalPerReason += parseFloat(record["total"]);
            subTotalPerDateQty += parseFloat(record["qty"]);
            subTotalPerDateAmt += parseFloat(record["amount"]);
            subTotalPerDate += parseFloat(record["total"]);
            grandTotalQty += parseFloat(record["qty"]);
            grandTotalAmt += parseFloat(record["amount"]);
            grandTotal += parseFloat(record["total"]);

            pageBreak =
              initPrint.reportSetup.orientation === "portrait"
                ? initPrint.reportSetup.format === "Letter"
                  ? 260
                  : 280
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

          jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
          initPrint.TOP += 3;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(keyFreeReason, arrayColumn[0] + 5, initPrint.TOP, "left");
          jspdf.text(
            numberFormat(subTotalPerReasonAmt, 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(subTotalPerReasonQty, 0),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(subTotalPerReason, 2),
            arrayColumn[3],
            initPrint.TOP,
            "right"
          );
          initPrint.TOP += 8;

          pageBreak =
            initPrint.reportSetup.orientation === "portrait"
              ? initPrint.reportSetup.format === "Letter"
                ? 260
                : 280
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
      jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
      initPrint.TOP += 3;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text(keyDate, arrayColumn[0], initPrint.TOP, "left");
      jspdf.text(
        numberFormat(subTotalPerDateAmt, 2),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalPerDateQty, 0),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalPerDate, 2),
        arrayColumn[3],
        initPrint.TOP,
        "right"
      );
      initPrint.TOP += 8;

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

    jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
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
      numberFormat(grandTotal, 2),
      arrayColumn[3],
      initPrint.TOP,
      "right"
    );
    initPrint.TOP += 8;

    grandTotalQty = 0;
    grandTotalAmt = 0;
    grandTotal = 0;

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
    for (const [keyDinetype, arrayDinetyp] of Object.entries(
      reportData["summary"]
    )) {
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(
        masterFiles.dineType.find((e: any) => e.postypcde === keyDinetype)
          .postypdsc,
        arrayColumn[0],
        initPrint.TOP,
        "left"
      );

      initPrint.TOP += 5;
      const arrayDinetype: any = arrayDinetyp;
      for (const [keyFreeReason, arrayFreeReason] of Object.entries(
        arrayDinetype
      )) {
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyFreeReason, arrayColumn[0] + 5, initPrint.TOP, "left");

        initPrint.TOP += 5;

        let subTotalPerReasonQty = 0;
        let subTotalPerReasonAmt = 0;
        let subTotalPerReason = 0;
        const xarrayFreeReason: any = arrayFreeReason;
        for (const [keyDate, arrayDate] of Object.entries(xarrayFreeReason)) {
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(keyDate, arrayColumn[0] + 5, initPrint.TOP, "left");

          initPrint.TOP += 5;

          let subTotalPerDateQty = 0;
          let subTotalPerDateAmt = 0;
          let subTotalPerDate = 0;
          const xarrayDate: any = arrayDate;
          for (const xdata_val of Object.values(xarrayDate)) {
            const record: any = xdata_val;
            jspdf.setFont("NotoSansCJKtc-Regular", "bold");
            jspdf.text(
              record["ordocnum"],
              arrayColumn[0] + 10,
              initPrint.TOP,
              "left"
            );
            jspdf.text(
              numberFormat(record["amount"], 2),
              arrayColumn[1],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(record["qty"], 0),
              arrayColumn[2],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(record["total"], 2),
              arrayColumn[3],
              initPrint.TOP,
              "right"
            );

            initPrint.TOP += 5;

            subTotalPerReasonQty += parseFloat(record["qty"]);
            subTotalPerReasonAmt += parseFloat(record["amount"]);
            subTotalPerReason += parseFloat(record["total"]);
            subTotalPerDateQty += parseFloat(record["qty"]);
            subTotalPerDateAmt += parseFloat(record["amount"]);
            subTotalPerDate += parseFloat(record["total"]);
            grandTotalQty += parseFloat(record["qty"]);
            grandTotalAmt += parseFloat(record["amount"]);
            grandTotal += parseFloat(record["total"]);

            pageBreak =
              initPrint.reportSetup.orientation === "portrait"
                ? initPrint.reportSetup.format === "Letter"
                  ? 260
                  : 280
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

          jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
          initPrint.TOP += 3;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(keyDate, arrayColumn[0] + 5, initPrint.TOP, "left");
          jspdf.text(
            numberFormat(subTotalPerDateAmt, 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(subTotalPerDateQty, 0),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(subTotalPerDate, 2),
            arrayColumn[3],
            initPrint.TOP,
            "right"
          );
          initPrint.TOP += 8;

          pageBreak =
            initPrint.reportSetup.orientation === "portrait"
              ? initPrint.reportSetup.format === "Letter"
                ? 260
                : 280
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

        jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
        initPrint.TOP += 3;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");

        jspdf.text(keyFreeReason, arrayColumn[0], initPrint.TOP, "left");
        jspdf.text(
          numberFormat(subTotalPerReasonAmt, 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalPerReasonQty, 0),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalPerReason, 2),
          arrayColumn[3],
          initPrint.TOP,
          "right"
        );
        initPrint.TOP += 8;

        pageBreak =
          initPrint.reportSetup.orientation === "portrait"
            ? initPrint.reportSetup.format === "Letter"
              ? 260
              : 280
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

    jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
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
      numberFormat(grandTotal, 2),
      arrayColumn[3],
      initPrint.TOP,
      "right"
    );
    initPrint.TOP += 8;

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

    if (typeof jspdf.putTotalPages === "function") {
      jspdf.putTotalPages(initPrint.totalPagesExp);
    }
  } else {
    for (const [keyDate, arrayDate] of Object.entries(reportData["detailed"])) {
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(keyDate, arrayColumn[0], initPrint.TOP, "left");

      initPrint.TOP += 5;

      let subTotalPerDateQty = 0;
      let subTotalPerDateAmt = 0;
      let subTotalPerDate = 0;
      const xarrayDate: any = arrayDate;
      for (const [keyFreeReason, arrayFreeReason] of Object.entries(
        xarrayDate
      )) {
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyFreeReason, arrayColumn[0] + 5, initPrint.TOP, "left");

        initPrint.TOP += 5;

        let subTotalPerReasonQty = 0;
        let subTotalPerReasonAmt = 0;
        let subTotalPerReason = 0;
        const xarrayFreeReason: any = arrayFreeReason;
        for (const xdata_val of Object.values(xarrayFreeReason)) {
          const record: any = xdata_val;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(
            record["itmdsc"],
            arrayColumn[0] + 10,
            initPrint.TOP,
            "left"
          );
          jspdf.text(
            numberFormat(record["amount"], 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(record["qty"], 0),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(record["total"], 2),
            arrayColumn[3],
            initPrint.TOP,
            "right"
          );

          initPrint.TOP += 5;

          subTotalPerReasonQty += parseFloat(record["qty"]);
          subTotalPerReasonAmt += parseFloat(record["amount"]);
          subTotalPerReason += parseFloat(record["total"]);
          subTotalPerDateQty += parseFloat(record["qty"]);
          subTotalPerDateAmt += parseFloat(record["amount"]);
          subTotalPerDate += parseFloat(record["total"]);
          grandTotalQty += parseFloat(record["qty"]);
          grandTotalAmt += parseFloat(record["amount"]);
          grandTotal += parseFloat(record["total"]);

          pageBreak =
            initPrint.reportSetup.orientation === "portrait"
              ? initPrint.reportSetup.format === "Letter"
                ? 260
                : 280
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

        jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
        initPrint.TOP += 3;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyFreeReason, arrayColumn[0] + 5, initPrint.TOP, "left");
        jspdf.text(
          numberFormat(subTotalPerReasonAmt, 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalPerReasonQty, 0),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalPerReason, 2),
          arrayColumn[3],
          initPrint.TOP,
          "right"
        );
        initPrint.TOP += 8;

        pageBreak =
          initPrint.reportSetup.orientation === "portrait"
            ? initPrint.reportSetup.format === "Letter"
              ? 260
              : 280
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

      jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
      initPrint.TOP += 3;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text(keyDate, arrayColumn[0], initPrint.TOP, "left");
      jspdf.text(
        numberFormat(subTotalPerDateAmt, 2),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalPerDateQty, 0),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalPerDate, 2),
        arrayColumn[3],
        initPrint.TOP,
        "right"
      );
      initPrint.TOP += 8;

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

    jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
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
      numberFormat(grandTotal, 2),
      arrayColumn[3],
      initPrint.TOP,
      "right"
    );
    initPrint.TOP += 8;

    grandTotalQty = 0;
    grandTotalAmt = 0;
    grandTotal = 0;

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

    for (const [keyFreeReason, arrayFreeReason] of Object.entries(
      reportData["summary"]
    )) {
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(keyFreeReason, arrayColumn[0], initPrint.TOP, "left");

      initPrint.TOP += 5;

      let subTotalPerReasonQty = 0;
      let subTotalPerReasonAmt = 0;
      let subTotalPerReason = 0;
      const xarrayFreeReason: any = arrayFreeReason;
      for (const [keyDate, arrayDate] of Object.entries(xarrayFreeReason)) {
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyDate, arrayColumn[0] + 5, initPrint.TOP, "left");

        initPrint.TOP += 5;

        let subTotalPerDateQty = 0;
        let subTotalPerDateAmt = 0;
        let subTotalPerDate = 0;
        const xarrayDate: any = arrayDate;
        for (const xdata_val of Object.values(xarrayDate)) {
          const record: any = xdata_val;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(
            record["ordocnum"],
            arrayColumn[0] + 10,
            initPrint.TOP,
            "left"
          );
          jspdf.text(
            numberFormat(record["amount"], 2),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(record["qty"], 0),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(record["total"], 2),
            arrayColumn[3],
            initPrint.TOP,
            "right"
          );

          initPrint.TOP += 5;

          subTotalPerReasonQty += parseFloat(record["qty"]);
          subTotalPerReasonAmt += parseFloat(record["amount"]);
          subTotalPerReason += parseFloat(record["total"]);
          subTotalPerDateQty += parseFloat(record["qty"]);
          subTotalPerDateAmt += parseFloat(record["amount"]);
          subTotalPerDate += parseFloat(record["total"]);
          grandTotalQty += parseFloat(record["qty"]);
          grandTotalAmt += parseFloat(record["amount"]);
          grandTotal += parseFloat(record["total"]);

          pageBreak =
            initPrint.reportSetup.orientation === "portrait"
              ? initPrint.reportSetup.format === "Letter"
                ? 260
                : 280
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

        jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
        initPrint.TOP += 3;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyDate, arrayColumn[0] + 5, initPrint.TOP, "left");
        jspdf.text(
          numberFormat(subTotalPerDateAmt, 2),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalPerDateQty, 0),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalPerDate, 2),
          arrayColumn[3],
          initPrint.TOP,
          "right"
        );
        initPrint.TOP += 8;

        pageBreak =
          initPrint.reportSetup.orientation === "portrait"
            ? initPrint.reportSetup.format === "Letter"
              ? 260
              : 280
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

      jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
      initPrint.TOP += 3;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text(keyFreeReason, arrayColumn[0], initPrint.TOP, "left");
      jspdf.text(
        numberFormat(subTotalPerReasonAmt, 2),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalPerReasonQty, 0),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalPerReason, 2),
        arrayColumn[3],
        initPrint.TOP,
        "right"
      );
      initPrint.TOP += 8;

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

    jspdf.line(10, initPrint.TOP, 205, initPrint.TOP);
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
      numberFormat(grandTotal, 2),
      arrayColumn[3],
      initPrint.TOP,
      "right"
    );
    initPrint.TOP += 8;

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

    if (typeof jspdf.putTotalPages === "function") {
      jspdf.putTotalPages(initPrint.totalPagesExp);
    }
  }

  return jspdf;
}
