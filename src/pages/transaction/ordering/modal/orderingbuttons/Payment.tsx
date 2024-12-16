import {useEffect, useState} from "react";
import {CashieringNumberButtonGroup} from "../../../cashiering/common/buttons/CashieringNumberButtonGroup";
import {TextInput} from "../../../cashiering/common/input/TextInput/TextInput";
import {PaymentButtons} from "../../common/buttons/PaymentButtons";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {
  setActivePayment,
  setChange,
  setPayment,
} from "../../../../../reducer/paymentSlice";
import {PaymentMethod, PaymentStatus} from "../../enums";
import {PaymentContext, usePayment} from "../../hooks/paymentHooks";
import {CustomModal} from "../../../../../common/modal/CustomModal";
import {Cash} from "./payment/Cash";
import {Check} from "./payment/Check";
import {Card} from "./payment/Card";
import {GiftCheck} from "./payment/GiftCheck";
import {OtherPayment} from "./payment/OtherPayment";
import {toast} from "react-toastify";
import {useOrderingPrintout} from "../../hooks/orderingPrintoutHooks";
import {ReceiptPrintout} from "../../receipt/ReceiptPrintout";
import {PreviewReceipt} from "../../receipt/PreviewReceipt";
import {FreeItem} from "./FreeItem";
import {formatNumberWithCommasAndDecimals} from "../../../../../helper/NumberFormat";
import {CloseOutlined} from "@ant-design/icons";
import {removeXButton} from "../../../../../reducer/modalSlice";
import {useUserAccessHook} from "../../../../../hooks/userAccessHook";
import {AuthBypModules, AuthModal} from "../../../../../common/modal/AuthModal";
import {generateUUID} from "../../../../../helper/RandomID";
import {Spin} from "antd";
import { InputText } from "../../../../../common/form/InputText";
import { ButtonForm } from "../../../../../common/form/ButtonForm";
import { filterPosfiles } from "../../../../../helper/transaction";
import { useOrdering } from "../../hooks/orderingHooks";
import { PaymentInfoModal } from "./payment/PaymentInfoModal";

export function Payment() {
  const dispatch = useAppDispatch();

  const {posfileTOTAL: posfile, orderDiscount, serviceCharge, lessVatAdj, posfiles, serviceChargeDiscount} =
    useAppSelector((state) => state.order);
  const {change, payment} = useAppSelector((state) => state.payment);
  const {syspar} = useAppSelector((state) => state.masterfile);
  const authFreeTran = syspar.data[0].auth_free_tran;

  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isFullyPaid, setIsFullyPaid] = useState(false);
  const [disable, setDisable] = useState(false);

  const [isPaymentInfoOpen, setPaymentInfo] = useState(false);
  const [infoCallback, setInfoCallback] = useState<() => void>(()=> () => {});
  const [paymentInfoValue, setPaymentInfoValue] = useState({
    total: 0,
    change: 0,
    paid: 0,
  });

  const closePaymentInfo = () => {
    setPaymentInfo(false);
    infoCallback?.();
  }

  const openPaymentInfo = (paymentInfoValue: {total:number,change:number,paid:number}, callback: () => void) => {
    setPaymentInfo(true);
    setPaymentInfoValue(paymentInfoValue);
    setInfoCallback(()=>callback)
  }

  const [discAmt, setDiscAmt] = useState(0);

  const {viewPdfOrderingReceipt} =
    useOrderingPrintout();
  // const {paymentFreeItemModal} = useOrderingModal();

  const [customModal, setCustomModal] = useState(false);
  const [editCustomerInfo, setEditCustomerInfo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{
    customerName: string;
    address: string;
    contactNo: string;
    tinNo: string;
  }>({
    customerName: change.data.customerName,
    address: change.data.address,
    contactNo: change.data.contactNo,
    tinNo: change.data.tinNo,
  });
  const [activePaymentMethod, setActivePaymentMethod] = useState<{
    id: string;
    payMethod: PaymentMethod | "";
  }>({
    id: "",
    payMethod: PaymentMethod.CASH,
  });

  const {isRootUser, useraccessfiles, orderingAccessMenfields} =
    useUserAccessHook();

  const {onAddPayment, calculatePaymentData} = usePayment();
  const { hasDiscount } = useOrdering();

  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [paymentValue, setPaymentValue] = useState(
    (posfile.data?.extprc as unknown as string) || ""
  );

  const [btnsType, setBtnsType] = useState({
    isDenom: false,
    isZeroPaymentValue: false,
  });

  useEffect(() => {
    const amt = formatNumberWithCommasAndDecimals(
      parseFloat(posfile.data?.extprc + ""),
      2
    );
    
    setPaymentValue(amt);
  }, []);

  useEffect(() => {
    if (payment.data.find((d) => d.paymentMethod === PaymentMethod.FREE)) {
      setIsFullyPaid(true);
      return;
    }

    const posfileExtprc = parseFloat(posfile?.data?.extprc + "") || 0;
    const result = Number((posfileExtprc).toFixed(2));

    if (!(Number(change.data.paid) >= result)) {
      setIsFullyPaid(false);
    } else {
      setIsFullyPaid(true);
    }
  }, [change.data.paid]);

  useEffect(() => {
    if (paymentValue !== "0") {
      setBtnsType((prev) => ({...prev, isZeroPaymentValue: false}));
    } else {
      setBtnsType((prev) => ({...prev, isZeroPaymentValue: true}));
    }
  }, [paymentValue]);

  useEffect(() => {
    // removes the X close button of the modal when payment is ongoing
    if (change.data.paymentStatus == PaymentStatus.ONGOING) {
      dispatch(removeXButton(true));
    } else {
      dispatch(removeXButton(false));
    }
  }, [change.data.paymentStatus]);

  useEffect(() => {
    setPaymentValue(
      formatNumberWithCommasAndDecimals(change.data.balance as number, 2)
    );
  }, [change.data.balance]);

  useEffect(() => {
    const disc = posfiles.data
      .map((d) => {
        return d.disamt;
      })
      .reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
    setDiscAmt(disc || 0);
  }, [posfiles]);

  const onButtonClick = (num: string) => {
    console.log(paymentValue);
    setPaymentValue((prev) => {
      if (btnsType.isDenom) {
        // remove the ₱
        const _num = parseFloat(num.slice(1));
        const _prev = parseFloat(prev);

        console.log(_num, _prev);

        return (_prev + _num).toString();
      }

      console.log("payy: ", prev);

      prev === "0" && (prev = "");

      num === "." && prev === "" && (prev = "0");

      if (num === "." && prev.includes(".")) return prev;

      return (prev += num);
    });
  };

  const onEraseButtonClick = () => {
    setPaymentValue("0");
    setBtnsType((prev) => ({...prev, isZeroPaymentValue: true}));
  };

  const updatePayment = (payMethod: PaymentMethod, amnt: number) => {
    const id = generateUUID();
    const newPaymentList = [
      ...payment.data,
      {
        id: id,
        paymentMode: payMethod,
        itmcde: '',
        amount: amnt,
      },
    ];
    const activePayment = {
      id: id,
      payMethod: payMethod,
      itmcde: '',
    };

    dispatch(setPayment(newPaymentList));
    dispatch(setActivePayment(activePayment));
    setActivePaymentMethod(activePayment);
    setCustomModal(true);
    // onEraseButtonClick();
  };

  const onCashClick = () => {
    const _val = parseFloat(paymentValue.replaceAll(',', ''))
    if (_val === 0) {
      return toast.error("Error : Zero amount", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000,
      });
    }

    updatePayment(PaymentMethod.CASH, _val);
  };

  const onCheckClick = () => {
    const _val = parseFloat(paymentValue.replaceAll(',', ''))
    if (_val === 0) {
      return toast.error("Error : Zero amount", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    if (_val > parseFloat(change.data.balance.toFixed(2))) {
      return toast.error("Error : Amount exceeds the balance", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    updatePayment(PaymentMethod.CHECK, _val);
  };

  const onCreditCardClick = () => {
    const _val = parseFloat(paymentValue.replaceAll(',', ''))
    if (_val === 0) {
      return toast.error("Error : Zero amount", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    if (_val > parseFloat(change.data.balance.toFixed(2))) {
      return toast.error("Error : Amount exceeds the balance", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    updatePayment(PaymentMethod.CREDIT_CARD, _val);
  };

  const onDebitCardClick = () => {
    const _val = parseFloat(paymentValue.replaceAll(',', ''))

    if (_val === 0) {
      return toast.error("Error : Zero amount", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    if (_val > parseFloat(change.data.balance.toFixed(2))) {
      return toast.error("Error : Amount exceeds the balance", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    updatePayment(PaymentMethod.DEBIT_CARD, _val);
  };

  const onGiftCheckClick = () => {
    const _val = parseFloat(paymentValue.replaceAll(',', ''))
    if (_val === 0) {
      return toast.error("Error : Zero amount", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    // if (_val > parseFloat(change.data.balance.toFixed(2))) {
    //   return toast.error("Error : Amount exceeds the balance", {
    //     hideProgressBar: true,
    //     autoClose: 2000,
    //     position: 'top-center',
    //   });
    // }

    // is _amount value valid ?
    if (_val % 10 !== 0) {
      return toast.error("Gift check amount is invalid.", {
        autoClose: 2000,
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    updatePayment(PaymentMethod.GIFT_CHECK, _val);
  };

  const onOtherPaymentClick = () => {
    const _val = parseFloat(paymentValue.replaceAll(',', ''))
    if (_val === 0) {
      return toast.error("Error : Zero amount", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000,
      });
    }

    if (_val > parseFloat(change.data.balance.toFixed(2))) {
      return toast.error("Error : Amount exceeds the balance", {
        hideProgressBar: true,
        autoClose: 2000,
        position: 'top-center',
      });
    }

    updatePayment(PaymentMethod.OTHER_PAYMENT, _val);
  };

  const onFreeClick = () => {
    updatePayment(PaymentMethod.FREE, parseFloat(posfile?.data?.extprc + "") || 0);
  };

  const onRemovePayment = (id: string) => {
    const newPaymentList = payment.data.filter((d) => d.id !== id);
    dispatch(setPayment(newPaymentList));
    dispatch(
      setChange({
        ...change.data,
        ...calculatePaymentData(
          newPaymentList,
          newPaymentList.length === 0
            ? PaymentStatus.START
            : PaymentStatus.ONGOING
        ),
      })
    );
  };

  const onPaymentCanceled = () => {
    onRemovePayment(activePaymentMethod.id);
    setCustomModal(false);
  };

  const onChangeCustomerInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitCustomerInfo = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setChange({
      ...change.data,
      ...customerInfo
    }));
    setEditCustomerInfo(false);
  };

  const disabled = "pointer-events-none bg-gray-300 opacity-50";

  console.log('xxxPOSFILE', posfile.data);  

  return (
    <>
      {isAuthOpen && (
        <CustomModal
          modalName="Authorized User Only"
          maxHeight=""
          isShowXBtn={true}
          onExitClick={() => {
            setAuthOpen(false);
          }}
        >
          <AuthModal
            customFn={() => {
              setAuthOpen(false);
              onFreeClick();
            }}
            useFor={AuthBypModules.ORDERING}
          />
        </CustomModal>
      )}
      <PaymentInfoModal isOpen={isPaymentInfoOpen} info={{
        // total: (posfile?.data?.extprc &&
        // serviceCharge?.data?.extprc) &&
        // formatNumberWithCommasAndDecimals(
        //   parseFloat(posfile.data.extprc + ""),
        //   2
        // ),
        total: formatNumberWithCommasAndDecimals(paymentInfoValue.total, 2),
        change: formatNumberWithCommasAndDecimals(
          paymentInfoValue.change,
          2
        ),
        paid: formatNumberWithCommasAndDecimals(
          paymentInfoValue.paid,
          2
        )
      }} closeModal={closePaymentInfo} />
      <PaymentContext.Provider value={() => setCustomModal(false)}>

        {isGeneratingReceipt && (
          <CustomModal
            maxHeight=""
            height={80}
            modalName={"Generating Receipt"}
          >
            <>
              <div className="w-full flex justify-center bg-slate-200 rounded-sm">
                <span className="p-1 text-[12px]">
                  Please make sure the printer is connected properly
                </span>
              </div>
              <div className="flex mt-4">
                <Spin />
                <span className="ms-5">Please wait...</span>
              </div>
            </>
          </CustomModal>
        )}

        {customModal && (
          <CustomModal
            modalName={activePaymentMethod.payMethod + " Payment"}
            maxHeight={""}
            onExitClick={() => setCustomModal(false)}
          >
            {activePaymentMethod.payMethod == PaymentMethod.CASH && (
              <Cash onCancel={onPaymentCanceled} />
            )}

            {activePaymentMethod.payMethod == PaymentMethod.CHECK && (
              <Check onCancel={onPaymentCanceled} />
            )}

            {activePaymentMethod.payMethod == PaymentMethod.CREDIT_CARD && (
              <Card
                onCancel={onPaymentCanceled}
                cardType={activePaymentMethod.payMethod}
              />
            )}

            {activePaymentMethod.payMethod == PaymentMethod.DEBIT_CARD && (
              <Card
                cardType={activePaymentMethod.payMethod}
                onCancel={onPaymentCanceled}
              />
            )}

            {activePaymentMethod.payMethod == PaymentMethod.GIFT_CHECK && (
              <GiftCheck onCancel={onPaymentCanceled} />
            )}

            {activePaymentMethod.payMethod == PaymentMethod.OTHER_PAYMENT && (
              <OtherPayment onCancel={onPaymentCanceled} />
            )}

            {activePaymentMethod.payMethod == PaymentMethod.FREE && (
              <FreeItem
                onSuccess={() => {
                  setIsGeneratingReceipt(true);
                  onAddPayment(() => setIsGeneratingReceipt(false));
                }}
                onCancel={onPaymentCanceled}
              />
            )}
          </CustomModal>
        )}

        {editCustomerInfo && (
          <CustomModal
            modalName={"Change Customer Information"}
            maxHeight={""}
            onExitClick={() => setEditCustomerInfo(false)}
          >
            <form id="cashform" onSubmit={onSubmitCustomerInfo}>
              <InputText
                handleInputChange={onChangeCustomerInfo}
                name={"customerName"}
                value={customerInfo.customerName}
                id={"customerName"}
                description={"Customer Name"}
              />

              <InputText
                handleInputChange={onChangeCustomerInfo}
                name={"address"}
                value={customerInfo.address}
                id={"address"}
                description={"Address"}
              />

              <InputText
                handleInputChange={onChangeCustomerInfo}
                name={"contactNo"}
                id={"contactNo"}
                description={"Contact No."}
                value={customerInfo.contactNo}
              />

              <InputText
                handleInputChange={onChangeCustomerInfo}
                name={"tinNo"}
                value={customerInfo.tinNo}
                id={"tinNo"}
                description={"TIN"}
              />

              <ButtonForm
                formName={"cashform"}
                okBtnTxt="Confirm"
                // onCancelBtnClick={onCancel}
                overrideOnCancelClick={()=> setEditCustomerInfo(false)}
              />
            </form>
          </CustomModal>
        )}

        <form
          id="changeQuantity"
          onClick={(e) => {
            if (change.data.paymentStatus == PaymentStatus.ONGOING) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className={`flex`}>
            <div className="flex flex-col">
              {/* LEFT PANEL */}
              <div
                className={`${
                  change.data.paymentStatus == PaymentStatus.ONGOING &&
                  isFullyPaid || parseInt(posfile.data?.extprc as unknown as string) === 0
                    ? disabled
                    : ""
                } w-[300px]`}
              >
                <div className="flex">
                  <button
                    type="button"
                    className={`flex-auto text-green-700 mx-1 border rounded-md p-1 ${
                      !btnsType.isDenom && "bg-green-700 text-white"
                    } ${
                      !btnsType.isZeroPaymentValue
                        ? "bg-gray-300"
                        : "border-green-700"
                    }`}
                    onClick={() =>
                      setBtnsType((prev) => ({...prev, isDenom: false}))
                    }
                    {...(!btnsType.isZeroPaymentValue && {disabled: true})}
                  >
                    STANDARD
                  </button>
                  <button
                    type="button"
                    className={`flex-auto text-green-700 border rounded-md p-1 ${
                      btnsType.isDenom && "bg-green-700 text-white"
                    } ${
                      !btnsType.isZeroPaymentValue
                        ? "bg-gray-300"
                        : "border-green-700"
                    }`}
                    onClick={() =>
                      setBtnsType((prev) => ({...prev, isDenom: true}))
                    }
                    {...(!btnsType.isZeroPaymentValue && {disabled: true})}
                  >
                    DENOMINATION
                  </button>
                </div>
                <TextInput input={paymentValue} maxWidth={10} />
                <div >
                  <CashieringNumberButtonGroup
                    onButtonClick={onButtonClick}
                    onEraseBtnClick={onEraseButtonClick}
                    {...(btnsType.isDenom && {
                      setCustomBtnTxt: {
                        "1": "₱0.05",
                        "2": "₱0.10",
                        "3": "₱0.25",
                        "4": "₱1.00",
                        "5": "₱5.00",
                        "6": "₱10.00",
                        "7": "₱20.00",
                        "8": "₱50.00",
                        "9": "₱100.00",
                        C: "₱200.00",
                        "0": "₱500.00",
                        ".": "₱1000.00",
                      },
                    })}
                  />
                </div>

                {btnsType.isDenom ? (
                  <>
                    <button
                      type="button"
                      className="font-montserrat font-bold text-base rounded-full border-slate-600 hover:bg-slate-600 active:bg-slate-700 hover:text-white border-2 py-3 w-full"
                      onClick={onEraseButtonClick}
                    >
                      CLEAR
                    </button>
                    <div className="flex mt-5">
                      <PaymentButtons
                        className="flex-auto mx-1"
                        buttonName={"CASH"}
                        onClick={onCashClick}
                        disabled={change.data.paymentStatus == PaymentStatus.ONGOING && change.data.balance === 0}
                      />
                      <PaymentButtons
                        className="flex-auto"
                        buttonName={"GIFT CHECK"}
                        onClick={onGiftCheckClick}
                        disabled={change.data.paymentStatus == PaymentStatus.ONGOING && change.data.balance === 0}
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-1">
                    <PaymentButtons 
                      buttonName={"CASH"} 
                      onClick={onCashClick} 
                      disabled={change.data.paymentStatus == PaymentStatus.ONGOING && isFullyPaid || parseInt(posfile.data?.extprc as unknown as string) === 0}
                    />
                    <PaymentButtons
                      buttonName={"CHECK"}
                      onClick={onCheckClick}
                      disabled={change.data.paymentStatus == PaymentStatus.ONGOING && isFullyPaid || parseInt(posfile.data?.extprc as unknown as string) === 0}
                    />
                    <PaymentButtons
                      buttonName={"DEBIT CARD"}
                      onClick={onDebitCardClick}
                      disabled={change.data.paymentStatus == PaymentStatus.ONGOING && isFullyPaid || parseInt(posfile.data?.extprc as unknown as string) === 0}
                    />
                    <PaymentButtons
                      buttonName={"CREDIT CARD"}
                      onClick={onCreditCardClick}
                      disabled={change.data.paymentStatus == PaymentStatus.ONGOING && isFullyPaid || parseInt(posfile.data?.extprc as unknown as string) === 0}
                    />
                    <PaymentButtons
                      buttonName={"GIFT CHECK"}
                      onClick={onGiftCheckClick}
                      disabled={change.data.paymentStatus == PaymentStatus.ONGOING && isFullyPaid || parseInt(posfile.data?.extprc as unknown as string) === 0}
                    />
                    <PaymentButtons
                      buttonName={"OTHER PAYMENT"}
                      onClick={onOtherPaymentClick}
                      disabled={change.data.paymentStatus == PaymentStatus.ONGOING && isFullyPaid || parseInt(posfile.data?.extprc as unknown as string) === 0}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* RIGHT PANEL */}
            <div className="ml-5 w-[300px]">
              <div className="grid grid-cols-2 my-5">
                <div className="top-0 left-0  fixed -z-20 opacity-[0] bg-white">
                  <ReceiptPrintout />
                  <PreviewReceipt />
                </div>

                {change.data.paymentStatus == PaymentStatus.START ? (
                  <div className="grid grid-cols-2 gap-1 w-[220px]">
                    {(isRootUser() ||
                      useraccessfiles.find(
                        (a: any) =>
                          a.menfield === orderingAccessMenfields.freetransaction
                      ) !== undefined) && (
                      <PaymentButtons
                        buttonName={"Free"}
                        className={`text-green-700 ${
                          parseInt(posfile.data?.extprc as unknown as string) === 0
                            ? "bg-gray-300 border-gray-300"
                            : "border-green-700"
                        }`}
                        disabled={parseInt(posfile.data?.extprc as unknown as string) === 0}
                        onClick={async () => {
                          // check if items has discount, if it has don't allow freeing the items
                          const filteredPosfiles = await filterPosfiles(posfiles?.data);
                          let hasDiscounts = false;
                          for (const posfile of filteredPosfiles) {
                            if (!hasDiscounts) {
                              hasDiscounts = hasDiscount(posfile.orderitmid);
                              if (hasDiscounts) break;
                            }
                          }

                          if (hasDiscounts) return;

                          if (authFreeTran === 0) {
                            setAuthOpen(true);
                          } else {
                            onFreeClick();
                          }
                        }}
                      />
                    )}
                    <PaymentButtons
                      buttonName={"Preview Receipt"}
                      onClick={() => {
                        console.log(orderDiscount);
                        viewPdfOrderingReceipt("preview-receipt");
                        // generateOrderingPrintout("preview-receipt");
                      }}
                    />
                  </div>
                ) : change.data.paymentStatus == PaymentStatus.ONGOING ? (
                  <div className="grid grid-cols-2 gap-1 w-[220px]">
                    <PaymentButtons
                      buttonName={"SAVE & PRINT TRANSACTION"}
                      onClick={() => {
                        setDisable(true);
                        setIsGeneratingReceipt(true);
                        onAddPayment(() => setIsGeneratingReceipt(false), openPaymentInfo);
                      }}
                      disabled={disable}
                    />
                    <PaymentButtons
                      buttonName={"VIEW RECEIPT"}
                      onClick={() => {
                        viewPdfOrderingReceipt("receipt");
                        // generateOrderingPrintout("receipt");
                      }}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <div className="text-sm">
                <div className="flex justify-between my-4">
                  <p className="font-medium text-lg">Subtotal</p>
                  <p className="font-medium text-lg">
                    ₱
                    {formatNumberWithCommasAndDecimals(
                      posfile?.data?.groext as number,
                      2
                    )}
                  </p>
                </div>

                <div className="flex justify-between font-montserrat my-4">
                  <p className="font-medium">Discount</p>
                  <p>-{formatNumberWithCommasAndDecimals(discAmt, 2)}</p>
                </div>

                <div className="flex justify-between font-montserrat my-4">
                  <p className="font-medium">Less VAT Adj.</p>
                  <p>
                    -{formatNumberWithCommasAndDecimals(
                      lessVatAdj.data?.extprc as number,
                      2
                    )}
                  </p>
                </div>

                <div className="flex justify-between my-4">
                  <p className="font-medium">Service Charge</p>
                  <p className="font-medium">
                    {" "}
                    {formatNumberWithCommasAndDecimals(
                      serviceCharge?.data?.extprc || 0,
                      2
                    )}
                  </p>
                </div>
                
                {serviceChargeDiscount.data > 0 && (
                  <div className="flex justify-between my-4">
                    <p className="font-medium">SCharge Discount</p>
                    <p className="font-medium">
                      {" "}
                      -{formatNumberWithCommasAndDecimals(
                        serviceChargeDiscount.data || 0,
                        2
                      )}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between text-red">
                  <p className="font-bold text-lg">Total</p>
                  <p className="font-bold text-lg ">
                    ₱
                    {posfile?.data?.extprc &&
                      serviceCharge?.data?.extprc &&
                      formatNumberWithCommasAndDecimals(
                        parseFloat(posfile.data.extprc + ""),
                        2
                      )}
                  </p>
                </div>
              </div>

              <div className="border-b my-2"></div>
              {/* PAYMENT */}
              <div className="flex justify-between text-sm">
                <div className="flex flex-col w-full">
                  {payment.data?.map(
                    (payment: {
                      id: string;
                      paymentMode: PaymentMethod;
                      itmcde: string;
                      amount: number;
                    }) => (
                      <button
                        className="flex flex-row justify-between items-center w-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          onRemovePayment(payment.id);
                        }}
                      >
                        <p>{payment.paymentMode === PaymentMethod.OTHER_PAYMENT ? payment.itmcde : payment.paymentMode}</p>
                        <div className="flex">
                          <p className="me-1">
                            {formatNumberWithCommasAndDecimals(
                              payment.amount,
                              2
                            )}
                          </p>
                          <CloseOutlined className="bg-green-600 text-white rounded-xl p-[3px]" />
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="border-b mt-2"></div>

              <div className=" mb-5 text-sm">
                <div className="flex justify-between my-2">
                  <p className="font-bold text-lg">Paid</p>
                  <p className="font-bold text-lg">
                    ₱
                    {formatNumberWithCommasAndDecimals(
                      change.data.paid as number,
                      2
                    )}
                  </p>
                </div>

                <div className="flex justify-between my-2">
                  <p className="font-bold text-lg">Balance</p>
                  <p className="font-bold text-lg">
                    ₱
                    {formatNumberWithCommasAndDecimals(
                      change.data.balance as number,
                      2
                    )}
                  </p>
                </div>

                <div className="flex justify-between my-2">
                  <p className="font-bold text-lg">Change</p>
                  <p className="font-bold text-lg">
                    ₱
                    {formatNumberWithCommasAndDecimals(
                      change.data.change as number,
                      2
                    )}
                  </p>
                </div>

                {change.data.paymentStatus == PaymentStatus.ONGOING ? (
                  <>
                    <div className="border-[1px] border-bottom mb-2" />
                    <PaymentButtons
                      buttonName={"EDIT CUSTOMER INFO."}
                      className="w-full"
                      onClick={()=> {
                        setCustomerInfo({
                          customerName: change.data.customerName,
                          address: change.data.address,
                          contactNo: change.data.contactNo,
                          tinNo: change.data.tinNo,
                        })
                        setEditCustomerInfo(true)
                      }}
                    />
                    <div className="flex justify-between my-2 text-wrap">
                      <p className="font-bold w-[80px]">Customer Name</p>
                      <p className="w-[135px] truncate">{change.data.customerName}</p>
                    </div>

                    <div className="flex justify-between my-2">
                      <p className="font-bold w-[80px]">Address</p>
                      <p className="w-[135px] truncate">{change.data.address}</p>
                    </div>

                    <div className="flex justify-between my-2">
                      <p className="font-bold w-[80px]">Contact No.</p>
                      <p className="w-[135px] truncate">{change.data.contactNo}</p>
                    </div>

                    <div className="flex justify-between my-2">
                      <p className="font-bold w-[80px]">TIN</p>
                      <p className="w-[135px] truncate">{change.data.tinNo}</p>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </form>
      </PaymentContext.Provider>
    </>
  );
}
