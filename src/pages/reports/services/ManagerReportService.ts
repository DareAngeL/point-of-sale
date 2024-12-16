import moment from "moment";
import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import jsPDF from "jspdf";
import {DownloadTextItemized} from "./Itemized/DownloadTextItemized";
import {DownloadTextClassAndSubClass} from "./ClassAndSubClass/DownloadTextClassAndSubClass";
import {DownloadTextDailyDineType} from "./DailyDineType/DownloadTextDailyDineType";
import {DownloadTextHourlySales} from "./HourlySales/DownloadTextHourlySales";
import {DownloadTextFree} from "./Free/DownloadTextFree";
import {DownloadTextRefundTransaction} from "./RefundTransaction/DownloadTextRefundTransaction";
import {DownloadTextVoidTransaction} from "./VoidTransaction/DownloadTextVoidTransaction";
import {DownloadTextPerDayHourly} from "./PerDayHourly/DownloadTextPerDayHourly";
import {DownloadTextCostAndProfit} from "./CostAndProfit/DownloadTextCostAndProfit";
import {DownloadTextPaymentType} from "./PaymentType/DownloadTextPaymentType";
import {DownloadTextPerOrderTaker} from "./PerOrderTaker/DownloadTextPerOrderTaker";
import {DownloadTextESales} from "./ESales/DownloadTextESales";
import {DownloadTextSalesSummary} from "./SalesSummary/DownloadTextSalesSummary";
import {useService} from "../../../hooks/reportHooks";
import {ItemizedService} from "./Itemized/ItemizedService";
import {PrintHeader} from "./PrintHeader";
import {PrintFooter} from "./PrintFooter";
import {PrintItemized} from "./Itemized/PrintItemized";
import {ClassAndSubClassService} from "./ClassAndSubClass/ClassAndSubClassService";
import {PrintClassAndSubClass} from "./ClassAndSubClass/PrintClassAndSubClass";
import {CostAndProfitService} from "./CostAndProfit/CostAndProfitService";
import {PrintCostAndProfit} from "./CostAndProfit/PrintCostAndProfit";
import {FreeService} from "./Free/FreeService";
import {PrintFree} from "./Free/PrintFree";
import {HourlySalesService} from "./HourlySales/HourlySalesService";
import {PrintHourlySales} from "./HourlySales/PrintHourlySales";
import {PrintPaymentType} from "./PaymentType/PrintPaymentType";
import {PrintESales} from "./ESales/PrintESales";
import {PrintPerDayHourly} from "./PerDayHourly/PrintPerDayHourly";
import {PerDayHourlyService} from "./PerDayHourly/PerDayHourlyService";
import {RefundTransactionService} from "./RefundTransaction/RefundTransactionService";
import {RefundByPaymentService} from "./RefundByPayment/RefundByPaymentService";
import {PrintRefundTransaction} from "./RefundTransaction/PrintRefundTransaction";
import {PrintRefundByPayment} from "./RefundByPayment/PrintRefundByPayment";
import {VoidTransactionService} from "./VoidTransaction/VoidTransactionService";
import {PrintVoidTransaction} from "./VoidTransaction/PrintVoidTransaction";
import {PrintPerOrderTaker} from "./PerOrderTaker/PrintPerOrderTaker";
import {PrintSalesSummary} from "./SalesSummary/PrintSalesSummary";
import {PrintDailySales} from "./DailySales/PrintDailySales";
import {DownloadTextDailySales} from "./DailySales/DownloadDailySales";
import {PaymentTypeService} from "./PaymentType/PaymentTypeService";
import {PrintDailyDineType} from "./DailyDineType/PrintDailyDineType";
import {DailyDineTypeService} from "./DailyDineType/DailyDineTypeService";
import {ESalesService} from "./ESales/ESalesService";
import {DownloadTextRefundByPayment} from "./RefundByPayment/DownloadTextRefundByPayment";
import {RefundByDateService} from "./RefundByDate/RefundByDateService";
import {PrintRefundByDate} from "./RefundByDate/PrintRefundByDate";
import { getTransactions } from "../../../store/actions/transaction.action";
export function ManagerReportService() {
  const {syspar, header, dineType, freeReason, warehouse, company} =
    useAppSelector((state) => state.masterfile);

  const {transactions} = useAppSelector((state) => state.order);
  const dispatch = useAppDispatch();

  let masterFiles = {
    syspar: syspar.data[0],
    header: header.data[0],
    company: company.data[0],
    dineType: dineType.data,
    freeReason: freeReason.data,
    warehouse: warehouse.data,
  };

  const printManagersReport = async (
    reportType: string | undefined,
    formValue: any,
    reportData: any
  ) => {
    let initPrint = {
      LEFT: 0,
      TOP: 0,
      totalPagesExp: "{total_pages_count_string}",
      reportSetup: {},
    };

    let jspdf: any;
    let printHeader: any;
    switch (reportType) {
      case "ITEMIZED":
        console.log();

        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "Legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintItemized(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "CLASSANDSUBCLASS":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "Legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintClassAndSubClass(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "DAILYDINETYPE":
        initPrint.reportSetup = {
          orientation: "portrait",
          unit: "mm",
          format: "Letter",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintDailyDineType(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "HOURLYSALES":
        initPrint.reportSetup = {
          orientation: "portrait",
          unit: "mm",
          format: "Letter",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintHourlySales(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "FREE":
        initPrint.reportSetup = {
          orientation: "portrait",
          unit: "mm",
          format: "letter",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintFree(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "VOIDTRANSACTIONS":
        initPrint.reportSetup = {
          orientation: "portrait",
          unit: "mm",
          format: "Letter",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintVoidTransaction(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "REFUNDTRANSACTIONS":
        initPrint.reportSetup = {
          orientation: "portrait",
          unit: "mm",
          format: "Letter",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        console.log("eyy", reportData);

        jspdf = await PrintRefundTransaction(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "REFUNDBYPAYMENT":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        console.log("eyy data ulet", reportData);

        jspdf = await PrintRefundByPayment(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );
        jsPdfToPrint(jspdf, "pdf", reportType, formValue);

        break;
      case "REFUNDBYDATE":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        console.log("eyy data ulet", reportData);

        jspdf = await PrintRefundByDate(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );
        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "PERDAYHOURLY":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintPerDayHourly(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "COSTANDPROFIT":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintCostAndProfit(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "PERORDERTAKER":
        initPrint.reportSetup = {
          orientation: "portrait",
          unit: "pt",
          format: "Letter",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintPerOrderTaker(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "ESALES":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintESales(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "SALESSUMMARY":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintSalesSummary(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "DAILYSALES":
        initPrint.reportSetup = {
          orientation: "landscape",
          unit: "mm",
          format: "legal",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintDailySales(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
      case "PAYMENTTYPE":
        initPrint.reportSetup = {
          orientation: "portrait",
          unit: "mm",
          format: "Letter",
        };
        jspdf = new jsPDF(initPrint.reportSetup);

        printHeader = await PrintHeader(
          jspdf,
          reportType,
          formValue,
          initPrint,
          masterFiles
        );

        jspdf = printHeader.jspdf;
        jspdf = await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );

        initPrint.LEFT = printHeader.LEFT;
        initPrint.TOP = printHeader.TOP;

        jspdf = await PrintPaymentType(
          jspdf,
          reportType,
          formValue,
          reportData,
          initPrint,
          masterFiles
        );

        jsPdfToPrint(jspdf, "pdf", reportType, formValue);
        break;
    }
  };

  const jsPdfToPrint = (
    data: any | undefined,
    extension: string,
    reportType: string,
    formValue: any
  ) => {
    if (extension !== "pdf") {
      dyanmicDownloadByHtmlTag({
        fileName: `${reportType}_${moment().format(
          "MMDDYYYYHHmmss"
        )}.${extension}`,
        text: data,
      });
    } else {
      if (formValue?.repOptionSave) {
        data.save(`${reportType}_${moment().format("MMDDYYYYHHmmss")}`);
      }
      if (formValue?.repOptionView) {
        window.open(URL.createObjectURL(data.output("blob")), "_blank");
      }
    }
  };

  const dynamicDownloadTxt = async (
    reportData: any,
    reportType: string,
    formValue: any
  ) => {
    let dataFile = "";
    switch (reportType) {
      case "ITEMIZED":
        dataFile = await DownloadTextItemized(
          reportData,
          formValue,
          masterFiles
        );
        break;
      case "CLASSANDSUBCLASS":
        dataFile = await DownloadTextClassAndSubClass(
          reportData,
          formValue,
          masterFiles
        );
        break;
      case "DAILYDINETYPE":
        dataFile = await DownloadTextDailyDineType(reportData, masterFiles);
        break;
      case "HOURLYSALES":
        dataFile = await DownloadTextHourlySales(
          reportData,
          formValue,
          masterFiles
        );
        break;
      case "FREE":
        dataFile = await DownloadTextFree(reportData, masterFiles);
        break;
      case "VOIDTRANSACTIONS":
        dataFile = await DownloadTextVoidTransaction(reportData, masterFiles);
        break;
      case "REFUNDTRANSACTIONS":
        dataFile = await DownloadTextRefundTransaction(reportData, masterFiles);
        break;
      case "REFUNDBYPAYMENT":
        dataFile = await DownloadTextRefundByPayment(reportData, masterFiles);
        break;
      case "REFUNDBYDATE":
        dataFile = await DownloadTextRefundByPayment(reportData, masterFiles);
        break;
      case "PERDAYHOURLY":
        dataFile = await DownloadTextPerDayHourly(
          reportData,
          formValue,
          masterFiles
        );
        break;
      case "COSTANDPROFIT":
        dataFile = await DownloadTextCostAndProfit(
          reportData,
          formValue,
          masterFiles
        );
        break;
      case "PERORDERTAKER":
        dataFile = await DownloadTextPerOrderTaker(
          reportData,
          formValue,
          header
        );
        break;
      case "ESALES":
        dataFile = await DownloadTextESales(reportData, formValue, header);
        break;
      case "SALESSUMMARY":
        dataFile = await DownloadTextSalesSummary(
          reportData,
          formValue,
          company
        );
        break;
      case "DAILYSALES":
        dataFile = await DownloadTextDailySales(reportData, formValue, company);
        break;
      case "PAYMENTTYPE":
        dataFile = await DownloadTextPaymentType(reportData, formValue, header);
        break;
    }

    if (formValue?.repGenText) {
      jsPdfToPrint(dataFile, "txt", reportType, formValue);
    }
    if (formValue?.repGenCsv) {
      const regex2 = /,/g;
      dataFile = dataFile.replace(regex2, "");
      const regex = /\t/g;
      dataFile = dataFile.replace(regex, ",");
      jsPdfToPrint(dataFile, "csv", reportType, formValue);
    }
  };

  const dyanmicDownloadByHtmlTag = (arg: {fileName: string; text: string}) => {
    const element = document.createElement("a");
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  };

  const managersReportData = async (
    options?: object,
    reptyp?: string,
    formValue?: any
  ) => {
    const {getData} = useService<any>();

    let returnData: any = [];
    if (reptyp === "SALESSUMMARY" || reptyp === "DAILYSALES") {
      const posData = await getData("reading", options, () => {});
      if (posData) {
        returnData = posData.data;
      }
    } else if (reptyp === "PERORDERTAKER") {
      console.log("getting it here");
      const posData = await getData("posfile/orderreport", options, () => {});

      if (posData) {
        returnData = posData.data;
      }
    } else if (reptyp === "ESALES") {
      const posData = await getData("esales", options, () => {});
      if (posData) {
        returnData = await ESalesService(posData.data);
      }
    } else {
      const posData = await getData("posfile/filter", options, () => {});
      if (posData.data.length > 0) {
        switch (reptyp) {
          case "ITEMIZED":
            returnData = await ItemizedService(
              posData.data,
              formValue,
              masterFiles
            );
            break;
          case "CLASSANDSUBCLASS":
            returnData = await ClassAndSubClassService(
              posData.data,
              formValue,
              masterFiles
            );
            break;
          case "DAILYDINETYPE":
            returnData = await DailyDineTypeService(
              posData.data,
              formValue,
              masterFiles
            );
            break;
          case "HOURLYSALES":
            returnData = await HourlySalesService(posData.data, formValue);
            break;
          case "FREE":
            returnData = await FreeService(
              posData.data,
              formValue,
              masterFiles
            );
            break;
          case "VOIDTRANSACTIONS":
            returnData = await VoidTransactionService(
              posData.data,
              transactions
            );
            break;
          case "REFUNDTRANSACTIONS":
            returnData = await RefundTransactionService(
              posData.data,
              transactions
            );
            break;
          case "REFUNDBYPAYMENT":
            returnData = await RefundByPaymentService(
              posData.data,
              transactions
            );
            break;
          case "REFUNDBYDATE":
            returnData = await RefundByDateService(posData.data, transactions);
            break;

          case "PERDAYHOURLY":
            returnData = await PerDayHourlyService(posData.data, formValue);
            break;
          case "COSTANDPROFIT":
            returnData = await CostAndProfitService(posData.data, formValue);
            break;
          case "PAYMENTTYPE":
            returnData = await PaymentTypeService(posData.data);
            break;
        }
      }
    }

    return returnData;
  };

  useEffect(() => {
    if (!transactions.isLoaded) {
      dispatch(getTransactions());
    }
  }, []);

  return {
    managersReportData,
    printManagersReport,
    jsPdfToPrint,
    dynamicDownloadTxt,
    dyanmicDownloadByHtmlTag,
  };
}

export async function discountComputation(record: any) {
  const {getData} = useService<any>();

  let xscpwddisc: number = 0;
  let xgovdiscount: number = 0;
  let x_regdiscount: number = 0;

  const orderitemdiscount = await getData(
    "orderitemdiscount/filter",
    {
      ordercde: record.ordercde,
      itmcde: record.itmcde,
      orderitmid: record.orderitmid,
    },
    () => {}
  );
  if (orderitemdiscount.data.length > 0) {
    for (const itmdsc of orderitemdiscount.data) {
      if (itmdsc.exemptvat === "Y") {
        xscpwddisc += Number(itmdsc.amtdis);
      } else if (itmdsc.govdisc === 1) {
        xgovdiscount += Number(itmdsc.amtdis);
      } else {
        x_regdiscount += Number(itmdsc.amtdis);
      }
    }
  }

  return {
    xscpwddisc: xscpwddisc,
    xgovdiscount: xgovdiscount,
    x_regdiscount: x_regdiscount,
  };
}
