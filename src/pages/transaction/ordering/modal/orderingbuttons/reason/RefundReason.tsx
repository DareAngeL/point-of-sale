import React, {useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import {Checkbox} from "../../../../../../common/form/Checkbox";
import {InputText} from "../../../../../../common/form/InputText";

import {Selection} from "../../../../../../common/form/Selection";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {PosfileModel} from "../../../../../../models/posfile";
import {useNavigate} from "react-router";
import {setRefund} from "../../../../../../reducer/orderingSlice";
import {changeName, toggleFullScreen} from "../../../../../../reducer/modalSlice";
import {updateRefundReason} from "../../../../../../reducer/refundSlice";
import { useFormInputValidation } from "../../../../../../hooks/inputValidation";

interface RefundReasonProps {
  reason: PosfileModel | undefined;
}

interface RefundReasonRequiredValues {
  "Select reason *": string;
  "Other refund reason *"?: string;
}

export function RefundReason(props: RefundReasonProps) {
  console.log(props);
  const {voidreason, syspar} = useAppSelector((state) => state.masterfile);
  const appDispatch = useAppDispatch();

  const navigate = useNavigate();

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
  } = useFormInputValidation<RefundReasonRequiredValues>(undefined, {
    form: formRef,
    inputNames: ["refundreason"],
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
            path: "Other refund reason *",
            value: reason.textReason
          },
        ]
      })
    } else {
      unregisterInputs(); // unregister inputs first
      registerInputs({
        inputs: [
          {
            name: "refundreason",
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
    target: {value, name},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    appDispatch(setRefund({reason: value}));
    setReason({...reason, selectReason: value});
    changeRequiredValue(name, value);
  };

  const onClickRefundList = () => {
    navigate("/pages/ordering/refundtransactionlist");
  };

  const onSubmit = () => {
    // refundTransaction(isOther?reason.textReason : reason.selectReason, props.reason);
    appDispatch(toggleFullScreen(true));
    appDispatch(changeName({modalName: syspar.data[0].refnum}));
    onClickRefundList();
    appDispatch(
      updateRefundReason(
        isOther ? reason.textReason : reason.selectReason
      )
    );
  }

  return (
    <>
      <form id="refund" onSubmit={handleSubmit(onSubmit)}>
        <Selection
          className={isOther ? "bg-gray-200 p-1 rounded-md cursor-not-allowed" : "p-1"}
          handleSelectChange={onSelectionChange}
          description={"Select reason *"}
          id={"refundreason"}
          name={"refundreason"}
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
          description={"Other refund reason *"}
          disabled={!isOther}
          error={errors}
        />
      </form>

      <ButtonForm
        formName={"refund"}
        okBtnTxt="Confirm"
      />
    </>
  );
}
