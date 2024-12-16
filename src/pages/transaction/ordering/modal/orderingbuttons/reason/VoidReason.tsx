import React, {useEffect, useRef, useState} from "react";
import {useAppSelector} from "../../../../../../store/store";
import {useOrderingButtons} from "../../../hooks/orderingHooks";
import {Checkbox} from "../../../../../../common/form/Checkbox";
import {InputText} from "../../../../../../common/form/InputText";
import {Selection} from "../../../../../../common/form/Selection";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {PosfileModel} from "../../../../../../models/posfile";
import {toast} from "react-toastify";
import { CustomModal } from "../../../../../../common/modal/CustomModal";
import { Spin } from "antd";
import { useFormInputValidation } from "../../../../../../hooks/inputValidation";
import { VoidReceiptV2 } from "../../../receipt/VoidReceiptV2";
interface VoidReasonProps {
  reason: PosfileModel | undefined;
  onCancel: () => void;
}

interface VoidReasonRequiredValues {
  "Select reason *": string;
  "Other void reason *"?: string;
}

export function VoidReason(props: VoidReasonProps) {
  const {voidTransaction} = useOrderingButtons();

  const {voidreason} = useAppSelector((state) => state.masterfile);
  // const {previousPosfile, previousPosfiles} = useAppSelector(state =>  state.order);
  // const dispatch = useAppDispatch();

  const [isVoiding, setIsVoiding] = useState<boolean>(false);
  const [isOther, setIsOther] = useState<boolean>(false);
  const [reason, setReason] = useState<{
    selectReason: string;
    textReason: string;
  }>({selectReason: "", textReason: ""});

  const formRef = useRef(null);
  const {
    handleSubmit,
    changeRequiredValue,
    registerInputs,
    unregisterInputs,
    errors,
  } = useFormInputValidation<VoidReasonRequiredValues>(undefined, {
    form: formRef,
    inputNames: ["voidreason"],
    data: reason
  });

  useEffect(() => {
    // re-register inputs when isOther === true
    if (isOther) {
      unregisterInputs(); // unregister inputs first
      registerInputs({
        inputs: [
          {
            name: "textreason",
            path: "Other void reason *",
            value: reason.textReason
          },
        ]
      })
    } else {
      unregisterInputs(); // unregister inputs first
      registerInputs({
        inputs: [
          {
            name: "voidreason",
            path: "Select reason *",
            value: reason.selectReason
          },
        ]
      })
    }
  }, [isOther]);

  const onCheckboxInputChange = ({
    target: {checked},
  }: React.ChangeEvent<HTMLInputElement>) => setIsOther(checked);

  const onTextInputChange = ({
    target: {value, name},
  }: React.ChangeEvent<HTMLInputElement>) => {
    setReason({...reason, textReason: value});
    changeRequiredValue(name, value);
  }

  const onSelectionChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    setReason({...reason, selectReason: value});
    changeRequiredValue(name, value);
  }

  const onSubmit = async () => {
    if (reason.selectReason.length === 0 && reason.textReason === "") {
      toast.error("Please select a reason.", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
    } else {
      setIsVoiding(true);
      await voidTransaction(
        isOther ? reason.textReason : reason.selectReason,
        props.reason
      );
      setIsVoiding(false);
    }
  }

  return (
    <>
      {isVoiding && (
        <CustomModal 
          modalName={"Transaction Voiding"} 
          maxHeight={""}
          height={60}       
        >
          <div className="flex">
            <Spin/>
            <span className="ms-5">Voiding transaction. Please wait...</span>
          </div>
        </CustomModal>
      )}

      <div className="top-0 right-0  fixed -z-20 opacity-[0] bg-white">
        <VoidReceiptV2 voidPosfile={undefined} />
      </div>
      <form
        id="void"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* <button onClick={trialOnClick}>TRY BUTTON</button> */}

        <Selection
          className={isOther ? "bg-gray-200 p-1 rounded-md cursor-not-allowed" : "p-1"}
          handleSelectChange={onSelectionChange}
          description={"Select reason *"}
          id={"voidreason"}
          name={"voidreason"}
          value={reason.selectReason}
          keyValuePair={voidreason.data.map((vr) => {
            return {key: vr.voidcde + "", value: vr.voidcde + ""};
          })}
          disabled={isOther}
          error={errors}
        />

        <Checkbox
          checked={undefined}
          id={""}
          name={""}
          description={"Others"}
          alignment="justify-between"
          className="mt-5"
          handleInputChange={onCheckboxInputChange}
        />

        <InputText
          handleInputChange={onTextInputChange}
          name={"textreason"}
          value={reason.textReason}
          id={"textreason"}
          description={"Other void reason *"}
          error={errors}
          disabled={!isOther}
        />
      </form>

      <ButtonForm
        formName={"void"}
        okBtnTxt="Confirm"
        overrideOnCancelClick={() => {
          // Navigate("/pages/ordering/voidtransaction");
          props.onCancel();
        }}
      />
    </>
  );
}
