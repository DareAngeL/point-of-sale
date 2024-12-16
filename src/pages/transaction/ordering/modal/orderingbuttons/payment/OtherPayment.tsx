import {useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import {setOtherpayment, setPayment} from "../../../../../../reducer/paymentSlice";
import {Cash} from "./Cash";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {InputText} from "../../../../../../common/form/InputText";
import {PaymentButtons} from "../../../common/buttons/PaymentButtons";
import {toast} from "react-toastify";
import { useFormInputValidation } from "../../../../../../hooks/inputValidation";

interface OtherPaymentProps {
  onCancel: () => void;
}

interface OtherPaymentRequiredValues {
  "Reference Code *": string;
}

export function OtherPayment({onCancel}: OtherPaymentProps) {
  const dispatch = useAppDispatch();
  const {paymentType} = useAppSelector((state) => state.masterfile);
  const { activePayment, payment } = useAppSelector((state) => state.payment);

  const [next, setNext] = useState(false);
  const [otherPay, setOtherPay] = useState("");

  console.log("GAGI PAR", paymentType.data);
  // const {postActivity} = useUserActivityLog();

  // const paymentModal = useContext(PaymentContext);

  const [other, setOther] = useState<{
    approvalcode: string;
  }>({
    approvalcode: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const {
    handleSubmit,
    changeRequiredValue,
    errors,
  } = useFormInputValidation<OtherPaymentRequiredValues>(undefined, {
    form: formRef,
    inputNames: ["approvalcode"],
    data: other
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    changeRequiredValue(name, value);
    setOther(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  const onSubmit = () => {
    if (!other?.approvalcode) {
      return toast.error("Please complete the fields first.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    // setPayment();
    const updatedPayment = payment.data.map((pay) => {
      if (pay.id === activePayment.data.id) {
        return {
          ...pay,
          itmcde: otherPay,
        };
      }
      return pay;
    });

    dispatch(setPayment(updatedPayment));
    dispatch(setOtherpayment(other));
    setNext(true);
  };

  return (
    <>
      {next ? (
        <Cash onCancel={() => onCancel()} />
      ) : (
        <>
          <div>
            {paymentType.data.map((payment) => (
              <PaymentButtons
                buttonName={payment.paytyp}
                onClick={() => {
                  setOtherPay(payment.paytyp);
                }}
              />
            ))}

            <div>Mode of payment : {otherPay}</div>
            <span className="text-[10px] text-gray-500">
              Fields with (*) asterisk are required
            </span>
            <form ref={formRef} id="cardform" onSubmit={handleSubmit(onSubmit)}>
              <InputText
                handleInputChange={onChange}
                name={"approvalcode"}
                value={other?.approvalcode}
                id={"approvalcode"}
                description={"Reference Code *"}
                disabled={otherPay.length == 0}
                error={errors}
                required
              />
            </form>
          </div>

          <ButtonForm
            formName={"cardform"}
            okBtnTxt="Next"
            // onCancelBtnClick={() => {}}
            overrideOnCancelClick={() => onCancel()}
          />
        </>
      )}
    </>
  );
}
