import {useContext, useEffect, useRef, useState} from "react";
import {InputText} from "../../../../common/form/InputText";
import {ButtonForm} from "../../../../common/form/ButtonForm";
import {useServiceCashiering} from "../../../../hooks/cashieringHooks";
import {CashieringContext} from "./CashieringModal";
import {toast} from "react-toastify";
import {useModal} from "../../../../hooks/modalHooks";
import {handleReason} from "../../../../reducer/transactionSlice";
import {useAppDispatch} from "../../../../store/store";
import {useAppSelector} from "../../../../store/store";
import {Selection} from "../../../../common/form/Selection";
import {Checkbox} from "../../../../common/form/Checkbox";
import { useFormInputValidation } from "../../../../hooks/inputValidation";

interface CashieingReasonRequiredValues {
  "Reason *": string;
  "Custom Reason *": string;
}

export function ReasonModal() {
  const {cashioreason} = useAppSelector((state) => state.masterfile);
  const {cashieringType} = useAppSelector((state) => state.transaction);

  const [reason, setReason] = useState("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const {onSubmitData} = useServiceCashiering();
  const {inputValue} = useContext(CashieringContext);
  const {dispatch: modalDispatch} = useModal();
  const appDispatch = useAppDispatch();

  const formRef = useRef<HTMLFormElement>(null);
  const {
    handleSubmit,
    changeRequiredValue,
    registerInputs,
    unregisterInputs,
    errors,
  } = useFormInputValidation<CashieingReasonRequiredValues>(undefined, {
    form: formRef, 
    inputNames: ["type"],
    data: reason
  });

  useEffect(() => {
    // re-register inputs when isCustom changes
    if (isCustom) {
      unregisterInputs(); // unregister previous input
      registerInputs({
        inputs: [{
          name: "reason",
          path: "Custom Reason *",
          value: reason
        }]
      })
    } else {
      unregisterInputs(); // unregister previous input
      registerInputs({
        inputs: [{
          name: "type",
          path: "Reason *",
          value: reason
        }]
      })
    }
  }, [isCustom])

  const handleOnOkBtnClick = () => {
    if (reason.trim() === "") {
      toast.error("Please add a reason", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });

      return;
    }

    onSubmitData(inputValue, () => {
      // on submit success
      modalDispatch(); // close reason modal
    });
  };

  return (
    <>
      <form ref={formRef} id="reason" onSubmit={handleSubmit(handleOnOkBtnClick)}>
        <Selection
          id="type"
          name="type"
          handleSelectChange={(e) => {
            changeRequiredValue("type", e.target.value);
            setReason(e.target.value);
            appDispatch(handleReason({reason: e.target.value}));
          }}
          description="Reason *"
          value={!isCustom ? reason : ""}
          keyValuePair={cashioreason.data
            .filter((cashTyp) => {
              if (cashieringType === "CASH IN") {
                return cashTyp.type === "CASHIN";
              }
              if (cashieringType === "CASH OUT") {
                return cashTyp.type === "CASHOUT";
              }
            })
            .map((item) => {
              return {value: item.cashioreason, key: item.cashioreason};
            })}
          disabled={isCustom ? true : false}
          error={errors}
          required
        />

        <Checkbox
          handleInputChange={() => {
            setIsCustom(!isCustom);
            setReason("");
          }}
          checked={isCustom}
          id={"isCustom"}
          name={"isCustom"}
          description={"Custom Reason"}
        />

        <InputText
          handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            changeRequiredValue("reason", e.target.value);
            setReason(e.target.value);
            appDispatch(handleReason({reason: e.target.value}));
          }}
          name={"reason"}
          value={isCustom ? reason : ""}
          id={"reason"}
          description={"Custom Reason *"}
          disabled={isCustom ? false : true}
          error={errors}
          required
        />
      </form>
      <ButtonForm
        isShowWarningCancel
        data={{reason}}
        formName={"reason"}
        okBtnTxt="Confirm"
      />
    </>
  );
}
