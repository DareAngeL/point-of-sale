import { ButtonForm } from "../../../common/form/ButtonForm";
import { Checkbox } from "../../../common/form/Checkbox";
import { InputDateV2 } from "../../../common/form/InputDate";
import { Selection } from "../../../common/form/Selection";
import { useData, useGeneratePdf, useInputChange, useSelectChange, useWebsocket, useInitialization } from "./birReportHook";
import { LoadingFragment } from "../zreading/fragments/LoadingFragment";
import { useFormInputValidation } from "../../../hooks/inputValidation";

export interface BirReportFormRequiredValues{
    "Report Type (Required *)": string;
    "Report Representation (Required *)": string;
    "Start (Required *)": string;
    "End (Required *)": string;
}


export function BirReport() {

    const {
        handleSubmit,
        registerInputs,
        changeRequiredValue,
        errors
    } = useFormInputValidation<BirReportFormRequiredValues>();

    const {data, setData} = useData();
    const {handleSelectChange} = useSelectChange(data, setData, changeRequiredValue);
    const {handleInputChange, handleInputDateChange} = useInputChange(data, setData,  changeRequiredValue);
    const {printDoc} = useGeneratePdf();
    const {handleClickSendMessage, testPrint, startGenerating} = useWebsocket(printDoc);
    
    useInitialization(data, registerInputs);
    
    return (<>  

        {startGenerating ? <LoadingFragment title={"Loading"} /> : 
        
        <>
            <form id="mr-form" onSubmit={handleSubmit(() => {

                handleClickSendMessage(
                    {
                        type: "Managers Report", 
                        from: data.startDate, 
                        to: data.endDate,
                        reportType: data.reportType,
                        isView: data.isView,
                        isSave: data.isSave
                    }
                );
            })}>

                <div className="flex justify-center shadow-md my-4">

                    <div className="px-4">
                        
                        <Checkbox checked={data.isSave} id={"isSave"} name={"isSave"} description={"Save"}  handleInputChange={handleInputChange} />

                    </div>

                    <div className="px-4">

                        <Checkbox checked={data.isView} id={"isView"} name={"isView"} description={"View"} handleInputChange={handleInputChange} />

                    </div>

                </div>

                <Selection value={data.reportType || ''} handleSelectChange={handleSelectChange} error={errors} description={"Report Type (Required *)"} id={"reportType"} name={"reportType"} keyValuePair={[
                    {key: "Sales Summary", value:"SALESSUMMARY"},
                    {key: "Senior Citizen", value:"SENIORCITIZEN"},
                    {key: "PWD", value:"PWD"},
                    {key: "Athletes discount", value:"ATHLETES"},
                    {key: "Diplomat discount", value:"DIPLOMAT"},
                    // {key: "Solo parent discount", value:"SOLOPARENT"},
                ]} />

                {(data.reportType === 'ITEMIZED' || data.reportType === 'PERORDERTAKER') && <Selection value={data.reportRepresentation || ''} handleSelectChange={handleSelectChange} error={errors} description={"Report Representation (Required *)"} id={"reportRepresentation"} name={"reportRepresentation"} keyValuePair={[
                    {key: "Detailed", value:"detailed"},
                    {key: "Summarized", value:"summarized"},
                ]} className="pt-2" />}

                <InputDateV2 handleInputChange={handleInputDateChange} name={"startDate"} value={data.startDate} id={"startDate"} description={"Start (Required *)"} error={errors}  />

                <InputDateV2 handleInputChange={handleInputDateChange} name={"endDate"} value={data.endDate} id={"endDate"} description={"End (Required *)"} error={errors} />


                {/* <span className="py-2">Report File:</span> */}

                {/* <div className="flex justify-center shadow-md">

                    <div className="px-4">
                        <Checkbox checked={data.isPdf} id={"isPdf"} name={"isPdf"} description={"PDF Print"} handleInputChange={handleInputChange}/>
                    </div>

                    <div className="px-4">
                        <Checkbox checked={data.isCsv} id={"isCsv"} name={"isCsv"} description={"CSV File"} handleInputChange={handleInputChange}/>

                    </div>

                    <div className="px-4">
                        <Checkbox checked={data.isText} id={"isText"} name={"isText"} description={"Text File"} handleInputChange={handleInputChange}/>

                    </div>

                </div> */}

            </form>

            <ButtonForm isActivated formName={"mr-form"} okBtnTxt="Generate Report" onCancelBtnClick={() => {
                testPrint();
            }}/>
        
        </>
        }
        </>)
}
