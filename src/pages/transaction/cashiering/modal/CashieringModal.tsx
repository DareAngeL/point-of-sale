import {Modal} from "../../../../common/modal/Modal";
import {useChangeNameModal} from "../../../../hooks/modalHooks";
import {CashFund} from "../form/CashFund";
import {CashDeclaration} from "../form/CashDeclaration";
import {CashIn} from "../form/CashIn";
import "./CashieringModal.css";
import {CashOut} from "../form/CashOut";
import {ReasonModal} from "./ReasonModal";
import {createContext, useState} from "react";

export const CashieringContext = createContext<any>("");

export function CashieringModal() {
  const {modalName} = useChangeNameModal();
  const [inputValue, saveInputValue] = useState({
    input: "",
    trantype: "",
  });

  switch (modalName) {
    case "Cash In":
      return (
        <CashieringContext.Provider value={{saveInputValue}}>
          <Modal title={modalName}>
            <CashIn />
          </Modal>
        </CashieringContext.Provider>
      );
    case "Cash Out":
      return (
        <CashieringContext.Provider value={{saveInputValue}}>
          <Modal title={modalName}>
            <CashOut />
          </Modal>
        </CashieringContext.Provider>
      );
    case "Cash Fund":
      return (
        <CashieringContext.Provider value={{saveInputValue}}>
          <Modal title={modalName}>
            <CashFund />
          </Modal>
        </CashieringContext.Provider>
      );
    case "Cash Declaration":
      return (
        <CashieringContext.Provider value={{saveInputValue}}>
          <Modal title={modalName}>
            <CashDeclaration />
          </Modal>
        </CashieringContext.Provider>
      );

    default:
      break;
  }

  return (
    <CashieringContext.Provider value={{inputValue}}>
      <Modal title={modalName}>
        <ReasonModal />
      </Modal>
    </CashieringContext.Provider>
  );
}
