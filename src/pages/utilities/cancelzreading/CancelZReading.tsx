import { toast } from "react-toastify";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { cancelZReading } from "../../../store/actions/cancelzreading.action";
import { useAppDispatch } from "../../../store/store";
import { useModal } from "../../../hooks/modalHooks";
import { AuthBypModules, AuthModal } from "../../../common/modal/AuthModal";
import { useState } from "react";

export function CancelZReading() {

  const appDispatch = useAppDispatch();
  const {dispatch} = useModal();

  const [openAuthModal, setOpenAuthModal] = useState(true);

  const cancelZRead = async () => {
    toast.info("ZReading cancellation is temporarily not allowed due to latest ordering process flow. This feature may break the system!", {
      autoClose: 10000,
      position: "top-center",
      hideProgressBar: true,
    })
    return;

    const result = await appDispatch(cancelZReading());
    if (result.payload.status === 200) {
      toast.success("ZReading has been cancelled successfully", {
        autoClose: 2000,
        position: "top-center",
        hideProgressBar: true,
      });
    } else {
      console.log(result);
      
      toast.error(result.payload.message, {
        autoClose: 2000,
        position: "top-center",
        hideProgressBar: true,
      });
    }

    dispatch();
  }

  return (
    <>
      {openAuthModal ? (
        <AuthModal 
          handleOnAuthorized={() => setOpenAuthModal(false)}
          useFor={AuthBypModules.UTILITIES} 
        />
      ) : (
        <div>
          <h1>This will cancel zreading for the day. Are you sure to proceed ?</h1>
          <ButtonForm 
            formName={""}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            onOkBtnClick={cancelZRead}
          />
        </div>
      )}
    </>
  );
}