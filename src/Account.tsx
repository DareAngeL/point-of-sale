import {ReactNode, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "./store/store";
import {setAccount, setAllowAccess} from "./reducer/accountSlice";
import React from "react";
import { useWebSocketContext } from "./WebSocketContext";
import { ReadyState } from "react-use-websocket";
import { toast } from "react-toastify";

interface AccountProps {
  children: ReactNode;
}

const Account = React.memo((props: AccountProps) => {
  const dispatch = useAppDispatch();
  const { allowAccess } = useAppSelector((state) => state.account);
  const {sendJsonMessage, readyState, lastJsonMessage} = useWebSocketContext();

  useEffect(() => {

    if(readyState == ReadyState.OPEN && allowAccess) {
      sendJsonMessage({
        type: "Notification",
        payload: {
          type: "Operation"
        }
      });
    }

    if (readyState === ReadyState.OPEN && !allowAccess) {
      sendJsonMessage({
        type: "DB Structure",
      });
    }

  }, [readyState, allowAccess]);

  useEffect(() => {
    if (lastJsonMessage !== null) {

      switch (lastJsonMessage.type) {
        case "DB Structure":
          if (lastJsonMessage.data.length > 0) {
            toast.error("Database structure is not updated. Please contact your administrator.", {
              hideProgressBar: true,
              position: "top-center",
              autoClose: 10000,
            });
          }
          else {
            console.log("DB Structure is updated.", true);
            dispatch(setAllowAccess(true));
          }
          break;
        case "Notification":
          break;
        default:
          break;
      }

    }
  }, [lastJsonMessage]);

  useEffect(() => {
    const sessionAccount = sessionStorage.getItem("account");
    let account;

    if (sessionAccount) {
      account = JSON.parse(sessionAccount);
      dispatch(setAccount(account));
    }
  }, []);

  return <>{props.children}</>;
});

export default Account;
// function sendJsonMessage(arg0: { type: string; payload: { type: string; }; }) {
//   throw new Error("Function not implemented.");
// }

