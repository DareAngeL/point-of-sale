import {useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import {Cash} from "./Cash";
import {InputText} from "../../../../../../common/form/InputText";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {toast} from "react-toastify";

import {Selection} from "../../../../../../common/form/Selection";
import {CardDetails, setCard} from "../../../../../../reducer/paymentSlice";
import { useFormInputValidation } from "../../../../../../hooks/inputValidation";

interface DebitCardProps {
  onCancel: () => void;
  cardType: string;
}

interface CardRequiredValues {
  "Card Type *": string;
  "Other Card *"?: string;
  "Bank Name *": string;
  "Card Number *": string;
  "Card Holder Name *": string;
  "Approval Code *": string;
}

export function Card({
  onCancel,
  cardType: selectedCardType,
}: DebitCardProps) {
  const dispatch = useAppDispatch();
  const {card} = useAppSelector((state) => state.payment);
  const {cardType} = useAppSelector(
    (state) => state.masterfile
  );

  const [next, setNext] = useState(false);
  // const {postActivity} = useUserActivityLog();

  // const paymentModal = useContext(PaymentContext);

  const [paymentCard, setPaymentCard] = useState<CardDetails>({
    cardtype: "",
    bankname: "",
    cardno: "",
    cardholder: "",
    approvalcode: "",
    cardclass: selectedCardType,
  });

  const [otherCard, setOtherCard] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const {
    handleSubmit,
    changeRequiredValue,
    errors,
    registerInputs,
  } = useFormInputValidation<CardRequiredValues>(undefined, {
    form: formRef,
    inputNames: ["cardtype", "bankname", "cardno", "cardholder", "approvalcode"],
    data: paymentCard,
  })

  useEffect(() => {
    // re-register the inputs if other card is selected
    if (paymentCard.cardtype === "Other Card") {
      registerInputs({
        inputs: [
          {
            name: "cardtype",
            path: "Other Card *",
            value: ''
          },
          {
            name: "bankname",
            path: "Bank Name *",
            value: paymentCard.bankname
          },
          {
            name: "cardno",
            path: "Card Number *",
            value: paymentCard.cardno
          },
          {
            name: "cardholder",
            path: "Card Holder Name *",
            value: paymentCard.cardholder
          },
          {
            name: "approvalcode",
            path: "Approval Code *",
            value: paymentCard.approvalcode
          }
        ]
      });
    }
  }, [paymentCard.cardclass])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    changeRequiredValue(name, value);
    setPaymentCard(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );

    console.log(card);
  };

  const onSubmit = () => {
    // setPayment();

    console.log(paymentCard);

    if (
      !paymentCard?.bankname ||
      !paymentCard?.cardno ||
      !paymentCard?.cardholder ||
      !paymentCard?.approvalcode ||
      !paymentCard.cardclass
    ) {
      return toast.error("Please complete the fields first.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    console.log("palitan", paymentCard);

    if (paymentCard.cardclass === "Other Card") {
      const paymentCardClone = {...paymentCard};
      paymentCardClone.cardclass = otherCard;
      console.log("new xxx", paymentCardClone);
      dispatch(setCard(paymentCardClone));
      setNext(true);
    } else {
      dispatch(setCard(paymentCard));
      setNext(true);
    }

    // dispatch(setCard(paymentCard));
  };

  const cardtypes = cardType.data.map((i) => {
    return {value: i.cardtype, key: i.cardtype};
  });
  cardtypes.push({
    value: "Other Card",
    key: "Other Card",
  });

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
              <Selection
                handleSelectChange={(e) => {
                  changeRequiredValue("cardtype", e.target.value);
                  setPaymentCard((prev) => ({
                    ...prev,
                    cardtype: e.target.value,
                  }));
                  console.log(e.target.value);
                }}
                description={"Card Type *"}
                id={paymentCard.cardtype === "Other Card" ? "" : "cardclass"}
                name={paymentCard.cardtype === "Other Card" ? "" : "cardclass"}
                value={paymentCard.cardtype}
                keyValuePair={cardtypes}
                error={errors}
                required
                // disabled={paymentCard.cardclass === "Other" ? true : false}
                // keyValuePair={cardType.data.map((i) => {
                // return {value: i.cardtype, key: i.cardtype};
                // })}
              />

              {paymentCard.cardclass === "Other Card" && (
                <InputText
                  handleInputChange={(e) => {
                    changeRequiredValue("cardclass", e.target.value);
                    setOtherCard(e.target.value);
                  }}
                  value={otherCard}
                  description={"Other Card *"}
                  id={"cardclass"}
                  name={"cardclass"}
                  error={errors}
                  required
                />
              )}

              <InputText
                handleInputChange={onChange}
                name={"bankname"}
                value={paymentCard?.bankname}
                id={"bankname"}
                description={"Bank Name *"}
                error={errors}
                required
              />

              <InputText
                handleInputChange={onChange}
                name={"cardno"}
                value={paymentCard?.cardno}
                id={"cardno"}
                description={"Card Number *"}
                error={errors}
                required
              />

              <InputText
                handleInputChange={onChange}
                name={"cardholder"}
                value={paymentCard?.cardholder}
                id={"cardholder"}
                description={"Card Holder Name *"}
                error={errors}
                required
              />

              <InputText
                handleInputChange={onChange}
                name={"approvalcode"}
                id={"approvalcode"}
                description={"Approval Code *"}
                value={paymentCard?.approvalcode}
                error={errors}
                required
              />
            </form>
          </div>

          <ButtonForm
            formName={"cardform"}
            okBtnTxt="Next"
            overrideOnCancelClick={() => {
              onCancel();
            }}
          />
        </>
      )}
    </>
  );
}
