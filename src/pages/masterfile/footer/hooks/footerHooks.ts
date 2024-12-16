import React, { useEffect, useState } from "react";
import { FooterModel } from "../../../../models/footer";
import { useNavigate } from "react-router";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../../enums/activitylogs";
import { findChangedProperties } from "../../../../helper/Comparison";
import { useAppDispatch } from "../../../../store/store";
import { putFooter } from "../../../../store/actions/printout.action";
import { toast } from "react-toastify";
import { useModal } from "../../../../hooks/modalHooks";

export const useInputChange = (setLoadedData: React.Dispatch<any>) => {

    const [inputData, setInputData] = useState<FooterModel>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        setLoadedData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
        setInputData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleInputDateChange = (name: string, value: string) => {
        setLoadedData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
        setInputData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    return {inputData, handleInputChange, handleInputDateChange};

}

export const useSelectChange = (setLoadedData: React.Dispatch<any>) => {

    const [selectData, setSelectData] = useState<FooterModel>();

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = e.target;

        setLoadedData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
        setSelectData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    return {selectData, handleSelectChange}

}

export const useFormSubmit = (changedData: any[], loadedData:FooterModel) => {

    const {postActivity} = useUserActivityLog();

    const navigate = useNavigate();
    const {dispatch} = useModal();
    const footerDispatch = useAppDispatch();

    const showToast = true;

    const handleSubmit = async (e: React.FormEvent) => {
        
        e.preventDefault();
    
        if (changedData.length > 0) {
          let changeValue = "";
          changedData.forEach((item: any) => {
            if (item.property === "officialreceipt") {
              changeValue += `${item.property}:${
                item.previousValue == 1 ? "YES" : "NO"
              } to ${item.currentValue == 1 ? "YES" : "NO"},\n`;
            } else {
              changeValue += `${item.property}:${item.previousValue} to ${item.currentValue},\n`;
            }
          });
          changeValue = changeValue.slice(0, -2);
          console.log(changeValue);
    
          const data = {
            method: METHODS.UPDATE,
            module: MODULES.FOOTER,
            remarks: changeValue,
          };
          postActivity(data);
        }

        const data = footerDispatch(putFooter(loadedData));
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

    return {changedData, handleSubmit};

}

export const useMonitorChanges = (loadedData : FooterModel, setChangedData: React.Dispatch<any>) => {

    
    const [baseData, setBaseData] = useState<any>();

    const handleMonitorChanges = () => {
        if (loadedData && baseData) {
            const changes = findChangedProperties(baseData, loadedData);
            setChangedData(changes);
        }
    };

    useEffect(() => {
        handleMonitorChanges();
    }, [loadedData]);

    useEffect(() => {
        if (loadedData) {
            console.log("set");
            setBaseData(loadedData);
        }
    }, []);

}