import {useNavigate} from "react-router";
import {useAppDispatch} from "../../../../store/store";
import {
  changeName,
  toggle,
  // toggleFullScreen,
} from "../../../../reducer/modalSlice";
import {useOrdering, useOrderingButtons} from "./orderingHooks";
import {setChange} from "../../../../reducer/paymentSlice";
import {PaymentStatus} from "../enums";
// import {useUserActivityLog} from "../../../../hooks/useractivitylogHooks";
export function useOrderingModal() {
  const {hasSelectItem, order, hasDiscount} = useOrdering();
  const {changeOrderType} = useOrderingButtons();
  // const {postActivity} = useUserActivityLog();

  const {selectedOrder, posfileTOTAL: posfile} = order;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const paymentModal = () => {
    dispatch(
      setChange({
        paid: 0,
        change: 0,
        balance:
          parseFloat(posfile.data?.extprc + ""),
        paymentStatus: PaymentStatus.START,
      })
    );
    navigate("/pages/ordering/payment");
    dispatch(toggle());
    dispatch(changeName({modalName: "Payment"}));
  };

  const specialRequestModal = () => {
    if (hasSelectItem()) {
      navigate("/pages/ordering/specialrequest");
      dispatch(toggle());
      dispatch(changeName({modalName: "Add Special Request(s)"}));
    }
  };

  const changeQuantityModal = () => {
    if (hasSelectItem()) {
      navigate("/pages/ordering/changequantity");
      dispatch(toggle());
      dispatch(changeName({modalName: "Change Quantity"}));
    }
  };

  const changeOrderTypeModal = () => {
    if (hasSelectItem() && !hasDiscount()) {
      if (selectedOrder.data?.itmqty && selectedOrder.data?.itmqty > 1) {
        console.log("2");

        navigate("/pages/ordering/changeordertype");
        dispatch(toggle());
        dispatch(changeName({modalName: "Change order type"}));
      } else {
        console.log("3");

        changeOrderType();
      }
    }
  };

  const discountModal = () => {
    navigate("/pages/ordering/discount");
    dispatch(toggle());
    dispatch(changeName({modalName: "Add discount"}));
  };

  const freeItemModal = () => {
    if (hasSelectItem() && !hasDiscount()) {
      navigate("/pages/ordering/freeitem");
      dispatch(toggle());
      dispatch(changeName({modalName: "Free item"}));
    }
  };

  const priceOverrideModal = () => {
    if (hasSelectItem() && !hasDiscount()) {
      navigate("/pages/ordering/priceoverride");
      dispatch(toggle());
      dispatch(changeName({modalName: "Price Override"}));
    }
  };

  const voidTransactionModal = () => {
    navigate("/pages/ordering/voidtransaction");
    dispatch(toggle());
    dispatch(changeName({modalName: "Void Transaction"}));
  };

  const refundTransactionModal = () => {
    navigate("/pages/ordering/refundtransaction");
    dispatch(toggle());
    dispatch(changeName({modalName: "Refund Transaction"}));
  };

  const reprintTransactionModal = () => {
    navigate(`/pages/ordering/reprinttransaction`);

    dispatch(toggle());
    dispatch(changeName({modalName: "Reprint Transaction"}));
  };

  const reprintVoidModal = () => {
    navigate("/pages/ordering/reprintvoid");
    dispatch(toggle());
    dispatch(changeName({modalName: "Reprint Void Transaction"}));
  };

  const reprintRefundModal = () => {
    navigate("/pages/ordering/reprintrefund");
    dispatch(toggle());
    dispatch(changeName({modalName: "Reprint Refund Transaction"}));
  };

  const addOnModal = () => {
    if (hasSelectItem() && !hasDiscount()) {
      navigate("/pages/ordering/addon");
      dispatch(toggle());
      dispatch(changeName({modalName: "Add on"}));
    }
  };

  const otherTransactionModal = () => {
    navigate("/pages/ordering/othertransaction");
    dispatch(toggle());
    dispatch(changeName({modalName: "Other Transaction"}));
  };

  const authModal = () => {
    navigate("/pages/ordering/auth");
    dispatch(toggle());
    dispatch(changeName({modalName: "Authorized User Only"}));
  };

  const confirmationModal = () => {
    navigate("/pages/ordering/confirmation");
    dispatch(toggle());
    dispatch(changeName({modalName: "Confirmation"}));
  };

  const onAddItem = (itmcde: string, itmdsc: string) => {
    navigate(`/pages/ordering/itemCombo/${itmcde}`);
    // dispatch(toggleFullScreen(true));
    dispatch(toggle());
    dispatch(changeName({modalName: itmdsc}));
  };

  return {
    onAddItem,
    confirmationModal,
    authModal,
    paymentModal,
    specialRequestModal,
    changeQuantityModal,
    changeOrderTypeModal,
    discountModal,
    freeItemModal,
    priceOverrideModal,
    refundTransactionModal,
    voidTransactionModal,
    reprintVoidModal,
    addOnModal,
    reprintTransactionModal,
    otherTransactionModal,
    reprintRefundModal,
  };
}
