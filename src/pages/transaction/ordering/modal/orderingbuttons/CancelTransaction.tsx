import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {toggle} from "../../../../../reducer/modalSlice";
import {useOrderingModal} from "../../hooks/orderingModalHooks";
import {handleCurrentModal} from "../../../../../reducer/modalSlice";
import { useOrderingButtons } from "../../hooks/orderingHooks";

export default function CancelTransaction() {
  const {authModal} = useOrderingModal();
  const dispatch = useAppDispatch();
  const {cancelTransaction} = useOrderingButtons();

  const { syspar } = useAppSelector((state) => state.masterfile);
  const authCancelTransaction = syspar.data[0].auth_cancel_tran;

  return (
    <>
      <section>
        <h1>Are you sure you want to cancel this transaction?</h1>
        <ButtonForm
          formName=""
          cancelBtnTxt="Close"
          okBtnTxt="Confirm"
          isActivated
          onOkBtnClick={() => {
            dispatch(toggle());

            if (authCancelTransaction === 0) {
              dispatch(handleCurrentModal("Cancel Transaction"));
              authModal();
            } else {
              cancelTransaction();
            }
          }}
        />
      </section>
    </>
  );
}
