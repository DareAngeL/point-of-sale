import React, {useEffect, useRef, useState} from "react";
import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {Checkbox} from "../../../../../common/form/Checkbox";
import {InputText} from "../../../../../common/form/InputText";
import {Selection} from "../../../../../common/form/Selection";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {useOrderingButtons} from "../../hooks/orderingHooks";
import {PaymentMethod} from "../../enums";
import {Cash} from "./payment/Cash";
import {setPayment} from "../../../../../reducer/paymentSlice";
import {toast} from "react-toastify";
import { useFormInputValidation } from "../../../../../hooks/inputValidation";

interface FreeItemProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FreeItemRequiredValues {
  "Select reason *": string;
  "Other free reason *"?: string;
}

export function FreeItem({onSuccess, onCancel}: FreeItemProps) {
  const {freeReason} = useAppSelector((state) => state.masterfile);
  const {payment} = useAppSelector((state) => state.payment);
  const dispatch = useAppDispatch();

  const [next, setNext] = useState(false);
  const [isOther, setIsOther] = useState<boolean>(false);
  const [reason, setReason] = useState<{
    selectReason: string;
    textReason: string;
  }>({selectReason: "", textReason: ""});

  const {freeItem} = useOrderingButtons();

  const formRef = useRef<HTMLFormElement>(null);
  const {
    handleSubmit,
    changeRequiredValue,
    registerInputs,
    unregisterInputs,
    errors,
  } = useFormInputValidation<FreeItemRequiredValues>(undefined, {
    form: formRef,
    inputNames: ["freereason"],
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
            path: "Other free reason *",
            value: reason.textReason
          },
        ]
      })
    } else {
      unregisterInputs(); // unregister inputs first
      registerInputs({
        inputs: [
          {
            name: "freereason",
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
    target: {value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue("textreason", value);
    setReason({...reason, textReason: value});
  }

  const onSelectionChange = ({
    target: {value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    changeRequiredValue("freereason", value);
    setReason({...reason, selectReason: value});
  }

  const defaultOnSubmit = () => {
    if (reason.selectReason === "" && reason.textReason === "") {
      toast.error("Please select or add a reason", {
        autoClose: 2000,
        hideProgressBar: true,
        position: 'top-center',
      })

      return;
    }

    freeItem(isOther ? reason.textReason : reason.selectReason, {
      customError: "Failed to Update Item Free.",
      customSuccess: "Item Updated Free.",
    });
  }

  const paymentOnSubmit = () => {
    if (reason.selectReason == "" && !isOther) {
      return toast.error("Please complete the fields first.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    } else if (reason.textReason == "" && isOther) {
      return toast.error("Please complete the fields first.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    dispatch(
      setPayment([
        {
          ...payment.data[0],
          freereason: isOther
            ? reason.textReason
            : reason.selectReason,
        }
      ])
    );
    setNext(true);
  }

  if (!payment.data) {
    return (
      <>
        <form
          ref={formRef}
          id="freeitem"
          onSubmit={handleSubmit(defaultOnSubmit)}
        >
          <Selection
            className={isOther ? "bg-gray-200 p-1 rounded-md cursor-not-allowed" : "p-1"}
            handleSelectChange={onSelectionChange}
            description={"Select reason *"}
            id={"freereason"}
            name={"freereason"}
            value={reason.selectReason}
            keyValuePair={freeReason.data.map((fr) => {
              return {key: fr.freereason + "", value: fr.freereason + ""};
            })}
            disabled={isOther}
            error={errors}
            required
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
            description={"Other free reason *"}
            disabled={!isOther}
            error={errors}
            required
          />
        </form>

        <ButtonForm
          formName={"freeitem"}
          okBtnTxt="Confirm"
        />
      </>
    );
  } else if (payment.data.find(d => d.paymentMode === PaymentMethod.FREE)) {
    return (
      <>
        {next ? (
          <Cash onSuccess={onSuccess} />
        ) : (
          <>
            <form
              ref={formRef}
              id="freeitem"
              onSubmit={handleSubmit(paymentOnSubmit)}
            >
              <Selection
                className={isOther ? "bg-gray-200 p-1 rounded-md cursor-not-allowed" : "p-1"}
                handleSelectChange={onSelectionChange}
                description={"Select reason *"}
                id={"freereason"}
                name={"freereason"}
                value={reason.selectReason}
                keyValuePair={freeReason.data.map((fr) => {
                  return {key: fr.freereason + "", value: fr.freereason + ""};
                })}
                disabled={isOther}
                error={errors}
                required
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
                description={"Other free reason *"}
                disabled={!isOther}
                error={errors}
                required
              />
            </form>

            <ButtonForm
              formName={"freeitem"}
              okBtnTxt="Confirm"
              onCancelBtnClick={onCancel}
            />
          </>
        )}
      </>
    );
  } else {
    return (
      <>
        <form
          ref={formRef}
          id="freeitem"
          onSubmit={handleSubmit(defaultOnSubmit)}
        >
          <Selection
            className={isOther ? "bg-gray-200 p-1 rounded-md cursor-not-allowed" : "p-1"}
            handleSelectChange={onSelectionChange}
            description={"Select reason *"}
            id={"freereason"}
            name={"freereason"}
            value={reason.selectReason}
            keyValuePair={freeReason.data.map((fr) => {
              return {key: fr.freereason + "", value: fr.freereason + ""};
            })}
            disabled={isOther}
            error={errors}
            required
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
            description={"Other free reason *"}
            disabled={!isOther}
            error={errors}
            required
          />
        </form>

        <ButtonForm
          formName={"freeitem"}
          okBtnTxt="Confirm"
        />
      </>
    );
  }
}
