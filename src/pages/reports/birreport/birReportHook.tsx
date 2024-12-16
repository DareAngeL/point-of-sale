import { useCallback, useEffect, useState } from "react"
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getItemAll } from "../../../store/actions/items.action";
import { useReportHooks } from "../managersreport/hooks/reportHooks";
import moment from "moment";
import POSPdf from "../managersreport/pdf/POSPdf";


export const useInitialization = (data: any, registerInputs: (obj: any) => void) => {
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

        // return () => {
        //   unregisterInputs();
        // };
      }, [isOn]);
}

export const useInputChange = (data: any, setData: (data:any) => void, changeRequiredValue: (name: string, value: string) => Promise<unknown>) => {

    const handleInputChange = ({target: {name, value, checked, type}}: React.ChangeEvent<HTMLInputElement>) => {
        changeRequiredValue(name, value);
        setData({
            ...data,
            [name]: type == "checkbox" ? checked : value
        })

    }

    const handleInputDateChange = (name: string, value: string) => {
      changeRequiredValue(name, value);
      setData({
          ...data,
          [name]: value
      })
    }


    return {handleInputChange, handleInputDateChange};


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
    
    const [data, setDataState] = useState({
        isSave: true,
        isView: true,
        reportType: null,
        reportRepresentation: null,
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
        // startDate: '2024-01-10',
        // endDate: '2024-01-17',
        // startDate: "2024-04-25",
        // endDate: "2024-04-25",
        isPdf: true,
        isCsv: false,
        isText: false
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


export const useWebsocket = (printCallback: (history: any, reportType: any, count: number, isSave: boolean, isView: boolean)=> void) =>{

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

    const [doc, setDoc] = useState<any>();
const {generateSalesSummary, generatePWD, generateSeniorCitizen, generateAthletes, generateDiplomat, /*generateSoloParent*/} = useReportHooks();

    const initialize = () => {

        const doc = new POSPdf({
            orientation: "landscape",
            unit: "mm",
            format: [210, 297]
        }, {generatePDF: true, generateCSV: false, generateText: false});

        setDoc(doc);
    }


  const printDoc = (history: any, report: any, /*documentCount: number*/) => {

        // if(history.length == 0){

        //     toast.error("Report empty", {
        //         hideProgressBar: true,
        //         position: toast.POSITION.TOP_CENTER
        //     });
        //     return;
        // }


        // IMPLEMENTATION OF DIFFERENT MANAGERS REPORT
        switch(report.reportType){
            case "SALESSUMMARY": {
                generateSalesSummary(doc, history, report, false);
            }
            break;
            case "SENIORCITIZEN": {
                generateSeniorCitizen(doc, history, report);
            }
            break;
            case "PWD": {
                generatePWD(doc, history, report);
            }
            break;
            case "ATHLETES": {
                generateAthletes(doc, history, report);
            }
            break;
            case "DIPLOMAT": {
                generateDiplomat(doc, history, report);
            }
            break;
            case "SOLOPARENT": {
                // generateSoloParent(doc, history, report);
            }
            break;
            default:
        }
    }

    useEffect(() => {
        initialize();
    },[])

    return {printDoc};
}
