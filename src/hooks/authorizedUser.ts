import { toast } from "react-toastify";
import { useService } from "./serviceHooks"
import { useOrderingModal } from "../pages/transaction/ordering/hooks/orderingModalHooks";
import { useOrderingButtons } from "../pages/transaction/ordering/hooks/orderingHooks";
import { useAppSelector } from "../store/store";

export function useAuthorizedUser() {
  
  const {
    postData
  } = useService<any>("userFile");

  const {currentModal} = useAppSelector((state) => state.modal);
  const {removeItem, cancelTransaction} = useOrderingButtons();
  const {
    freeItemModal,
    priceOverrideModal,
    voidTransactionModal,
    refundTransactionModal,
    reprintVoidModal,
    reprintTransactionModal,
    discountModal,
  } = useOrderingModal();

  const authorize = async (creds: {swipeCard?: {cardholder: string, cardno: string}, usrcde?: string, usrpwd?: string}) => {
    try {
      await toast.promise(authLogin(creds), {
        pending: "Authorizing...Please wait..."
      }, {
        toastId: 'authorizing',
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true
      })

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  const authLogin = (creds: {swipeCard?: {cardholder: string, cardno: string}, usrcde?: string, usrpwd?: string}) => new Promise((resolve, reject) => {
    postData("/authorize_transact", creds, (model, err, status) => {
      if (status === 404) {
        toast.error("Incorrect credentials", {
          toastId: 'incorrect-cred',
          autoClose: 2000,
          hideProgressBar: true,
          position: 'top-center',
        });
        reject(false)
        return;
      }

      if (err) {
        toast.error("Something went wrong!", {
          toastId: 'went-wrong',
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        })
        reject(false);
        return;
      }
      
      if (model.data.authorize) {
        toast.success("Authorized!", {
          autoClose: 2000,
          position: 'top-center',
          hideProgressBar: true
        })
        resolve(true)
      } else {
        toast.error("User is not authorize!", {
          toastId: 'unauth',
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true
        })
        reject(false)
      }
    })
  })

  const handleOrderingAuthBypass = () => {
    switch (currentModal) {
      case "Remove Item":
        console.log("remove");
        removeItem();
        break;
      case "Cancel Transaction":
        console.log("cancel");
        cancelTransaction();
        break;
      case "Void Transaction":
        console.log("void transaction");
        voidTransactionModal();
        break;
      case "Refund Transaction":
        refundTransactionModal();
        break;
      case "Free Item":
        console.log("free item");
        freeItemModal();
        break;
      case "Price Override":
        console.log("price override");
        priceOverrideModal();
        break;
      case "Free Transaction":
        break;
      case "Discounting":
        console.log("discounting");
        discountModal();
        break;
      case "Reprint Transaction":
        console.log("reprint transaction");
        reprintTransactionModal();
        break;
      case "Reprint Void Transaction":
        console.log("reprint void");
        reprintVoidModal();
        break;
      case "ZReading":
        break;

      case "Recall Transaction":
        break;
    }
  }

  return {
    authorize,
    handleOrderingAuthBypass,
  }
}