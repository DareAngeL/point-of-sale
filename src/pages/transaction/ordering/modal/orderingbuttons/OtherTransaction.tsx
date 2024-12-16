import {useState} from "react";
import {CustomModal} from "../../../../../common/modal/CustomModal";
import {PaymentButtons} from "../../common/buttons/PaymentButtons";
import {RecallTransaction} from "./RecallTransaction";
import {useOrderingButtons} from "../../hooks/orderingHooks";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {AuthBypModules, AuthModal} from "../../../../../common/modal/AuthModal";
import { useUserAccessHook } from "../../../../../hooks/userAccessHook";
import { getTransactions } from "../../../../../store/actions/transaction.action";

export function OtherTransaction() {
  const {syspar} = useAppSelector((state) => state.masterfile);
  const { hasTransaction } = useAppSelector((state) => state.order);
  const authRecallTransaction = syspar.data[0].auth_recall_tran;

  const dispatch = useAppDispatch();

  const [isShow, setIsShow] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const {holdTransaction} = useOrderingButtons();
  const { isRootUser, useraccessfiles, orderingAccessMenfields } = useUserAccessHook();

  return (
    <>
      <section>
        {isShow && (
          <>
            <CustomModal modalName={"Recall Transaction"} maxHeight={""}>
              <div className="flex flex-col justify-between h-full">
                <RecallTransaction />
                <PaymentButtons
                  onClick={() => {
                    setIsShow(false);
                  }}
                  buttonName={"Cancel"}
                />
              </div>
            </CustomModal>
          </>
        )}

        {isAuthOpen && (
          <CustomModal 
            modalName="Authorized User Only" 
            maxHeight=""
            isShowXBtn={true}
            onExitClick={()=>{
              setAuthOpen(false);
            }}
          >
            <AuthModal
              customFn={() => {
                setAuthOpen(false);
                setIsShow(true);
              } } 
              useFor={AuthBypModules.ORDERING}            
            />
          </CustomModal>
        )}

        <div className=" py-1">
          {hasTransaction && (
            <PaymentButtons
              buttonName={"Hold Transaction"}
              onClick={() => {
                holdTransaction();
              }}
            />
          )}
        </div>

        <div className=" py-1">
          {!hasTransaction && (
            (isRootUser() || useraccessfiles.find((a: any) => a.menfield===orderingAccessMenfields.recalltran)!==undefined) &&
              <PaymentButtons
                buttonName={"Recall Transaction"}
                onClick={() => {
  
                  dispatch(getTransactions());
  
                  if (authRecallTransaction === 0) {
                    setAuthOpen(true);
                  } else {
                    setIsShow(true);
                  }
                }}
              />
            
          )}
        </div>
      </section>
    </>
  );
}
