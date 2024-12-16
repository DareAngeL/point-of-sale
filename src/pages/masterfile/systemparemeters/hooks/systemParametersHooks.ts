import React, { useMemo, useState } from "react";
import { SystemParametersModel } from "../../../../models/systemparameters";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../../enums/activitylogs";
import { useAppDispatch } from "../../../../store/store";
import { putSysPar } from "../../../../store/actions/systemParameters.action";
import { useNavigate } from "react-router";
import { useModal } from "../../../../hooks/modalHooks";
import { toast } from "react-toastify";
import { isNextDay, realTimeDifferenceInMinutes } from "../../../../helper/Date";

export const useFormSubmit = (loadedData: SystemParametersModel/*, setLoadedData: React.Dispatch<any>*/) => {

    const currentTimeEnd = useMemo(()=> loadedData.isextended == 1?loadedData.timeextension || "":loadedData.timeend ||"",[loadedData]);

    const [changedData, ] = useState<any>([]);
    const [isOpEndTimeValid, setIsOpEndTimeValid] = useState({isValid: true, message: "", type: ""});

    const {postActivity} = useUserActivityLog();
    const sysparDispatch = useAppDispatch();

    const navigate = useNavigate();
    const {dispatch} = useModal();
    
    const showToast = true;

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
        onSubmit();
        return true;
      }
    }

    const onSubmit = async () => {
    
        if (changedData.length > 0) {
            let changeValue = "UPDATED: \n";

            changedData.forEach((item: any) => {
            if (item.property === "ticket_bysubclass") {
                changeValue += `${item.property}:${
                item.previousValue ? "YES" : "NO"
                } to ${item.currentValue ? "YES" : "NO"},\n`;
            } else {
                changeValue += `${item.property}:${item.previousValue} to ${item.currentValue},\n`;
            }
            });
            changeValue = changeValue.slice(0, -2);
            console.log(changeValue);

            const data = {
            method: METHODS.UPDATE,
            module: MODULES.SYSTEMPARAMETERS,
            remarks: changeValue,
            };
            postActivity(data);
        }

        const data = sysparDispatch(putSysPar(loadedData));

        toast.promise(
            data,
            {
              ...(showToast !== undefined && showToast
                ? {
                    success: {
                      hideProgressBar: true,
                      autoClose: 1500,
                      position: 'top-center',
                      render: "Successfully updated!",
                    },
                  }
                : showToast === undefined && {
                    pending: "Pending request",
                    success: {
                      hideProgressBar: true,
                      autoClose: 1500,
                      position: 'top-center',
                      render: "Successfully updated!",
                    },
                  }),
            },
            {
              toastId: "requestData",
              position: 'top-center',
            }
        );

        await data;
        dispatch();
        navigate("/pages/masterfile");

    };

    return {onSubmit, handleCustomSubmit, isOpEndTimeValid}

}

export const useInputChange = (loadedData: SystemParametersModel, setLoadedData: React.Dispatch<any>) => {

    const dispatch = useAppDispatch();
    const [inputData, setInputData] = useState<SystemParametersModel>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, checked, type} = e.target;

        const isOneHourDiff =  isOneHourDifferenceSyspar(value, loadedData.timestart || "")

        if(name == "timeend"){
            if(isOneHourDiff){
                setLoadedData((prev: any) =>(
                    {
                        ...prev,
                        timeend: "",
                        timeformat: false,
                    }
                ))
            }

            if (isNextDay(value, loadedData?.timestart || "")) {
              setLoadedData((prev: any) => ({
                ...prev,
                timeformat: true,
              }));
              setInputData((prev: any) => ({
                ...prev,
                timeformat: true,
              }));
            }
            else {
              setLoadedData((prev: any) => ({
                ...prev,
                timeformat: false,
              }));
              setInputData((prev: any) => ({
                ...prev,
                timeformat: false,
              }));
            }
        }
    
        if (loadedData.enable_default_ticket_bysubclass) {
            const data = {...loadedData};
            data.enable_default_ticket_bysubclass = false;
            
            
            dispatch(putSysPar(data));

            return;
        }
        
        if(!isOneHourDiff){
            
            setLoadedData((prev: any) => ({
                ...prev,
                [name]: type == "checkbox" ? checked : value,
            }));
            setInputData((prev: any) => ({
                ...prev,
                [name]: type == "checkbox" ? checked : value,
            }))

        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const {name, value} = e.target;
  
      setLoadedData((prev: any) => ({
          ...prev,
          [name]: value,
      }));
      setInputData((prev: any) => ({
          ...prev,
          [name]: value,
      }));
    }

    const handleInputArrowClick = (name: string, type: 'up' | 'down') => {
      if (type === 'down' && loadedData[name] - 5 <= 0) {
        setLoadedData((prev: any) => ({
            ...prev,
            [name]: 0,
        }));
        setInputData((prev: any) => ({
            ...prev,
            [name]: 0,
        }))

        return;
      }

      setLoadedData((prev: any) => ({
          ...prev,
          ...(type === 'up' ? {[name]: loadedData[name]*1 + 5} : {[name]: loadedData[name]*1 - 5}),
      }));
      setInputData((prev: any) => ({
          ...prev,
          ...(type === 'up' ? {[name]: loadedData[name]*1 + 5} : {[name]: loadedData[name]*1 - 5}),
      }))
    }

    const isOneHourDifferenceSyspar = (timeend: string, timestart: string) => {
      if (!isNextDay(timeend, timestart)) return;
  
      const [timeendHrs, timeendMins] = timeend.split(":").map(Number);
      const [timestartHrs, timestartMins] = timestart.split(":").map(Number);
  
      let timeendedMinutes = (timeendHrs * 60) + timeendMins;
      let timestartMinutes = (timestartHrs * 60) + timestartMins; 
      
      let differenceInMinutes = timeendedMinutes - timestartMinutes
  
      if(differenceInMinutes < 0){
          differenceInMinutes += (24*60)
          differenceInMinutes = 1440 - differenceInMinutes; 
      }
  
      return Math.abs(differenceInMinutes) < 60;
    }

    return {inputData, handleInputChange, handleSelectChange, handleInputArrowClick}

}