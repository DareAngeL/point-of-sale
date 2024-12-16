import {useState} from "react";
import {InputText} from "../../../../../../../common/form/InputText";
import {Selection} from "../../../../../../../common/form/Selection";
import {useAppDispatch, useAppSelector} from "../../../../../../../store/store";
import {PaymentButtons} from "../../../../common/buttons/PaymentButtons";
import useRefundHooks from "../../../../hooks/refundHooks";
import { CardDetails } from "../../../../../../../reducer/paymentSlice";
import { RefundReceiptV2 } from "../../../../receipt/RefundReceiptV2";
import { setModeOfRefund2, setRefundCardDetails } from "../../../../../../../reducer/refundSlice";

// interface SubmitProps {
// modeOfRefund: "CASH" | "CHECK" | "CARD" | "OTHER PAYMENT";
// supportingDetails?: any;
// }
interface CardProps {
  // onClear: () => void;
  selectedCardType: string;
  // onSubmit: ({modeOfRefund, supportingDetails}: SubmitProps) => void;
  // modeOfRefund: string;
}

export default function Card({selectedCardType}: CardProps) {
  const appDispatch = useAppDispatch();
  const {cardType} = useAppSelector((state) => state.masterfile);
  const { cardDetails } = useAppSelector((state) => state.refund);
  const {handleSubmit} = useRefundHooks();

  const [paymentCard, setPaymentCard] = useState<CardDetails>({
    cardtype: selectedCardType,
    bankname: "",
    cardno: "",
    cardholder: "",
    approvalcode: "",
    cardclass: "",
  });
  const [otherCard, setOtherCard] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setPaymentCard(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );

    appDispatch(setRefundCardDetails({
      ...cardDetails,
      [name]: value,
    }));
  };

  let cardtypes = cardType.data.map((i) => {
    return {value: i.cardtype, key: i.cardtype};
  });
  cardtypes.push({
    value: "Other Card",
    key: "Other Card",
  });

  return (
    <>
      <div>
        <div className="top-0 right-0  fixed -z-20 opacity-[0] bg-white">
          <RefundReceiptV2 voidPosfile={undefined} modeOfRefund={"CARD"} cardDetails={paymentCard} />
        </div>
        <Selection
          handleSelectChange={(e) => {
            appDispatch(setRefundCardDetails({
              ...cardDetails,
              cardclass: e.target.value,
            }));

            setPaymentCard((prev) => ({
              ...prev,
              cardclass: e.target.value,
            }));
            console.log(e.target.value);
          }}
          description={"Card classification"}
          id={paymentCard.cardclass === "Other Card" ? "" : "cardtype"}
          name={paymentCard.cardclass === "Other Card" ? "" : "cardtype"}
          keyValuePair={cardtypes}
          value={paymentCard.cardclass}
        />

        {paymentCard.cardclass === "Other Card" && (
          <InputText
            handleInputChange={(e) => {
              console.log(e.target.value);
              setOtherCard(e.target.value);
            }}
            value={otherCard}
            description={"Other Card"}
            id={"cardtype"}
            name={"cardtype"}
          />
        )}

        <InputText
          handleInputChange={onChange}
          name={"bankname"}
          value={paymentCard?.bankname}
          id={"bankname"}
          description={"Bank Name"}
        />

        <InputText
          handleInputChange={onChange}
          name={"cardno"}
          value={paymentCard?.cardno}
          id={"cardno"}
          description={"CardNumber"}
        />

        <InputText
          handleInputChange={onChange}
          name={"cardholder"}
          value={paymentCard?.cardholder}
          id={"cardholder"}
          description={"Card Holder Name"}
        />

        <InputText
          handleInputChange={onChange}
          name={"approvalcode"}
          id={"approvalcode"}
          description={"Approval Code"}
          value={paymentCard?.approvalcode}
        />

        <PaymentButtons
          disabled={
            paymentCard.approvalcode &&
            paymentCard.bankname &&
            paymentCard.cardclass &&
            paymentCard.cardholder &&
            paymentCard.cardno &&
            paymentCard.cardtype
              ? false
              : true
          }
          buttonName={"Refund Transaction with Card"}
          onClick={async () => {
            if (otherCard) {
              const clone = {...paymentCard};
              clone.cardclass = otherCard;
              // onSubmit({modeOfRefund: "CARD", supportingDetails: clone});

              appDispatch(setRefundCardDetails(clone));

              await handleSubmit({
                modeOfRefund: "CARD",
                supportingDetails: clone,
              });

              appDispatch(setModeOfRefund2("CASH"));
            } else {

              appDispatch(setRefundCardDetails(paymentCard));
              // onClear();
              // onSubmit({modeOfRefund: "CARD", supportingDetails: paymentCard});
              await handleSubmit({
                modeOfRefund: "CARD",
                supportingDetails: paymentCard,
              });

              appDispatch(setModeOfRefund2("CASH"));
            }
          }}
        />
      </div>
    </>
  );
}
