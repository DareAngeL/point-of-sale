import {useRef, useState} from "react";
import {useAppDispatch} from "../../../../../../store/store";
import {Cash} from "./Cash";
import {InputText} from "../../../../../../common/form/InputText";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {setGiftCheck} from "../../../../../../reducer/paymentSlice";
import {toast} from "react-toastify";
import { useFormInputValidation } from "../../../../../../hooks/inputValidation";

interface GiftCheckProps {
  onCancel: () => void;
}

interface GiftCheckRequiredValues {
  "Reference Code *": string;
}

export function GiftCheck({onCancel}: GiftCheckProps) {
  const dispatch = useAppDispatch();

  const [next, setNext] = useState(false);
  // const {postActivity} = useUserActivityLog();

  // const paymentModal = useContext(PaymentContext);

  const [gift, setGift] = useState<{
    approvalcode: string;
  }>({
    approvalcode: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const {
    handleSubmit,
    changeRequiredValue,
    errors,
  } = useFormInputValidation<GiftCheckRequiredValues>(undefined, {
    form: formRef, 
    inputNames: ["approvalcode"],
    data: gift
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    changeRequiredValue(name, value);
    setGift(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  const onSubmit = () => {
    if (!gift?.approvalcode) {
      return toast.error("Please complete the fields first.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    // setPayment();

    dispatch(setGiftCheck(gift));
    setNext(true);
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
            <form ref={formRef} id="cardform" onSubmit={handleSubmit(onSubmit)}>
              <InputText
                handleInputChange={onChange}
                name={"approvalcode"}
                value={gift?.approvalcode}
                id={"approvalcode"}
                description={"Reference Code *"}
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
