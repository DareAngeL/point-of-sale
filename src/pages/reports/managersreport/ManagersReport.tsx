/* eslint-disable @typescript-eslint/no-explicit-any */
import { ButtonForm } from "../../../common/form/ButtonForm";
import { Checkbox } from "../../../common/form/Checkbox";
import { InputDateV2 } from "../../../common/form/InputDate";
import { Selection } from "../../../common/form/Selection";
import { useData, useGeneratePdf, useInputChange, useSelectChange, useWebsocket, useInitialization } from "./managersReportHook";
import { LoadingFragment } from "../zreading/fragments/LoadingFragment";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { useAppSelector } from "../../../store/store";
import Select from "react-select";
import { toast } from "react-toastify";
import { useRef } from "react";

export interface ManagersReportFormRequiredValues{
    "Report Type (Required *)": string;
    "Report Representation (Required *)": string;
    "Start (Required *)": string;
    "End (Required *)": string;
}


export function ManagersReport() {

    const { dineType } = useAppSelector(state => state.masterfile);
    const reportFileTypeRef = useRef<HTMLDivElement>(null);

    const {
        handleSubmit,
        registerInputs,
        changeRequiredValue,
        unregisterInputs,
        errors
    } = useFormInputValidation<ManagersReportFormRequiredValues>();

    const {data, setData} = useData();
    const {handleSelectChange} = useSelectChange(data, setData, changeRequiredValue);
    const {handleInputChange, handleInputDateChange, handleDineTypeChange, handleReportFileChange} = useInputChange(data, setData,  changeRequiredValue, reportFileTypeRef);
    const {printDoc} = useGeneratePdf();
    const {handleClickSendMessage, testPrint, startGenerating} = useWebsocket(printDoc);
    
    useInitialization(data, registerInputs, unregisterInputs);
    
    return (<>

        {startGenerating ? <LoadingFragment title={"Loading"} /> : 
        
        <>
            <form id="mr-form" onSubmit={handleSubmit(() => {
                if (data.isSave) {
                  if (data.pdf === false && data.csv === false && data.text === false) {
                    reportFileTypeRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
  
                    reportFileTypeRef.current?.classList.add("border-red-500", "shadow-lg", "shadow-red-600", "bg-red-100");
  
                    return toast.error("Please select at least one report file type.", {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: true,
                    });
                  }
                }

                handleClickSendMessage(
                    {
                        type: "Managers Report", 
                        from: data.startDate, 
                        to: data.endDate,
                        reportType: data.reportType,
                        dineTypeList: data.dineTypeList,
                        reportRepresentation: data.reportRepresentation,
                        isView: data.isView,
                        isSave: data.isSave,
                        pdf: data.pdf,
                        csv: data.csv,
                        text: data.text
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

                <Selection handleSelectChange={handleSelectChange} value={data.reportType} error={errors} description={"Report Type (Required *)"} id={"reportType"} name={"reportType"} keyValuePair={[
                    {key: "Itemized", value:"ITEMIZED"},
                    {key: "Class and subclass", value:"CLASSANDSUBCLASS"},
                    {key: "Daily dine type", value:"DAILYDINETYPE"},
                    {key: "Hourly sales", value:"HOURLYSALES"},
                    {key: "Free", value:"FREE"},
                    {key: "Void transactions", value:"VOIDTRANSACTIONS"},
                    {key: "Refund transactions", value:"REFUNDTRANSACTIONS"},
                    {key: "Refund by payment", value:"REFUNDBYPAYMENT"},
                    {key: "Refund by date", value:"REFUNDBYDATE"},
                    {key: "Per day hourly", value:"PERDAYHOURLY"},
                    {key: "Cost and profit", value:"COSTANDPROFIT"},
                    {key: "Per order taker", value:"PERORDERTAKER"},
                    {key: "Esales", value:"ESALES"},
                    {key: "Sales Summary", value:"SALESSUMMARY"},
                    {key: "Daily sales", value:"DAILYSALES"},
                    {key: "Payment type", value:"PAYMENTTYPE"},
                    {key: "Payment by Dine Type", value:"PAYMENTBYDINETYPE"},
                ]} />

                {(data.reportType === 'ITEMIZED' || data.reportType === 'PERORDERTAKER') && <Selection value={data.reportRepresentation || ''} handleSelectChange={handleSelectChange} error={errors} description={"Report Representation (Required *)"} id={"reportRepresentation"} name={"reportRepresentation"} keyValuePair={[
                    {key: "Detailed", value:"detailed"},
                    {key: "Summarized", value:"summarized"},
                ]} className="pt-2" />}

                {(data.reportType === 'FREE' || data.reportType === 'PAYMENTBYDINETYPE') && (
                  <>
                    <label className="text-[12px]">Select Dine Type</label>
                    <Select
                      className="w-[400px]"
                      isMulti
                      id="dineTypeList"
                      name="dineTypeList"
                      options={dineType.data.map((item) => {
                        return { label: item.postypdsc, value: item.postypcde };
                      })}
                      onChange={handleDineTypeChange}
                      value={data.dineTypeList.map((value) => {
                        return {
                          label: dineType.data.find((e) => e.postypcde === value)
                            ?.postypdsc,
                          value: value as unknown as any,
                        };
                      })}
                    />
                    <Checkbox
                      checked={data.dineTypeList.length === dineType.data.length}
                      id="isDineTypeAll"
                      name="isDineTypeAll"
                      description="Select All Dine Type"
                      handleInputChange={(e) => {
                        if (e.target.checked) {
                          setData({
                            ...data,
                            dineTypeList: dineType.data.map((item) => item.postypcde),
                          });
                        } else {
                          setData({
                            ...data,
                            dineTypeList: [],
                          });
                        }
                      }}
                    />
                  </>
                )}

                <InputDateV2 handleInputChange={handleInputDateChange} name={"startDate"} value={data.startDate} id={"startDate"} description={"Start (Required *)"} error={errors}  />

                <InputDateV2 handleInputChange={handleInputDateChange} name={"endDate"} value={data.endDate} id={"endDate"} description={"End (Required *)"} error={errors} />

                <div ref={reportFileTypeRef} className="grid grid-cols-3 gap-4 border p-4 rounded-lg">
                  <div className="col-span-4 flex items-center text-[13px]">
                    <p>Report File:</p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      handleInputChange={handleReportFileChange}
                      checked={data.pdf}
                      id={"pdf"}
                      name={"pdf"}
                      description={"PDF"}
                      className="flex gap-4"
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      handleInputChange={handleReportFileChange}
                      checked={data.csv}
                      id={"csv"}
                      name={"csv"}
                      description={"CSV File"}
                      className="flex gap-4"
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      handleInputChange={handleReportFileChange}
                      checked={data.text}
                      id={"text"}
                      name={"text"}
                      description={"Text File"}
                      className="flex gap-4"
                    />
                  </div>
                </div>
            </form>

            <ButtonForm isActivated formName={"mr-form"} okBtnTxt="Generate Report" onCancelBtnClick={() => {
                testPrint();
            }}/>
        
        </>
        }
        </>)
}
