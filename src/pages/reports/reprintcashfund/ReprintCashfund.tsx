import {AuthFragment} from "./fragments/AuthFragment";
import {CashieringSelection} from "./fragments/CashieringSelection";
import {useEffect, useState} from "react";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import {toast} from "react-toastify";
import {useOrderingPrintout} from "../../transaction/ordering/hooks/orderingPrintoutHooks";
import { cashieringReceiptPrintout } from "../../../hooks/printer/cashieringReceipt";
import { useAppSelector } from "../../../store/store";
type Props = {};

enum FragmentType {
  AUTH,
  CONFIRMATION,
}

export default function ReprintCashFund({}: Props) {
  const {dispatch: dispatchModal} = useModal();
  const [fragmentType, setFragmentType] = useState<FragmentType>(
    FragmentType.AUTH
  );
  const {modalNameDispatch} = useChangeNameModal();
  const selector = useAppSelector((state) => state);
  const {generateOrderingReceipt} = useOrderingPrintout();

  useEffect(() => {
    modalNameDispatch("Authorized User Only");
  }, []);

  const handleOnAuth = () => {
    setFragmentType(FragmentType.CONFIRMATION);
    modalNameDispatch("Re-Print Cashiering");
  };

  const handleSubmit = async () => {
    const loadingToastId = toast.loading("Generating receipt... Please wait...", {
      hideProgressBar: true,
      position: 'top-center',
    });
    
    generateOrderingReceipt('cashreprint-cashfund', cashieringReceiptPrintout(selector, selector.transaction.reprintCashiering.data?.extprc, true), (isSuccess) => {
      toast.dismiss(loadingToastId);
      if (isSuccess) {
        toast.success("Receipt generated successfully!", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
      }

      toast.dismiss(loadingToastId);
    });
    dispatchModal();
  };

  switch (fragmentType) {
    case FragmentType.AUTH:
      return <AuthFragment onAuth={handleOnAuth} />;
    case FragmentType.CONFIRMATION:
      return <CashieringSelection onSubmit={handleSubmit} />;

    default:
      return (
        <div>
          <h1>Reprint</h1>
        </div>
      );
  }
}
