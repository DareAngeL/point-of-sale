import { RefObject, useCallback, useEffect, useState } from "react"
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getItemAll } from "../../../store/actions/items.action";
import { useReportHooks } from "./hooks/reportHooks";
import { toast } from "react-toastify";
import moment from "moment";
import { MultiValue } from "react-select";
import { Path } from "react-hook-form";
import { ManagersReportFormRequiredValues } from "./ManagersReport";
import POSPdf from "./pdf/POSPdf";

export type ManagersReportDataType = {
    isSave: boolean;
    isView: boolean;
    reportType: string;
    reportRepresentation: string | null;
    dineTypeList: string[];
    startDate: string;
    endDate: string;
    pdf: boolean;
    csv: boolean;
    text: boolean;
}

export const useInitialization = (data: any, registerInputs: (obj: any) => void, unregisterInputs: (paths?: Path<ManagersReportFormRequiredValues>[]) => void) => {
    const dispatch = useAppDispatch();
    const {isOn} = useAppSelector(state => state.modal);
    useEffect(()=>{
        dispatch(getItemAll());
    }, []);

    useEffect(() => {
        if (isOn) {
        //   checkLinkInputsCentral(); // enable/disable linked inputs to central
    
          registerInputs({
            inputs: [
              {
                path: "Report Type (Required *)",
                name: "reportType",
                value: data?.reportType || "",
              },
              {
                path: "Start (Required *)",
                name: "startDate",
                value: data?.startDate || "",
              },
              {
                path: "End (Required *)",
                name: "endDate",
                value: data?.endDate || "",
              },
            ],
          });
        }

        return () => {
          unregisterInputs();
        };
      }, [isOn]);

    useEffect(() => {
      if (data.reportType === 'ITEMIZED' || data.reportType === 'PERORDERTAKER') {
        registerInputs({
          inputs: [
            {
              path: "Report Representation (Required *)",
              name: "reportRepresentation",
              value: data?.reportRepresentation || "",
            },
          ]
        });
      } else {
        unregisterInputs(["Report Representation (Required *)"]);
      }
    }, [data.reportType])
}

export const useInputChange = (data: any, setData: (data:any) => void, changeRequiredValue: (name: string, value: string) => Promise<unknown>, reportFileTypeRef: RefObject<HTMLDivElement>) => {

    const handleInputChange = ({target: {name, value, checked, type}}: React.ChangeEvent<HTMLInputElement>) => {
        changeRequiredValue(name, value);
        setData({
            ...data,
            [name]: type == "checkbox" ? checked : value
        })

    }

    const handleInputDateChange = (name: string, value: string) => {
        changeRequiredValue(name, value);

        if (name === "startDate") {
            // compare dates with moment
            const startDate = moment(new Date(value));
            const endDate = moment(new Date(data.endDate));
            
            if (startDate.isAfter(endDate)) {
                return toast.error("Invalid date range", {
                    hideProgressBar: true,
                    position: toast.POSITION.TOP_CENTER
                });
            }
        }
        else {
            const startDate = moment(new Date(data.startDate));
            const endDate = moment(new Date(value));
            
            if (endDate.isBefore(startDate)) {
                return toast.error("Invalid date range", {
                    hideProgressBar: true,
                    position: toast.POSITION.TOP_CENTER
                });
            }
        }
        
        setData({
            ...data,
            [name]: value
        })

  }

    const handleDineTypeChange = (newValue: MultiValue<any>): void => {
        const dineTypeList = newValue.map((val) => val.value);

        setData({
            ...data,
            dineTypeList
        })
    }

    const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        reportFileTypeRef.current?.classList.remove("border-red-500", "shadow-lg", "shadow-red-600", "bg-red-100");
        setData({
            ...data,
            [name]: checked
        })
    }

    return {handleInputChange, handleDineTypeChange, handleInputDateChange, handleReportFileChange};


}

export const useSelectChange = (data: any, setData: (data:any) => void, changeRequiredValue: (name: string, value: string) => Promise<unknown>) => {

    const handleSelectChange = ({target: {name, value}}: React.ChangeEvent<HTMLSelectElement>) => {
        changeRequiredValue(name, value);
        setData({
            ...data,
            [name]: value
        })
        
    }

    return {handleSelectChange};

}

export const useData = () => {
    
    const [data, setDataState] = useState<ManagersReportDataType>({
        isSave: true,
        isView: true,
        reportType: '',
        reportRepresentation: null,
        dineTypeList: [],
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
        pdf: false,
        csv: false,
        text: false
    });

    const setData = (data: any) => {
        setDataState(data)
    }

    return{data, setData}

}


export const useGenerateReport = () => {

    const generateReport = () => {

    }

    return generateReport;

}


export const useWebsocket = (printCallback: (history: any, reportType: any, count: number, isSave: boolean, isView: boolean)=> void, ) =>{

    const [socketUrl] = useState("ws://localhost:8080");
    const [history, setHistory] = useState([]);
    const [end, setEnd] = useState(false);
    const [startGenerating, setStartGenerating] = useState(false);
    const [report, setReport] = useState<any>();
    const {sendJsonMessage, readyState, lastJsonMessage} = useWebSocket(socketUrl);

    // Websocket receive message
    useEffect(() => {
        if (lastJsonMessage !== null) {

            if(lastJsonMessage.status == "ongoing"){
                // setHistory((prev) => prev.concat(lastJsonMessage.data));
                setHistory((prev) => prev.concat(lastJsonMessage.data));
            }
            else if(lastJsonMessage.status == "end"){
                setStartGenerating(false);
                setEnd(true);

                printCallback(history, report, lastJsonMessage.count, report.isSave, report.isView);
            }

        }
    }, [lastJsonMessage, setHistory])


    // Send message to the server for websocket
    const handleClickSendMessage = useCallback((obj: any) => 
    {
        sendJsonMessage(obj);
        setStartGenerating(true);
        setReport(obj);

    }, []);
    
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
      }[readyState];

    const testPrint = () => {
        console.log("Historya", history);
    }


    return {handleClickSendMessage, connectionStatus, testPrint, end, startGenerating, history, report}

}


export const useGeneratePdf = () => {


    const {width, height} = useAppSelector(state => state.managersReport)

    const {generatePaymentByDinetype, generateFreeTransaction, generateItemizedReport, generateClassAndSubclassReport, generateDailyDineType,generateVoidTransactions, generateHourlySales, generateRefundByDate, generateRefundByPayment, generateRefundTransactions, generatePerDayHourly, generateCostAndProfit, generateESales, generateSalesSummary, generatePerOrderTakerV2, generateDailySales, generatePaymentType, /*generateFree*/} = useReportHooks();

    const printDoc = async (history: any, report: any) => {

        // if(history.length == 0){

        //     toast.error("Report empty", {
        //         hideProgressBar: true,
        //         position: toast.POSITION.TOP_CENTER
        //     });
        //     return;
        // }


        // IMPLEMENTATION OF DIFFERENT MANAGERS REPORT
        switch(report.reportType){
            case "PAYMENTBYDINETYPE":
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                  }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})

                generatePaymentByDinetype(doc, history, report);
                break;
            case "FREE": {
              const doc = new POSPdf({
                orientation: "landscape",
                unit: "mm",
                format: [width, height]
              }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
              
              generateFreeTransaction(doc, history, report);
            }
            break;
            case "ITEMIZED": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [400, 297]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})

                console.log('xxxPUMASOK HERE', report);

                // console.log("Page size document",doc.internal.pageSize.getHeight(),doc.internal.pageSize.getWidth());
                
                generateItemizedReport(doc, history, report);
            }
            break;
            case "CLASSANDSUBCLASS": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [400, 297]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateClassAndSubclassReport(doc, history, report);
            }
            break;
            case "DAILYDINETYPE": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [400, 297]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateDailyDineType(doc, history, report);
            }
            break;
            case "VOIDTRANSACTIONS": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateVoidTransactions(doc, history, report);
            }
            break;
            case "HOURLYSALES": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateHourlySales(doc, history, report);
            }
            break;
            case "REFUNDBYDATE": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateRefundByDate(doc, history, report);
            }
            break;
            case "REFUNDBYPAYMENT": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateRefundByPayment(doc, history, report);
            }
            break;
            case "REFUNDTRANSACTIONS": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateRefundTransactions(doc, history, report);
            }
            break;
            case "PERDAYHOURLY": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generatePerDayHourly(doc, history, report);
            }
            break;
            case "COSTANDPROFIT": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [400, 297]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateCostAndProfit(doc, history, report);
            }
            break;
            case "PERORDERTAKER": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generatePerOrderTakerV2(doc, history, report);
            }
            break;
            case "ESALES": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [500, 297]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generateESales(doc, history, report);
            }
            break;
            case "SALESSUMMARY": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                await generateSalesSummary(doc, history, report, true);
            }
            break;
            case "DAILYSALES": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                console.log("DAILY SALES");
              
                generateDailySales(doc, history, report);
            }
            break;
            case "PAYMENTTYPE": {
                const doc = new POSPdf({
                    orientation: "landscape",
                    unit: "mm",
                    format: [width, height]
                }, {generateCSV: report.csv, generateText: report.text, generatePDF: report.pdf})
                generatePaymentType(doc, history, report);
            break;
            }
            default: {
              console.log("FREEEE DEFAULT");
            }
        }
    }

    // useEffect(() => {
    //     initialize();
    // },[])

    return {printDoc};
}
