import React, { ChangeEventHandler, useState } from "react";
import { InputText } from "../../../common/form/InputText";
import { SwipeCardModal } from "./modal/SwipeCardModal";
import { useSwipeCardFeature } from "../../../hooks/swipeCard";
import { InputPassword } from "../../../common/form/InputPassword";
import { useService } from "../../../hooks/serviceHooks";
import { toast } from "react-toastify";

interface CardCredentialsFormProps {
  data: any;
  setData: React.Dispatch<any>;
  onCardSwiping: (isSwiping: boolean) => void;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

export function CardCredentialsForm(props: CardCredentialsFormProps) {

  const {putData} = useService<{cardholder: string, cardno: string}>("userFile");
  const [openSwipeCard, setOpenSwipeCard] = useState(false);
  const { authSwipeCardInfo } = useSwipeCardFeature();

  const onConfirmSwipeCard = async (cardSwipeValue: string) => {
    const cardCreds = authSwipeCardInfo(cardSwipeValue);
    
    if (cardCreds) {
      await putData("encryptCardCreds", cardCreds, (model, err, status) => {

        if (status === 409) {
          return toast.error("Card already in use.", {autoClose: 2000, hideProgressBar: true, position: 'top-center',})
        }

        if (err) {
          return toast.error("Something went wrong.", {autoClose: 2000, hideProgressBar: true, position: 'top-center',});
        }

        props.setData((prev: any) => {
          return {
            ...prev,
            ...model
          }
        });
  
        setOpenSwipeCard(false);
        props.onCardSwiping(false);
      });
    }
  }

  return (
    <>
      <SwipeCardModal 
        open={openSwipeCard} 
        onConfirm={onConfirmSwipeCard} 
        onCancel={() => {
          setOpenSwipeCard(false)
          props.onCardSwiping(false);
        }}
      />
      <div className="shadow-md m-auto mb-[1.3rem]">
        <label className="block mb-2 text-black text-[1rem] font-montserrat font-extrabold">
          Card Credentails (Optional)
        </label>

        <div className="p-[7px]">
          <InputText
            description="Card Holder"
            name="cardholder"
            id="cardholder"
            value={props.data?.cardholder}
            handleInputChange={props.handleInputChange}
            readonly
          />

          <InputPassword
            description="Card No."
            name="cardholder"
            id="cardholder"
            value={props.data?.cardno}
            handleInputChange={props.handleInputChange}
            readonly
          />

          <button 
            className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 active:bg-green-700"
            type="button"
            onClick={() => {
              setOpenSwipeCard(true)
              props.onCardSwiping(true);
            }}
          >
            SWIPE CARD
          </button>
        </div>
      </div>
    </>
  );
}
