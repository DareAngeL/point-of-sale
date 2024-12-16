import jsPDF from "jspdf";
import {
  XZReportHeader,
  XZReportData,
  useXZPDFReportBuilder,
} from "../zreading/zreadingreport/xzreportBuilder";
import {Alignment, PaperFormat} from "../enums/report";

interface XReadingReportsProps {
  header: XZReportHeader;
  reportRef?: React.MutableRefObject<HTMLTableElement | null>;
  datetime: string;
  cashier: string;
  sales_data: XZReportData[];
  discounts_data: XZReportData[];
  cash_data: XZReportData[];
  all_cash_data: XZReportData[];
  card_sales_data: XZReportData[];
  other_sales_data: XZReportData[];
  itemized_sales_data: XZReportData[];
  category_sales_data: XZReportData[];
  sales_by_dine_type_data: XZReportData[];
  summary_data: XZReportData[];
  void_data: XZReportData[];
  post_refund_data: XZReportData[];
}

export function useXReadingReport() {
  const {
    defaultFontSize,
    defaultFontWeight,
    mainLblFontSize,
    mainLblFontWeight,
    reset,
    Tool,
  } = useXZPDFReportBuilder();
  const {createHeader, createInlineText, createItems, createText} = Tool();

  const labels = {
    title: "X - Reading",
    cashierLbl: "CASHIER",
    discLbl: "Discounts",
    cashLbl: "CASH",
    cardSalesLbl: "Card Sales",
    otherSalesLbl: "Other MOP Sales",
    itemizedSalesLbl: "ITEMIZED SALES",
    categorySalesLbl: "CATEGORY SALES",
    salesByDineTypeLbl: "SALES BY DINE-TYPE",
    summaryLbl: "SUMMARY",
    voidLbl: "Post Void",
    postRefundLbl: "Post Refund",
    endOFZ: "END OF X - Reading Report",
  };

  const generateReport = (
    props: XReadingReportsProps,
    isView: boolean,
    fileType: "pdf" | "text" | "csv"
  ) => {
    const {header, datetime} = props;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: PaperFormat.Letter,
    });

    switch (fileType) {
      case "pdf":
        //#region Header
        createHeader(pdf, {
          business1: header.business1,
          business2: header.business2,
          business3: header.business3,
          tin: header.tin,
          address1: header.address1,
          address2: header.address2,
          address3: header.address3,
          machserlno: header.machserlno,
          title: header.title,
          date: header.date,
        } as XZReportHeader);
        //#endregion
        //#region cashier
        createText(
          pdf,
          `CASHIER: ${props.cashier}`,
          defaultFontSize,
          Alignment.LEFT,
          defaultFontWeight,
          {top: 0, bottom: 1}
        );
        //#endregion
        //#region salesdata
        createItems(
          pdf,
          props.sales_data.map((data) => [
            {
              str: data.label,
              alignment: Alignment.LEFT,
            },
            {
              str: data.value,
              alignment: Alignment.RIGHT,
            },
          ]),
          defaultFontSize
        );
        //#endregion
        //#region discounts label
        createText(
          pdf,
          labels.discLbl,
          mainLblFontSize,
          Alignment.CENTER,
          mainLblFontWeight,
          {
            top: 1,
            bottom: 1,
          }
        );
        //#endregion
        //#region discounts data
        for (const data of props.discounts_data) {
          createText(
            pdf,
            data.label,
            defaultFontSize,
            Alignment.LEFT,
            defaultFontWeight
          );
          createInlineText(
            pdf,
            [
              {
                str: data.qty ? data.qty.toString() : "",
                alignment: Alignment.LEFT,
              },
              {
                str: data.value,
                alignment: Alignment.RIGHT,
              },
            ],
            defaultFontSize
          );
        }
        //#endregion
        //#region cash label
        for (const data of props.cash_data) {
          createText(
            pdf,
            data.label,
            defaultFontSize,
            Alignment.LEFT,
            defaultFontWeight,
            {top: 1, bottom: 0}
          );
          createInlineText(
            pdf,
            [
              {
                str: data.qty ? data.qty.toString() : "",
                alignment: Alignment.LEFT,
              },
              {
                str: data.value,
                alignment: Alignment.RIGHT,
              },
            ],
            defaultFontSize
          );
        }
        //#endregion
        //#region all cash data
        createItems(
          pdf,
          props.all_cash_data.map((data) => [
            {
              str: data.label,
              alignment: Alignment.LEFT,
            },
            {
              str: data.value,
              alignment: Alignment.RIGHT,
            },
          ]),
          defaultFontSize
        );
        //#endregion
        //#region card sales label
        createText(
          pdf,
          labels.cardSalesLbl,
          mainLblFontSize,
          Alignment.CENTER,
          mainLblFontWeight,
          {
            top: 1,
            bottom: 1,
          }
        );
        //#endregion
        //#region card sales data
        for (const data of props.card_sales_data) {
          createText(
            pdf,
            data.label,
            defaultFontSize,
            Alignment.LEFT,
            defaultFontWeight
          );
          createInlineText(
            pdf,
            [
              {
                str: data.subLbls! as any,
                alignment: Alignment.LEFT,
                adjustLeftMargin: 20,
              },
              {
                str: data.qty ? data.qty.toString() : "",
                alignment: Alignment.CENTER,
              },
              {
                str: data.value,
                alignment: Alignment.RIGHT,
              },
            ],
            defaultFontSize
          );
        }
        //#endregion
        //#region other sales label
        createText(
          pdf,
          labels.otherSalesLbl,
          mainLblFontSize,
          Alignment.CENTER,
          mainLblFontWeight,
          {
            top: 1,
            bottom: 1,
          }
        );
        for (const data of props.other_sales_data) {
          createText(
            pdf,
            data.label,
            defaultFontSize,
            Alignment.LEFT,
            defaultFontWeight
          );
          createInlineText(
            pdf,
            [
              {
                str: data.label,
                alignment: Alignment.LEFT,
                adjustLeftMargin: 20,
              },
              {
                str: data.qty ? data.qty.toString() : "",
                alignment: Alignment.CENTER,
              },
              {
                str: data.value,
                alignment: Alignment.RIGHT,
              },
            ],
            defaultFontSize
          );
        }

        // beginning or
        createText(
          pdf,
          "",
          defaultFontSize,
          Alignment.LEFT,
          defaultFontWeight,
          {
            top: 1,
            bottom: 0,
          }
        );
        createInlineText(
          pdf,
          [
            {
              str: props.post_refund_data[0].label,
              alignment: Alignment.LEFT,
              adjustLeftMargin: 20,
            },
            {
              str: props.post_refund_data[0].qty
                ? props.post_refund_data[0].qty.toString()
                : "",
              alignment: Alignment.CENTER,
            },
            {
              str: props.post_refund_data[0].value,
              alignment: Alignment.RIGHT,
            },
          ],
          defaultFontSize
        );
        createText(
          pdf,
          "",
          defaultFontSize,
          Alignment.LEFT,
          defaultFontWeight,
          {
            top: 1,
            bottom: 1,
          }
        );
        createInlineText(
          pdf,
          [
            {
              str: props.post_refund_data[1].label,
              alignment: Alignment.LEFT,
              adjustLeftMargin: 20,
            },
            {
              str: props.post_refund_data[1].qty
                ? props.post_refund_data[1].qty.toString()
                : "",
              alignment: Alignment.CENTER,
            },
            {
              str: props.post_refund_data[0].value,
              alignment: Alignment.RIGHT,
            },
          ],
          defaultFontSize
        );

        createText(
          pdf,
          "",
          defaultFontSize,
          Alignment.LEFT,
          defaultFontWeight,
          {
            top: 1,
            bottom: 0,
          }
        );

        createText(
          pdf,
          datetime,
          defaultFontSize,
          Alignment.LEFT,
          defaultFontWeight,
          {
            top: 1,
            bottom: 0,
          }
        );

        createText(
          pdf,
          props.post_refund_data[2].label,
          mainLblFontSize,
          Alignment.CENTER,
          mainLblFontWeight,
          {
            top: 0,
            bottom: 1,
          }
        );

        if (isView) {
          window.open(pdf.output("bloburl"));
          return;
        }

        reset();

        return pdf.output("datauristring");
      case "csv":
        return;
      case "text":
        return;
      default:
        break;
    }
  };
  return {
    generateReport,
  };
}
