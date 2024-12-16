import React, { useEffect, useState } from "react";
import { METHODS, MODULES } from "../../../../enums/activitylogs";
import { removeCommasFromString, removeSpecialCharactersFromString } from "../../../../helper/StringHelper";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { SystemParametersModel } from "../../../../models/systemparameters";
import { useNavigate } from "react-router";
import { useModal } from "../../../../hooks/modalHooks";
import { useAppDispatch } from "../../../../store/store";
import { putSysPar } from "../../../../store/actions/systemParameters.action";
import { toast } from "react-toastify";
import { findChangedProperties } from "../../../../helper/Comparison";


export const useFormSubmit = (loadedData: SystemParametersModel, changedData: any) => {

    const navigate = useNavigate();
    const {dispatch} = useModal();
    const otherChargesDispatch = useAppDispatch();

    const showToast = true;
    
    const {postActivity} = useUserActivityLog();

    const onSubmit = async (_: any) => {
        loadedData.takeout_scharge = removeCommasFromString(
          loadedData.takeout_scharge as any
        ) as any;
    
        loadedData.dinein_scharge = removeCommasFromString(
          loadedData.dinein_scharge as any
        ) as any;
    
        loadedData.localtax = removeCommasFromString(
          loadedData.localtax as any
        ) as any;
    
        if (changedData.length > 0) {
          let changeValue = "UPDATED: \n";
    
          changedData.forEach((item: any) => {
            changeValue += `${item.property}:${parseFloat(
              item.previousValue
            ).toFixed(2)} to ${parseFloat(item.currentValue).toFixed(2)},\n`;
          });
          changeValue = changeValue.slice(0, -2);
    
          const data = {
            method: METHODS.UPDATE,
            module: MODULES.OTHERCHARGES,
            remarks: changeValue,
          };
          postActivity(data);
        }
    
        // await requestData(loadedData, setLoadedData);

        const data = otherChargesDispatch(putSysPar(loadedData));
        toast.promise(
            data,
            {
                ...(showToast !== undefined && showToast
                ? {
                    success: {
                        hideProgressBar: true,
                        autoClose: 1500,
                        position: 'top-center',
                        render: "Successfully updated.",
                    },
                    }
                : showToast === undefined && {
                    pending: "Pending request",
                    success: {
                        hideProgressBar: true,
                        autoClose: 1500,
                        position: 'top-center',
                        render: "Successfully updated.",
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

    

    return {onSubmit}
    
}

export const useInputChange = (setLoadedData: React.Dispatch<any>, changeRequiredValue: any) => {


    const [inputData, setInputData] = useState<SystemParametersModel>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
    
        changeRequiredValue(name, value.slice(0, -1));
        setLoadedData((prev: any) => ({
            ...prev,
            [name]: parseFloat(removeSpecialCharactersFromString(value)),
        }));
        setInputData((prev: any) => ({
            ...prev,
            [name]: parseFloat(removeSpecialCharactersFromString(value)),
        }));
    };

    console.log("Input data gar", inputData);

    return {inputData, handleInputChange}

}

export const useMountData = (loadedData: SystemParametersModel, registerInputs: any, unregisterInputs: any, setChangedData: React.Dispatch<any>) => {
    
    const [baseData, setBaseData] = useState<any>();

    const handleMonitorChanges = () => {
        if (loadedData && baseData) {
            const changes = findChangedProperties(baseData, loadedData);
            setChangedData(changes);
        }
    };

    const mount = () => {

        useEffect(() => {
            registerInputs({
              inputs: [
                {
                  path: "takeout_scharge",
                  name: "takeout_scharge",
                  value: loadedData.takeout_scharge?.toString() || "",
                },
                {
                  path: "dinein_scharge",
                  name: "dinein_scharge",
                  value: loadedData.dinein_scharge?.toString() || "",
                },
                {
                  path: "localtax",
                  name: "localtax",
                  value: loadedData.localtax?.toString() || "",
                },
              ],
            });
        
            if (loadedData) {
              console.log("set");
              setBaseData(loadedData);
            }
        
            return () => {
              unregisterInputs();
            };
        }, []);
        
        useEffect(() => {
            handleMonitorChanges();
        }, [loadedData]);

    }

    return {mount};

}