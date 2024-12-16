import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {InputText} from "../../../../../../common/form/InputText";
import {useEffect, useRef, useState} from "react";
import {DiscountModel} from "../../../../../../models/discount";
import {PosfileModel} from "../../../../../../models/posfile";
import {useOrderingButtons} from "../../../hooks/orderingHooks";
import {toast} from "react-toastify";
import { useFormInputValidation } from "../../../../../../hooks/inputValidation";

interface Props {
  itmcde: string;
  onSubmit: () => void;
  discountContent: DiscountModel;
  checkedPosfile: PosfileModel;
}

interface Customer {
  cardholder: string;
  tin: string;
  cardno: string;
  itmcde: string;
}

interface DiscountDetailsRequiredValues {
  "Card Holder *": string;
  "Card Number *": string;
  // "TIN *": string;
}

export default function DiscountUserDetails({
  onSubmit,
  discountContent: discountModel,
  itmcde,
  checkedPosfile,
}: Props) {
  const orderingButtons = useOrderingButtons();

  const [customerDetails, setCustomerDetails] = useState<Customer>({
    cardholder: "",
    cardno: "",
    tin: "",
    itmcde: "",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const {
    handleSubmit,
    changeRequiredValue,
    errors,
  } = useFormInputValidation<DiscountDetailsRequiredValues>(undefined, {
    form: formRef,
    inputNames: ["cardholder", "cardno"],
    data: customerDetails,
  });

  const handleOnChangeInput = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = target;
    setCustomerDetails((prev) => {
      changeRequiredValue(name, value);
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const onSubmitClick = async () => {
    if (
      !customerDetails.cardholder ||
      !customerDetails.cardno ||
      !customerDetails.itmcde
    ) {
      return toast.error("Fill up the fields.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    await orderingButtons.discountButton(
      discountModel as DiscountModel,
      checkedPosfile as any,
      customerDetails
    );
    onSubmit();
  }

  useEffect(() => {
    setCustomerDetails((prev) => {
      return {
        ...prev,
        itmcde: itmcde,
      };
    });
  }, []);

  return (
    <div>
      <span className="text-[10px] text-gray-500">
        Fields with (*) asterisk are required
      </span>
      <form
        ref={formRef}
        id="discountUser"
        onSubmit={handleSubmit(onSubmitClick)}
      >
        <InputText
          handleInputChange={handleOnChangeInput}
          name="cardholder"
          id="cardholder"
          value={customerDetails.cardholder}
          description="Card Holder *"
          error={errors}
          required
        />
        <InputText
          handleInputChange={handleOnChangeInput}
          name="cardno"
          id="cardno"
          value={customerDetails.cardno}
          description="Card Number *"
          error={errors}
          required
        />
        <InputText
          handleInputChange={handleOnChangeInput}
          name="tin"
          id="tin"
          value={customerDetails.tin}
          description="TIN"
        />
        <ButtonForm
          formName="discountUser"
          overrideOnCancelClick={() => {
            onSubmit();
          }}
        />
      </form>
    </div>
  );
}
