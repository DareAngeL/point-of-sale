import {  useMemo, useState } from "react";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { Checkbox } from "../../../common/form/Checkbox";
import { InputTime } from "../../../common/form/InputTime";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { SystemParametersModel } from "../../../models/systemparameters";
import { useAppDispatch } from "../../../store/store";
import {  useInputChange } from "../../masterfile/systemparemeters/hooks/systemParametersHooks";
import { InputNumber } from "../../../common/form/InputNumber";
import { isNextDay, realTimeDifferenceInMinutes } from "../../../helper/Date";
import { putSysPar } from "../../../store/actions/systemParameters.action";
import { useChangeNameModal } from "../../../hooks/modalHooks";
import { useNavigate } from "react-router";
import { useLoadedData } from "../../../hooks/serviceHooks";
import { removeXButton } from "../../../reducer/modalSlice";


interface OperationSetupFormRequiredValues {
    "Operation Time Set *": string;
    "Operation End Time *": string;
    "Display countdown in POS entry before operation ends (in minutes) *": string;
}

export const OperationSetup = () =>{

    const dispatch = useAppDispatch();
    const { modalNameDispatch } = useChangeNameModal();
    const navigate = useNavigate();

    const {loadedData, setLoadedData} = useLoadedData<SystemParametersModel>();

    const [isOpEndTimeValid, setIsOpEndTimeValid] = useState({isValid: true, message: "", type: ""});

    const currentTimeEnd = useMemo(()=> loadedData.isextended == 1?loadedData.timeextension || "":loadedData.timeend ||"",[loadedData]);

    const {handleSubmit, register, errors} =
    useFormInputValidation<OperationSetupFormRequiredValues>();
    
    const { handleInputChange, handleInputArrowClick} = useInputChange(loadedData, setLoadedData);

    const navigateToSetup = () => {
        modalNameDispatch("Server Setup");
        // dispatchModal();
        dispatch(removeXButton(true));
        navigate("/pages/login/setup");
    }

    const handleCustomSubmit = () => {
        if((loadedData.timeinterval || 0)>realTimeDifferenceInMinutes(currentTimeEnd as string || '', loadedData.timestart||"")){
            setIsOpEndTimeValid({isValid: false, message: "Ensure Display Countdown Does Not Exceed 23 Hours or End Time Hours", type: "Time Interval"});
            console.log("atesting", realTimeDifferenceInMinutes(currentTimeEnd as string || '', loadedData.timestart||""));
            return false;
          }
    
          if (isNextDay(currentTimeEnd as string || '', loadedData.timestart||'') && !loadedData.timeformat) {
            setIsOpEndTimeValid({isValid: false, message: "Ensure Operation Duration Does Not Exceed 23 Hours",type: "Time End"});
            return false;
          } 
          else if (!isNextDay(currentTimeEnd as string || '', loadedData.timestart||'') && loadedData.timeformat) {
            setIsOpEndTimeValid({isValid: false, message: "Ensure Operation Duration Does Not Exceed 23 Hours",type: "Time End"});
            return false;
          }
          else {
            setIsOpEndTimeValid({isValid: true, message: "",type: ""});
            dispatch(putSysPar(loadedData));
            
            
            const userDataPath = window.electronAPI?.getUserDataPath();
            window.electronAPI?.writeFileSync(userDataPath+"/isFirstRun.txt", "1");

            navigateToSetup();
            return true;
          }
    }
    return (
    <>
      <form id="sp-form" onSubmit={handleSubmit(handleCustomSubmit)}>
        <div className="flex flex-col items-start">
         
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
          {!isOpEndTimeValid.isValid &&isOpEndTimeValid.type == "Time End" && (
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


          <InputNumber
            inputWidth={80}
            handleInputChange={handleInputChange}
            name={"timeinterval"}
            value={loadedData.timeinterval}
            id={"timeinterval"}
            description={"Display countdown in POS entry before operation ends (in minutes) *"}
            trailingText="minutes"
            onArrowClick={handleInputArrowClick}
            showArrow
            error={errors}
            required
          />
          {!isOpEndTimeValid.isValid && isOpEndTimeValid.type=="Time Interval" && (
            <div
              className="text-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span>{isOpEndTimeValid.message}</span>
            </div>
          )}

          
        </div>
      </form>

      <ButtonForm<SystemParametersModel>
        isShowWarningCancel
        data={loadedData}
        formName={"sp-form"}
        isActivated={true}
        onCancelBtnClick={() => dispatch(removeXButton(false))}
      />
    </>
    );


}