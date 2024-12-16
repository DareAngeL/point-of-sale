import React, { useRef, useState} from "react";
import {InputText} from "../../../../../../common/form/InputText";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import { InputDateV2} from "../../../../../../common/form/InputDate";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import {setCheck} from "../../../../../../reducer/paymentSlice";
import {Cash} from "./Cash";
import {toast} from "react-toastify";
import { useFormInputValidation } from "../../../../../../hooks/inputValidation";

interface CheckProps {
  onCancel: () => void;
}

interface CheckFormRequiredValues {
  "Check Bank *": string;
  "Check Number *": string;
  "Check Date *": string;
}

export function Check({onCancel}: CheckProps) {
  const dispatch = useAppDispatch();
  const {payment, check} = useAppSelector((state) => state.payment);

  const [next, setNext] = useState(false);
  // const {postActivity} = useUserActivityLog();

  // const paymentModal = useContext(PaymentContext);
  const formRef = useRef<HTMLFormElement>(null);

  const [cheque, setCheque] = useState<{
    chkbnk: string;
    chknum: string;
    chkdte: string;
  }>({
    chkbnk: "",
    chknum: "",
    chkdte: "",
  });

  const {
    handleSubmit,
    changeRequiredValue,
    errors,
  } = useFormInputValidation<CheckFormRequiredValues>(undefined, {
    form: formRef, 
    inputNames: ["chkbnk", "chknum", "chkdte"],
    data: cheque
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    console.log(cheque);

    changeRequiredValue(name, value);
    setCheque(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  const onDateChange = (name: string, value: string) => {

    changeRequiredValue(name, value);
    setCheque(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  const onSubmit = () => {
    // setPayment();
    // console.log(c);
    if (!cheque?.chkbnk || !cheque?.chknum || !cheque?.chkdte) {
      return toast.error("Please complete the fields first.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    console.log(cheque);
    console.log(payment);

    dispatch(setCheck(cheque));
    setNext(true);

    console.log(check);
  };

  return (
    <>
      {next ? (
        <Cash onCancel={() => onCancel()} />
      ) : (
        <>
          <div>
            <span className="text-[10px] text-gray-500">
              Fields with (*) asterisk are required
            </span>
            <form ref={formRef} id="checkform" onSubmit={handleSubmit(onSubmit)}>
              <InputText
                handleInputChange={onChange}
                name={"chkbnk"}
                value={cheque?.chkbnk}
                id={"chkbnk"}
                description={"Check Bank *"}
                error={errors}
                required
              />

              <InputText
                handleInputChange={onChange}
                name={"chknum"}
                value={cheque?.chknum}
                id={"chknum"}
                description={"Check Number *"}
                error={errors}
                required
              />

              <InputDateV2
                handleInputChange={onDateChange}
                name={"chkdte"}
                id={"chkdte"}
                description={"Check Date *"}
                value={cheque?.chkdte}
                error={errors}
                required
              />
            </form>
          </div>

          <ButtonForm
            formName={"checkform"}
            okBtnTxt="Next"
            // onCancelBtnClick={() => {}}
            overrideOnCancelClick={() => onCancel()}
          />
        </>
      )}
    </>
  );
}
