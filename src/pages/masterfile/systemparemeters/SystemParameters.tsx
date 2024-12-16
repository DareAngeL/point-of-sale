import { ButtonForm } from "../../../common/form/ButtonForm";
import { Checkbox } from "../../../common/form/Checkbox";
import { InputTime } from "../../../common/form/InputTime";
import { Selection } from "../../../common/form/Selection";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { useLoadedData } from "../../../hooks/serviceHooks";
import { SystemParametersModel } from "../../../models/systemparameters";
import { useAppSelector } from "../../../store/store";
import { useFormSubmit, useInputChange } from "./hooks/systemParametersHooks";
import { InputNumber } from "../../../common/form/InputNumber";
import "./SystemParameter.css";

interface SystemParametersFormRequiredValues {
  "Operation Time Set *": string;
  "Operation End Time *": string;
  "Display countdown in POS entry before operation ends (in minutes) *": string;
}

export function SystemParameters() {
  const { loadedData, setLoadedData } = useLoadedData<SystemParametersModel>();
  const { syspar } = useAppSelector((state) => state.masterfile);

  const { handleSubmit, register, errors } =
    useFormInputValidation<SystemParametersFormRequiredValues>();

  const { handleCustomSubmit, isOpEndTimeValid } = useFormSubmit(
    loadedData /*,setLoadedData*/
  );
  const { handleInputChange, handleSelectChange, handleInputArrowClick } =
    useInputChange(loadedData, setLoadedData);

  return (
    <>
      <form id="sp-form" onSubmit={handleSubmit(handleCustomSubmit)}>
        <div className="flex flex-col items-start">
          {syspar?.data[0]?.allow_printerstation === 1 &&
            (syspar?.data[0]
              ?.itemsubclass_printer_station_tag as unknown as number) ===
              1 && (
              <Checkbox
                description="Ticket By Sub - Classifcation (Order, void, Cancel Transaction)"
                name="ticket_bysubclass"
                id="ticket_bysubclass"
                value={loadedData.ticket_bysubclass?.toString()}
                checked={loadedData.ticket_bysubclass}
                handleInputChange={handleInputChange}
              />
            )}

          <InputTime
            description="Operation Time Set *"
            name="timestart"
            id="timestart"
            value={loadedData.timestart}
            handleInputChange={handleInputChange}
            register={register}
            error={errors}
            required
          />

          <InputTime
            description="Operation End Time *"
            name="timeend"
            id="timeend"
            value={loadedData.timeend}
            handleInputChange={handleInputChange}
            register={register}
            error={errors}
            required
          />
          {!isOpEndTimeValid.isValid && isOpEndTimeValid.type == "Time End" && (
            <div
              className="text-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span>{isOpEndTimeValid.message}</span>
            </div>
          )}

          <Checkbox
            description="Next day"
            name="timeformat"
            id="timeformat"
            value={loadedData.timeformat?.toString()}
            checked={loadedData.timeformat}
            handleInputChange={handleInputChange}
            className="pt-0"
          />

          {/* <RadioButton
            name={"timeformat"}
            id={"exemptvat"}
            radioDatas={[
              {name: "Within the day", id: "ExemptYes", value: "Y"},
              {name: "Next day", id: "ExemptNo", value: "N"},
            ]}
            value={"Y"}
            description={"Day setup"}
            handleInputChange={handleInputChange}
            // disabled={
            //   props.originalGovDiscHolder === 1 && props.singleData?.recid ? true : false
            // }
          /> */}

          <InputNumber
            inputWidth={80}
            handleInputChange={handleInputChange}
            name={"timeinterval"}
            value={loadedData.timeinterval}
            id={"timeinterval"}
            description={
              "Display countdown in POS entry before operation ends (in minutes) *"
            }
            trailingText="minutes"
            onArrowClick={handleInputArrowClick}
            showArrow
            error={errors}
            required
          />
          {!isOpEndTimeValid.isValid &&
            isOpEndTimeValid.type == "Time Interval" && (
              <div
                className="text-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span>{isOpEndTimeValid.message}</span>
              </div>
            )}

          <Selection
            handleSelectChange={handleSelectChange}
            description={"Enable Sticker Printer"}
            id={"sticker_printer"}
            name={"sticker_printer"}
            value={loadedData.sticker_printer}
            className="w-full"
            keyValuePair={[
              { key: "Yes", value: 1 },
              { key: "No", value: 0 },
            ]}
          />

          <Selection
            handleSelectChange={handleSelectChange}
            description={"Receipt Label"}
            id={"receipt_title"}
            name={"receipt_title"}
            value={loadedData.receipt_title}
            className="w-full mt-3"
            keyValuePair={[
              { key: "Official Receipt", value: 0 },
              { key: "Invoice", value: 1 },
            ]}
          />

          {loadedData.withtracc ? (
            <>
              <InputTime
                description="Reconnect Time to Central Server"
                name="recontime"
                id="recontime"
                value={loadedData.recontime}
                handleInputChange={handleInputChange}
              />

              <Checkbox
                description="Bypass transaction lock when there's no internet"
                name="bypass_trnlock"
                id="bypass_trnlock"
                value={loadedData.bypass_trnlock?.toString()}
                checked={loadedData.bypass_trnlock}
                handleInputChange={handleInputChange}
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </form>

      <ButtonForm<SystemParametersModel>
        isShowWarningCancel
        data={loadedData}
        formName={"sp-form"}
        isActivated={true}
      />
    </>
  );
}
