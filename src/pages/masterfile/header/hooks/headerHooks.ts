import { useEffect, useState } from "react";
import { VATRegexNoDblDashes } from "../../../../data/regex";
import { HeaderfileModel } from "../../../../models/headerfile";
import { BranchfileModel } from "../../../../models/branchfile";
import { getBranch } from "../../../../store/actions/branchfile.action";
import { useNavigate } from "react-router";
import { METHODS, MODULES } from "../../../../enums/activitylogs";
import { SubmitHandler } from "react-hook-form";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { putHeader } from "../../../../store/actions/printout.action";
import { useModal } from "../../../../hooks/modalHooks";
import { toast } from "react-toastify";

interface HeaderFormRequiredValues {
    "Business Name 1 *": string;
    "Business Name 2 *": string;
    "Address 1 *": string;
    "Address 2 *": string;
    VAT: string;
}

export const useInitializeData = (dispatch: any) => {

  const initializeData = () => {
      useEffect(()=>{
          dispatch(getBranch());
          // dispatch(getHasTransactions()); - This makes the header loads forever
      }, [])
  }

  return {initializeData}
} 

export const useInputChange = (setLoadedData: React.Dispatch<any>, changeRequiredValue: (name: string, value: string) => Promise<unknown>) => {

    const [inputData, setInputData] = useState<HeaderfileModel>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "tin" && !VATRegexNoDblDashes.test(value)) return;

        changeRequiredValue(name, value);

        setLoadedData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
        setInputData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    return {inputData, handleInputChange}

}

export const useSelectChange = (setLoadedData: React.Dispatch<any>, masterfile:any, changeRequiredValue: (name: string, value: string) => Promise<unknown>) => {

    const [selectData, setSelectData] = useState<HeaderfileModel>();

    const {branch} = masterfile;

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        changeRequiredValue(name, value);
    
        let branchModel: BranchfileModel | undefined;
        if (name === "brhcde") {
            branchModel = branch?.data?.find((d: any) => d.brhcde === value);
            setLoadedData((prev: any) => ({
              ...prev,
              brhcde: value,
              warcde: ''
            }));
            setSelectData((prev: any) => ({
              ...prev,
              brhcde: value,
              warcde: ''
            }));
            changeRequiredValue('warcde', '');

            return;
        }

        setLoadedData((prev: any) => ({
          ...prev,
          [name]: name === 'chknonvat' ? value === 'Yes' ? 1 : 0 : value,
          ...(name === "brhdsc" && {
            brhcde: branchModel?.brhcde,
          })
        }));
        setSelectData((prev: any) => ({
            ...prev,
            [name]: value,
            ...(name === "brhdsc" && {
              brhcde: branchModel?.brhcde,
            })
          }));
      };

      return {selectData, handleSelectChange}

}

export const useFormSubmit = (changedData: any, loadedData: HeaderfileModel, dispatch: any) => {

    const navigate = useNavigate();
    const {dispatch: modalDispatch} = useModal();
    const { postActivity } = useUserActivityLog();
    const showToast = true;

    const onSubmit: SubmitHandler<HeaderFormRequiredValues> = async () => {
        if (changedData.length > 0) {
          let changeValue = "UPDATED: \n";
          changedData.forEach((item: any) => {
            if (item.property === "chknonvat") {
              changeValue += `${item.property}:${
                item.previousValue == 1 ? "YES" : "NO"
              } to ${item.currentValue == 1 ? "YES" : "NO"},\n`;
            } else {
              changeValue += `${item.property}:${item.previousValue} to ${item.currentValue},\n`;
            }
          });
          changeValue = changeValue.slice(0, -2);
          const data = {
            method: METHODS.UPDATE,
            module: MODULES.HEADER,
            remarks: changeValue,
          };
          postActivity(data);
        }


        const data = dispatch(putHeader(loadedData));
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
        modalDispatch();
        navigate("/pages/masterfile");

    };

    return {onSubmit}
}
