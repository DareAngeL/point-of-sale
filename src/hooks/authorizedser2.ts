import { toast } from "react-toastify";
import { useService } from "./serviceHooks"

export function useAuthorizedUserOperation() {
  
  const {
    postData
  } = useService<any>("userFile");

//   const {currentModal} = useAppSelector((state) => state.modal);

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

  return {
    authorize
  }
}