import {useAppSelector} from "../../../../../../../store/store";
import {PaymentButtons} from "../../../../common/buttons/PaymentButtons";
import {useState} from "react";
import {InputText} from "../../../../../../../common/form/InputText";
import useRefundHooks from "../../../../hooks/refundHooks";
import {RefundReceipt} from "../../../../receipt/RefundReceipt";
// interface SubmitProps {
// modeOfRefund: "CASH" | "CHECK" | "CARD" | "OTHER PAYMENT" | string;
// supportingDetails?: any;
// }
interface OtherPaymentProps {
  // onClear: () => void;
  // onSubmit: ({modeOfRefund, supportingDetails}: SubmitProps) => void;
}

export default function OtherPayment({}: OtherPaymentProps) {
  const {paymentType} = useAppSelector((state) => state.masterfile);
  const [otherPay, setOtherPay] = useState("");
  const {handleSubmit} = useRefundHooks();

  const [other, setOther] = useState<{
    approvalcode: string;
  }>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setOther(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  console.log(otherPay);
  console.log(other?.approvalcode);

  return (
    <>
      <div>
        <div className="top-0 right-0  fixed -z-20 opacity-[0] bg-white">
          <RefundReceipt voidPosfile={undefined} modeOfRefund={otherPay} />
        </div>
        {paymentType.data.map((payment, index) => (
          <PaymentButtons
            key={index}
            buttonName={payment.paytyp}
            onClick={() => {
              setOtherPay(payment.paytyp);
            }}
          />
        ))}

        <div>Mode of payment : {otherPay}</div>
        <InputText
          handleInputChange={onChange}
          name={"approvalcode"}
          value={other?.approvalcode}
          id={"approvalcode"}
          description={"Reference Code"}
          disabled={otherPay.length == 0}
        />

        <PaymentButtons
          disabled={otherPay.length > 0 && other?.approvalcode ? false : true}
          buttonName={`Refund Transaction with ${otherPay || "Other Payment"}`}
          onClick={() => {
            // onClear();
            // onSubmit({modeOfRefund: otherPay, supportingDetails: other});
            handleSubmit({
              modeOfRefund: otherPay,
              supportingDetails: other,
            });
          }}
        />
      </div>
    </>
  );
}
