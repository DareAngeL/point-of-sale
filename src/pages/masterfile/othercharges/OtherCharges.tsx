import {ButtonForm} from "../../../common/form/ButtonForm";
import {useLoadedData} from "../../../hooks/serviceHooks";
import {SystemParametersModel} from "../../../models/systemparameters";
import {NumericFormat} from "react-number-format";
import {EmptyInputIndicator} from "../../../common/form/EmptyInputIndicator";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import { useFormSubmit, useInputChange, useMountData } from "./hooks/otherChargesHooks";
import { useState } from "react";

interface OtherChargesFormRequiredValues {
  takeout_scharge: string;
  dinein_scharge: string;
  localtax: string;
}

export function OtherCharges() {

  const {loadedData, setLoadedData} = useLoadedData<SystemParametersModel>();
  const [changedData, setChangedData] = useState<any>([]);

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    errors,
    changeRequiredValue,
  } = useFormInputValidation<OtherChargesFormRequiredValues>({
    defaultValues: {
      takeout_scharge: loadedData.takeout_scharge?.toString() || "",
      dinein_scharge: loadedData.dinein_scharge?.toString() || "",
      localtax: loadedData.localtax?.toString() || "",
    },
  });

  const {handleInputChange} = useInputChange(setLoadedData, changeRequiredValue);
  const {onSubmit} = useFormSubmit(loadedData, changedData);
  const {mount} = useMountData(loadedData, registerInputs, unregisterInputs, setChangedData);

  mount();
  
  return (
    <>
      <span className="text-[10px] text-gray-500">
        Fields with (*) asterisk are required
      </span>
      <form id="oc-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="py-3">
          <label
            htmlFor="takeout_scharge"
            className="block mb-2 text-xs text-black font-montserrat"
          >
            Takeout Service Charge *
          </label>
          <NumericFormat
            aria-invalid={errors["takeout_scharge"] ? "true" : "false"}
            decimalSeparator={"."}
            decimalScale={2}
            thousandSeparator={true}
            allowNegative={false}
            maxLength={4}
            isAllowed={(values) => {
              const {floatValue} = values;
              return (floatValue || 0) <= 100;
            }}
            name="takeout_scharge"
            id="takeout_scharge"
            className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            value={loadedData.takeout_scharge}
            suffix="%"
            onChange={handleInputChange}
          />
          {errors["takeout_scharge"]?.type === "required" && (
            <EmptyInputIndicator description="Takeout Service Charge *" />
          )}
        </div>

        <div className="py-3">
          <label
            htmlFor="dinein_scharge"
            className="block mb-2 text-xs text-black font-montserrat"
          >
            Dine-In Service Charge *
          </label>
          <NumericFormat
            aria-invalid={errors["dinein_scharge"] ? "true" : "false"}
            decimalSeparator={"."}
            thousandSeparator={true}
            allowNegative={false}
            decimalScale={2}
            maxLength={4}
            isAllowed={(values) => {
              const {floatValue} = values;
              return (floatValue || 0) <= 100;
            }}
            name="dinein_scharge"
            id="dinein_scharge"
            className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            value={loadedData.dinein_scharge}
            suffix="%"
            onChange={handleInputChange}
          />
          {errors["dinein_scharge"]?.type === "required" && (
            <EmptyInputIndicator description="Dine-In Service Charge *" />
          )}
        </div>

        <div className="py-3">
          <label
            htmlFor="dinein_scharge"
            className="block mb-2 text-xs text-black font-montserrat"
          >
            Local Tax *
          </label>
          <NumericFormat
            aria-invalid={errors["localtax"] ? "true" : "false"}
            decimalSeparator={"."}
            thousandSeparator={true}
            allowNegative={false}
            decimalScale={2}
            maxLength={4}
            isAllowed={(values) => {
              const {floatValue} = values;
              return (floatValue || 0) <= 100;
            }}
            name="localtax"
            id="localtax"
            className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            value={loadedData.localtax}
            onChange={handleInputChange}
            suffix="%"
          />
          {errors["localtax"]?.type === "required" && (
            <EmptyInputIndicator description="Local Tax *" />
          )}
        </div>

        <div>
          <div className="text-[12px]">
            <span>
              The service charge discount may be applied to any eligible<br/>discounts, such as PWD, Senior Citizen, etc.
            </span>
          </div>

          <div className="mt-[1rem] text-[12px] bg-yellow-300 p-1 font-bold">
            <b style={{color: "red"}}>Note: </b>
            <span>
              The service charge discount will only be applied if the<br/>
              transaction has a service charge.
            </span>
          </div>
        </div>
      </form>

      <ButtonForm<SystemParametersModel>
        isShowWarningCancel
        data={loadedData}
        formName={"oc-form"}
        isActivated={true}
      />
    </>
  );
}
