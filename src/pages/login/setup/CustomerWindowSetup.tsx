import React, { useEffect, useState } from "react";
import { InputNumber } from "../../../common/form/InputNumber";
import { InputText } from "../../../common/form/InputText";
import { ICustomerWindow, setCustomerWindow } from "../../../reducer/customerWindowSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { toast } from "react-toastify";
import { toggle } from "../../../reducer/modalSlice";

export enum CustomerWindowLocalStorageKey {
  KEY = 'customerwindowsetup'
}

export function CustomerWindowSetup() {

  const { customerwindowsetup } = useAppSelector((state) => state.customerwindow);
  const appDispatch = useAppDispatch();

  const [setupFormData, setSetupFormData] = useState<ICustomerWindow>(customerwindowsetup.data)

  useEffect(() => {
    const localstore = localStorage.getItem(CustomerWindowLocalStorageKey.KEY);
    if (!localstore) {
      localStorage.setItem(CustomerWindowLocalStorageKey.KEY, JSON.stringify(setupFormData));
    } else {
      setSetupFormData(JSON.parse(localstore));
    }
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setSetupFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }
 
  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    localStorage.setItem(CustomerWindowLocalStorageKey.KEY, JSON.stringify(setupFormData));
    appDispatch(setCustomerWindow(setupFormData));
    appDispatch(toggle());

    toast.success("Saved!", {
      autoClose: 500,
      position: 'top-center',
      hideProgressBar: true,
    })
  }

  return (
    <>
      <form 
        id="setup"
        onSubmit={onSave}
      >
        <InputText 
          handleInputChange={onInputChange}
          name={"welcome_title"}
          value={setupFormData.welcome_title}
          id={"welcome_title"}
          placeholder="e.g. WELCOME"
          description={"Welcome Page Title"}
        />

        <InputText 
          handleInputChange={onInputChange}
          name={"welcome_desc"}
          value={setupFormData.welcome_desc}
          id={"welcome_desc"}
          placeholder="e.g. Have a good day!"
          description={"Welcome Page Description"}
        />

        <InputText 
          handleInputChange={onInputChange}
          name={"txt_banner"}
          value={setupFormData.txt_banner}
          id={"txt_banner"}
          placeholder="e.g. WELCOME"
          description={"Text Banner"}
        />
        <InputText 
          handleInputChange={onInputChange}
          name={"ads_path"}
          value={setupFormData.ads_path}
          id={"ads_path"}
          placeholder="C:\path\to\images"
          description={"Advertisements Path"}
        />

        <InputNumber 
          handleInputChange={onInputChange} 
          name={"carousel_time_interval"}
          value={setupFormData.carousel_time_interval} 
          id={"carousel_time_interval"} 
          description={"Ads Display Time Interval"}
        />

        <div className="sticky bottom-0 flex justify-center bg-white">
          <button
            form="setup"
            type="submit"
            className={
              "px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
            }
          >
            Save
          </button>
        </div>
      </form>
    </>
  )
}