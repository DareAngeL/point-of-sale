import {
  XZReportHeader,
  XZReportData,
} from "./xzreportBuilder";
import { convertCSV, convertText } from "../../../../helper/FileConversion";
import { ZReadingFileTypes } from "../../common/FileTypeSelection";
import moment from "moment";
import { useXZReading } from "../../../../hooks/reportHooks";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { convertToPDF } from "../../../../helper/PdfHelper";
import { usePrintReceipt } from "../../../../hooks/cashieringHooks";
import { setZReadingReportData } from "../../../../reducer/reportSlice";
import { zReadingReceiptPrintout } from "../../../../hooks/printer/zReadingReceiptHook";
import { isArray } from "lodash";
import { formatNumberWithCommasAndDecimals } from "../../../../helper/NumberFormat";
import { useReceiptPath } from "../../../../hooks/receiptPath";
import { receiptDefiner } from "../../../../helper/ReceiptNumberFormatter";

export interface ZReadingReportProps {
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
  postvoids: XZReportData[];
  beg_void: XZReportData;
  end_void: XZReportData;
  postrefunds: XZReportData[];
  post_refund_data: XZReportData[];
}

export function useZReadingReport() {
  const { handleSetType } = useXZReading();
  const { handlePrintReceipt, inializePrinter } = usePrintReceipt();
  const { handleReceiptPath } = useReceiptPath();
  const header = useAppSelector((state) => state.masterfile.header.data[0]);
  const { account } = useAppSelector((state) => state.account);
  const { syspar } = useAppSelector((state) => state.masterfile);
  // const {zReadingReportData} = useAppSelector(state => state.report)
  const appDispatch = useAppDispatch();

  inializePrinter();


  const labels = {
    title: "Z - Reading",
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
    endOFZ: "END OF Z - Reading Report",
    reprint: "[ THIS IS A REPRINTED Z - READING ]",
  };

  const saveReports = async (
    _data: ZReadData,
    selectedFileTypes: ZReadingFileTypes[],
    isReprint?: boolean,
    date?: string,
    cb?: (isSuccess: boolean) => void
  ) => {
    console.log(selectedFileTypes);
    const sales_summ = _data.sales_summ;
    const sales_data = [
      { label: "Gross Sales", value: formatNumberWithCommasAndDecimals(sales_summ.gross_sales, 2) },
      { label: "Less Post Void", value: formatNumberWithCommasAndDecimals(sales_summ.less_post_void, 2) },
      {
        label: "Less Post Refund",
        value: formatNumberWithCommasAndDecimals(sales_summ.less_post_refund, 2),
      },
      { label: "Less Discount", value: formatNumberWithCommasAndDecimals(sales_summ.less_disc, 2) },
      {
        label: "Less Service Charge",
        value: formatNumberWithCommasAndDecimals(sales_summ.less_serv_charge, 2),
      },
      { label: "Less VAT Adj", value: formatNumberWithCommasAndDecimals(sales_summ.less_vat_adj, 2) },
      { label: "Net Sales W VAT", value: formatNumberWithCommasAndDecimals(sales_summ.net_sales, 2) },
      {
        label: "Net Sales W/O VAT",
        value: formatNumberWithCommasAndDecimals(sales_summ.vat_exempt_net, 2),
      },
      {
        label: "Total VAT Sales",
        value: formatNumberWithCommasAndDecimals(sales_summ.total_vat_sales, 2),
      },
      { label: "VAT Amount", value: formatNumberWithCommasAndDecimals(sales_summ.vat_amount, 2) },
      { label: "LOCAL TAX 0%", value: formatNumberWithCommasAndDecimals(sales_summ.localtax, 2) },
      {
        label: "Total VAT Exempt",
        value: formatNumberWithCommasAndDecimals(sales_summ.total_vat_exempt, 2),
      },
      {
        label: "Total # of Transaction",
        value: sales_summ.total_numtrans.toString(),
      },
      { label: "Total # of PAX", value: sales_summ.total_numpax.toString() },
      { label: "Total Quantity", value: sales_summ.total_quantity.toString() },
    ];

    const data = {
      header: {
        business1: header.business1 as string,
        business3: header.business3 as string,
        tin: (header.chknonvat === 0 ? true : false)
          ? "VAT Reg."
          : "NON-VAT Reg." + ` TIN- ${header.tin}`,
        address1: header.address1 as string,
        address2: header.address2 as string,
        address3: header.address3 as string,
        machserlno: `MIN#: ${header.machineno} SN#: ${header.serialno}`,
        title: "Z-READING",
        date: date || "",
      },
      datetime: `${date} ${moment().format("hh:mm:ss A")}`,
      cashier: _data.cashier ? _data.cashier.toUpperCase() : (account.data?.usrcde || ''),
      sales_data: [...sales_data],
      discounts_data: _data.discounts.map(
        (disc: { discde: any; qty: any; amtdis: number }) => {
          return {
            label: disc.discde,
            qty: disc.qty,
            value: formatNumberWithCommasAndDecimals(disc.amtdis, 2),
          };
        }
      ),
      cash_data: [
        {
          label: "CASH",
          qty: _data.cash_tran_summ.cash.qty,
          value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.cash.cashsales, 2),
        },
      ],
      all_cash_data: [
        { label: "CASH FUND", value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.cashfund, 2) },
        { label: "CASH IN", value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.cash_in, 2) },
        { label: "CASH OUT", value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.cash_out, 2) },
        {
          label: "CASH IN DRAWER",
          value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.exp_cash, 2),
        },
        { label: "POS CASH", value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.pos_cash, 2) },
        {
          label: "DECLARATION",
          value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.end_cash, 2),
        },
        {
          label: "SHORT/OVER",
          value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.shortover, 2),
        },
        { label: "EXCESS", value: formatNumberWithCommasAndDecimals(_data.cash_tran_summ.excess, 2) },
      ],
      card_sales_data: _data.card_sales.map(
        (card: {
          cardtype: string;
          cardList: { amount: number; cardclass: string; qty: number }[];
        }) => {
          return {
            label: card.cardtype,
            subLbls: card.cardList,
            qty: 0,
            value: "",
          };
        }
      ),
      other_sales_data: _data.othermop.map(
        (mop: { paymenttype: any; qty: any; amount: any; excess: any }) => {
          return {
            label: mop.paymenttype,
            qty: mop.qty,
            value: formatNumberWithCommasAndDecimals(mop.amount, 2),
          };
        }
      ),
      itemized_sales_data: _data.sales_by_item.map((item: any) => {
        return {
          label: item.itmdsc,
          qty: item.itmqty,
          value: formatNumberWithCommasAndDecimals(item.extprc, 2),
        };
      }),
      category_sales_data: _data.category_sales.map(
        (category: { itmcladsc: string; itmqty: number; extprc: number }) => {
          return {
            label: category.itmcladsc,
            qty: category.itmqty,
            value: formatNumberWithCommasAndDecimals(category.extprc, 2),
          };
        }
      ),
      sales_by_dine_type_data: _data.sales_by_dinetype.map(
        (dinetype: SalesByDineType) => {
          return {
            label: dinetype.ordertyp,
            qty: dinetype.itmqty,
            value: formatNumberWithCommasAndDecimals(dinetype.extprc, 2),
            subLbls: dinetype.postypdata as {
              itmqty: any;
              extprc: any;
              postypcde: any;
              postypdsc: any;
            }[],
          };
        }
      ),
      summary_data: [
        ...sales_data,
        { label: "Average Sales", value: formatNumberWithCommasAndDecimals(sales_summ.average_sales, 2) },
      ],
      postvoids: _data.postvoids.map(
        (postvoid: { voidref: string, or: string }) => {
          return {
            label: postvoid.voidref,
            value: postvoid.or
          }
        }
      ),
      beg_void: {
        label: "Beginning Void",
        value: (_data.beg_void as any).voidnum || ''
      },
      end_void: {
        label: "Ending Void",
        value: (_data.end_void as any).voidnum || ''
      },
      postrefunds: _data.postrefunds.map(
        (d: { refnum: string, or: number }) => {
          return {
            label: d.refnum,
            value: formatNumberWithCommasAndDecimals(d.or, 2)
          }
        }
      ),
      post_refund_data: [
        { label: "Beginning Refund", value: (_data.beg_refund as any).refnum || "" },
        { label: "Ending Refund", value: (_data.end_refund as any).refnum || "" },
        { label: "Beginning OR", value: receiptDefiner(syspar.data[0].receipt_title || 0, _data.docnum_summ.beg_or) || "" },
        // { label: "Beginning OR", value: "test only" || "" },
        { label: "Ending OR", value: receiptDefiner(syspar.data[0].receipt_title || 0, _data.docnum_summ.end_or) || "" },
        { label: "Z Counter", value: _data.z_counter.toString() || "0" },
        { label: "Beginning Sales", value: formatNumberWithCommasAndDecimals(_data.beg_sales, 2) || "0.00" },
        { label: "Ending Sales", value: formatNumberWithCommasAndDecimals(_data.end_sales, 2) || "0.00" },
      ],

    };

    appDispatch(setZReadingReportData({
      data,
      isReprint
    }));

    for (const fileType of selectedFileTypes) {
      if (fileType === ZReadingFileTypes.PDF) {
        generateReports(data, ZReadingFileTypes.PDF, (date ? moment(date) : moment()).format("MM-DD-YYYY"), isReprint);
        handleSetType(ZReadingFileTypes.PDF);

        if (isReprint) {
          // await generateReceipt(cb, `Z-READING ${(date ? moment(date) : moment()).format("YYYY-MM-DD")}`, zReadingReceiptPrintout(data), (date ? moment(date) : moment()).format("YYYY-MM-DD"));
          await generateReceiptAndSavePDF(cb, `REPRINT Z-READING ${(date ? moment(date) : moment()).format("YYYY-MM-DD")}`, zReadingReceiptPrintout(data), (date ? moment(date) : moment()).format("YYYY-MM-DD"));
        }
        else {
          await generateReceiptAndSavePDF(cb, `Z-READING ${(date ? moment(date) : moment()).format("YYYY-MM-DD")}`, zReadingReceiptPrintout(data), (date ? moment(date) : moment()).format("YYYY-MM-DD"));
        }


        // await handlePrint(11, 8.5, undefined, "pdf", z, cb);

        continue;
      }

      generateReports(data, fileType as ZReadingFileTypes, (date ? moment(date) : moment()).format("MM-DD-YYYY"), isReprint);
    }
  };

  const generateReports = (
    props: ZReadingReportProps,
    reportType: ZReadingFileTypes,
    date: string,
    isReprint?: boolean
  ) => {
    const data = [[""], [""], [""]];

    const generate = () => {
      const header = props.header;
      data.push(["", header.business1, ""]);
      data.push(["", header.business2, ""]);
      data.push(["", header.business3, ""]);
      data.push(["", header.tin, ""]);
      data.push(["", header.address1, ""]);
      data.push(["", header.address2, ""]);
      data.push(["", header.address3, ""]);
      data.push(["", header.machserlno, ""]);
      data.push([""]);
      data.push(["", header.title, ""]);
      data.push([""]);
      data.push(["", header.date, ""]);
      data.push([""]);
      data.push(["CASHIER:", "", "", props.cashier]);
      createSection(undefined, props.sales_data, 1);
      createSection(labels.discLbl, props.discounts_data, 2);
      createSection(undefined, props.cash_data, 2);
      createSection(undefined, props.all_cash_data, 1);
      //#region cardsales
      createSection(labels.cardSalesLbl, props.card_sales_data, 2,
        {
          label: 'cardclass',
          qty: 'qty',
          value: 'amount'
        }
      )

      createSection(labels.otherSalesLbl, props.other_sales_data, 1);
      createSection(labels.itemizedSalesLbl, props.itemized_sales_data, 2);
      createSection(labels.categorySalesLbl, props.category_sales_data, 2);
      createSection(
        labels.salesByDineTypeLbl,
        props.sales_by_dine_type_data,
        2,
        {
          label: 'postypdsc',
          qty: 'itmqty',
          value: 'extprc'
        }
      );
      createSection(labels.summaryLbl, props.summary_data, 1);
      createSection(labels.discLbl, props.discounts_data, 2);
      createSection(undefined, props.cash_data, 2);
      createSection(undefined, props.all_cash_data, 1);
      createSection(labels.cardSalesLbl, props.card_sales_data, 2,
        {
          label: 'cardclass',
          qty: 'qty',
          value: 'amount'
        }
      )
      createSection(labels.otherSalesLbl, props.other_sales_data, 1);
      createSection(labels.voidLbl, props.postvoids, 1);
      createSection(labels.postRefundLbl, props.postrefunds, 1);
      data.push([""]);
      createSection(undefined, props.post_refund_data, 1)
      data.push([""]);
      data.push([props.datetime]);
      data.push(["", labels.endOFZ, ""]);
      isReprint && data.push(["", labels.reprint, ""]);
    };

    const occ2lines = (data: XZReportData, subLblCustomFormat?: {
      label: string,
      qty?: string,
      value: string
    }) => {
      if (data.qty && !data.subLbls && !data.isSubItem) {
        return [[data.label], [data.qty.toString(), "", "", data.value]];
      } else if (data.isSubItem) {
        return [
          ["", data.label],
          ["", data.qty?.toString(), "", data.value],
        ];
      } else {
        if (isArray(data.subLbls) && subLblCustomFormat) {
          return [
            [data.label],
            [data.value === "" ? "" : data.qty, "", "", "", data.value],
            ...data.subLbls.map(d => {
              return [
                "", d[subLblCustomFormat.label], "", d[subLblCustomFormat?.qty || ""], "", d[subLblCustomFormat.value],
              ]
            })
          ]
        }
        return [
          [data.label],
          [data.subLbls, "", data.qty?.toString(), data.value],
        ];
      }
    };

    const createSection = (
      title?: string,
      dataArr?: XZReportData[],
      lines?: number,
      subLblCustomFormat?: {
        label: string,
        qty?: string,
        value: string
      }
    ) => {
      data.push([""]);
      if (title) {
        data.push(["", title, ""]);
        data.push([""]);
      }
      if (dataArr) {
        for (const item of dataArr) {
          switch (lines) {
            case 2:
              for (const line of occ2lines(item, subLblCustomFormat) ?? []) {
                data.push(line as string[]);
              }
              break;
            case 1:
              if (item.qty) {
                data.push([item.label, "", item.qty.toString(), item.value]);
                break;
              }
              data.push([item.label, "", "", item.value]);
              break;
          }
        }
      }
    };

    switch (reportType) {
      case ZReadingFileTypes.PDF:
        // return generatePDFReport(props, date, isReprint);
        break;
      case ZReadingFileTypes.CSV:
        generate();
        convertCSV(data, `Z-Reading Report_${date}`);
        break;
      case ZReadingFileTypes.TXT:
        generate();
        convertText(data, `Z-Reading Report_${date}`);
        break;
    }
  };

  const generateReceiptAndSavePDF = async (cb?: (isSuccess: boolean) => void, fileName?: string, content?: any[], date?: string) => {
    const docu = document.getElementById("z-receipt");

    const pdfBase64 = await convertToPDF(docu);
    await handleReceiptPath({
      base64String: pdfBase64 || "",
      code: undefined
    },
      "z_reading",
      fileName,
      date,
      true
    );

    (pdfBase64 && docu) ?
      (await handlePrintReceipt("Receipt generated successfully", cb, content))
      :
      cb && cb(false);
  }

  // const generateReceipt = async (cb?: (isSuccess: boolean) => void, _?: string, content?: any[], __?: string) => {
  //   const docu = document.getElementById("z-receipt");

  //   const pdfBase64 = await convertToPDF(docu);

  //   pdfBase64 &&
  //     docu &&
  //     (await handlePrintReceipt("pdf", cb, content));
  // }

  return {
    saveReports,
  };
}