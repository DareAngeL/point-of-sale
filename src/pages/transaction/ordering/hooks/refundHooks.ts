import {useOrderingButtons} from "./orderingHooks";
import {useAppDispatch, useAppSelector} from "../../../../store/store";
import {toggle} from "../../../../reducer/modalSlice";
import {clearToRefund} from "../../../../reducer/refundSlice";
import { getSysPar } from "../../../../store/actions/systemParameters.action";

export default function useRefundHooks() {
  const dispatch = useAppDispatch();
  const {reprintRefund, refundTransaction} = useOrderingButtons();
  const {toRefund, refundReason} = useAppSelector((state) => state.refund);

  const handleSubmit = async (template?: any) => {
    const inv_num = await refundTransaction(
      refundReason.data,
      toRefund.data,
      template?.modeOfRefund,
      template?.supportingDetails
    );
    dispatch(toggle());
    dispatch(clearToRefund());
    dispatch(getSysPar());
    // onClear();
    await reprintRefund(inv_num, false);
  };

  return {handleSubmit};
}
