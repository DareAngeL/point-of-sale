import { useState } from "react";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { InputPassword } from "../../../../common/form/InputPassword";
import { CustomModal } from "../../../../common/modal/CustomModal";

interface SwipeCardModalProps {
  open: boolean;
  onConfirm: (cardSwipeValue: string) => void;
  onCancel: () => void;
}

export function SwipeCardModal({
  open,
  onConfirm,
  onCancel
}: SwipeCardModalProps) {

  const [value, setValue] = useState("");

  return (
    <>
      {open && (
        <CustomModal 
          modalName={"Swipe Card"}
          height={200} 
          maxHeight={""}
        >
          <>
            <InputPassword
              handleInputChange={(e) => setValue(e.target.value)}
              onEnterKey={() => {
                onConfirm(value);
                setValue("");
              }}
              name={"swipe"}
              value={value}
              id={"swipe"}
              description={""}
              placeholder="Card Swipe Now!"
              autoFocus
            />

            <ButtonForm 
              formName={""}
              btnType="button"
              okBtnTxt="Confirm"
              isActivated={false}
              onCancelBtnClick={onCancel}
              onOkBtnClick={() => {
                onConfirm(value)
                setValue("");
              }}
              isNotOnMainModal
            />
          </>
        </CustomModal>
      )}
    </>
  )
}