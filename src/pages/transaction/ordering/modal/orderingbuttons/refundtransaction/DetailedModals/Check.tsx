import {useState} from "react";
import {InputText} from "../../../../../../../common/form/InputText";
import { InputDateV2} from "../../../../../../../common/form/InputDate";
import {PaymentButtons} from "../../../../common/buttons/PaymentButtons";
import {RefundReceipt} from "../../../../receipt/RefundReceipt";
import useRefundHooks from "../../../../hooks/refundHooks";

// interface SubmitProps {
//   modeOfRefund: "CASH" | "CHECK" | "CARD" | "OTHER PAYMENT";
//   supportingDetails?: any;
// }

interface CheckProps {
  // onClear: () => void;
  // onSubmit: ({modeOfRefund, supportingDetails}: SubmitProps) => void;
  modeOfRefund: string;
}

export default function Check({modeOfRefund}: CheckProps) {
  const {handleSubmit} = useRefundHooks();
  const [cheque, setCheque] = useState<{
    chkbnk: string;
    chknum: string;
    chkdte: string;
  }>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    console.log(cheque);

    setCheque(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  const handleDateChange = (name: string, value: string) => {
    setCheque(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  }

  return (
    <>
      <div>
        <div className="top-0 right-0 fixed -z-20 opacity-[0] bg-white">
          <RefundReceipt voidPosfile={undefined} modeOfRefund={modeOfRefund} />
        </div>

        <InputText
          handleInputChange={onChange}
          name={"chkbnk"}
          value={cheque?.chkbnk}
          id={"chkbnk"}
          description={"Check Bank"}
        />

        <InputText
          handleInputChange={onChange}
          name={"chknum"}
          value={cheque?.chknum}
          id={"chknum"}
          description={"Check Number"}
        />

        <InputDateV2
          handleInputChange={handleDateChange}
          name={"chkdte"}
          id={"chkdte"}
          description={"Check Date"}
          value={cheque?.chkdte}
        />
        <PaymentButtons
          disabled={
            cheque?.chkbnk && cheque?.chkdte && cheque?.chknum ? false : true
          }
          buttonName={"Refund Transaction with Check"}
          onClick={() => {
            // onClear();
            handleSubmit({modeOfRefund: "CHECK", supportingDetails: cheque});
            // onSubmit({modeOfRefund: "CHECK", supportingDetails: cheque});
          }}
        />
      </div>
    </>
  );
}
