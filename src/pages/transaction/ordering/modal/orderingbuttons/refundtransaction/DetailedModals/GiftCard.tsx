import {useState} from "react";
import {PaymentButtons} from "../../../../common/buttons/PaymentButtons";
import {InputText} from "../../../../../../../common/form/InputText";
interface GiftCheckProps {
  onClear: () => void;
}
export default function GiftCheck({onClear}: GiftCheckProps) {
  const [gift, setGift] = useState<{
    approvalcode: string;
  }>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setGift(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  return (
    <>
      <div>
        <InputText
          handleInputChange={onChange}
          name={"approvalcode"}
          value={gift?.approvalcode}
          id={"approvalcode"}
          description={"Reference Code"}
        />
        <PaymentButtons
          disabled={gift?.approvalcode ? false : true}
          buttonName={"Refund Transaction with GiftCheck"}
          onClick={() => {
            onClear();
          }}
        />
      </div>
    </>
  );
}
