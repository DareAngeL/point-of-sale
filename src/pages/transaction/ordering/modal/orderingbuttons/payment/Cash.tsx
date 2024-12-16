import {useState, useContext, useEffect, useRef} from "react";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {InputText} from "../../../../../../common/form/InputText";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import {setChange} from "../../../../../../reducer/paymentSlice";
import {PaymentMethod, PaymentStatus} from "../../../enums";
import {useUserActivityLog} from "../../../../../../hooks/useractivitylogHooks";
import {METHODS, MODULES} from "../../../../../../enums/activitylogs";
import {PaymentContext, usePayment} from "../../../hooks/paymentHooks";
import {setPosfile} from "../../../../../../reducer/orderingSlice";
import { toast } from "react-toastify";
import { Spin } from "antd";
import { formatNumberWithCommasAndDecimals } from "../../../../../../helper/NumberFormat";

interface CashProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function Cash({onCancel: onCancelAction, onSuccess: onSuccessProp}: CashProps) {
  const dispatch = useAppDispatch();
  const {payment, change, activePayment} = useAppSelector((state) => state.payment);
  const {posfileTOTAL: posfile} = useAppSelector((state) => state.order);
  const {calculatePaymentData} = usePayment();
  const {postActivity} = useUserActivityLog();

  const paymentModal = useContext(PaymentContext);
  const mpayment = payment.data.filter(d => d.paymentMode === activePayment.data.payMethod)

  const [customerInfo, setCustomerInfo] = useState<{
    customerName: string;
    address: string;
    contactNo: string;
    tinNo: string;
  }>();
  
  const execFreeTranFromOnSuccess = useRef(false);

  useEffect(() => {

    const init = () => {

      if (
        change.data.customerName && 
        change.data.customerName !== ''
      ) {
        // delay effect - LOL
        setTimeout(() => {
          dispatch(
            setChange({
              ...change.data,
              ...calculatePaymentData(undefined, PaymentStatus.ONGOING),
            })
          );
          
          paymentModal();
        }, 500);
      }
    }
    // delay effect
    
      init();
  }, [])

  // dirty approach just to fix the customer info 
  // not updated in the database and receipt
  // when the transaction is free
  // ===========================================
  // 1. when onSuccess function is called, the setChange will be executed
  // 2. So, we need to listen to the change.data to make sure that customer info is already updated
  // before calling the onSuccessProp.
  useEffect(() => {
    if (execFreeTranFromOnSuccess.current) {
      execFreeTranFromOnSuccess.current = false;
      onSuccessProp?.();
      paymentModal();
    }
  }, [change.data])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setCustomerInfo(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as any)
    );
  };

  const onSuccess = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(mpayment[mpayment.length-1].amount);

    if (payment.data.find(d => d.paymentMode === PaymentMethod.FREE)) {
      execFreeTranFromOnSuccess.current = true;

      dispatch(
        setChange({
          paid: 0,
          change: 0,
          balance: 0,
          paymentStatus: PaymentStatus.ONGOING,
          ...customerInfo,
        })
      );

      dispatch(
        setPosfile({
          ...posfile.data,
          groext: 0,
          vatamt: 0,
          scharge: 0,
        })
      );
    } 
    else if (amount === 0) {
      return toast.error("Error : Zero amount", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }
    else {
      dispatch(
        setChange({
          ...calculatePaymentData(undefined, PaymentStatus.ONGOING),
          ...customerInfo,
        })
      );

      onSuccessProp && onSuccessProp()
      paymentModal();
    }

    postActivity({
      method: METHODS.PAY,
      module: MODULES.ORDERPREVIEW,
      remarks: `CASH PAYMENT:\nAMOUNDT PAID:${amount}\nCUSTOMER NAME:${customerInfo?.customerName}\nADDRESS: ${customerInfo?.address}\nCONTACT NUMBER: ${customerInfo?.contactNo}\nTIN #: ${customerInfo?.tinNo}`,
    });
  };

  const onCancel = () => {
    onCancelAction && onCancelAction();
    paymentModal();
  };

  if (
    change.data.customerName && 
    change.data.customerName !== ''
  ) {
    return (
      <>
        <div className="flex">
          <Spin/>
          <span className="ms-5">Adding payment...</span>
        </div>
      </>
    )
  }

  return (
    <>
      <div>
        <p className="text-red-500">Confirm Amt Received</p>
        <h4 className="text-red-500 underline">
          ₱{formatNumberWithCommasAndDecimals(mpayment[mpayment.length-1].amount, 2)}
        </h4>

        <form id="cashform" onSubmit={onSuccess}>
          <InputText
            handleInputChange={onChange}
            name={"customerName"}
            value={customerInfo?.customerName}
            id={"customerName"}
            description={"Customer Name"}
          />

          <InputText
            handleInputChange={onChange}
            name={"address"}
            value={customerInfo?.address}
            id={"address"}
            description={"Address"}
          />

          <InputText
            handleInputChange={onChange}
            name={"contactNo"}
            id={"contactNo"}
            description={"Contact No."}
            value={customerInfo?.contactNo}
          />

          <InputText
            handleInputChange={onChange}
            name={"tinNo"}
            value={customerInfo?.tinNo}
            id={"tinNo"}
            description={"TIN"}
          />
        </form>
      </div>

      <ButtonForm
        formName={"cashform"}
        okBtnTxt="Confirm"
        // onCancelBtnClick={onCancel}
        overrideOnCancelClick={onCancel}
      />
    </>
  );
}
