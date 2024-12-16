/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import { PosfileModel } from "../../../../models/posfile";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { useOrdering, useOrderingService } from "./orderingHooks";

// import {useNavigate} from "react-router";
import { removeXButton, toggle } from "../../../../reducer/modalSlice";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../../enums/activitylogs";
import { createContext, useEffect, useRef } from "react";
import { PaymentMethod, PaymentStatus } from "../enums";
import { setPayment } from "../../../../reducer/paymentSlice";
import { useOrderingPrintout } from "./orderingPrintoutHooks";
import { useReceiptPath } from "../../../../hooks/receiptPath";
import { useChangeNameModal } from "../../../../hooks/modalHooks";
import {
  setOrderDiscount,
  setPosfile,
  setPosfiles,
  setSelectedOrder,
  setTransaction,
  setClearLessVat,
  setActivePrinterStation,
} from "../../../../reducer/orderingSlice";
import { OrderingModel } from "../model/OrderingModel";
import { useXZReading } from "../../../../hooks/reportHooks";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { ApiService } from "../../../../services";
import { useOrderTicketHooks } from "./orderTicketHooks";
import { getOrderDiscount } from "../../../../store/actions/discount.action";
import {
  getPosfiles,
  getTotal,
  getServiceCharge,
  getLessVatAdj,
} from "../../../../store/actions/posfile.action";
import { getSpecialRequestDetails } from "../../../../store/actions/specialRequest.action";
import {
  getSysPar,
  getSysparOrdocnum,
} from "../../../../store/actions/systemParameters.action";
import { getActiveTransaction } from "../../../../store/actions/transaction.action";
import { receiptPrintoutV2 } from "../../../../hooks/printer/receiptHookV2";
import { getSinglePrinterStation } from "../../../../store/actions/printerStation.action";
import { stickerPrintout } from "../../../../hooks/printer/stickerPrintout";
import { PrinterStationModel } from "../../../../models/printerstation";
import { useGenerateMallFiles } from "../../../../hooks/generateMallHookUp";

export function usePayment() {
  const { pingOnFreeItem } = useAppSelector((state) => state.payment);
  const { generateSMCoinsAranetaMallFilesPerTransaction } =
    useGenerateMallFiles();
  const { isEnd } = useAppSelector((state) => state.transaction);
  const { postTransactionV2, postTransaction } =
    useOrderingService<PosfileModel>("posfile");
  const { postTransaction: postOrderingTran } =
    useOrderingService<OrderingModel>("transaction");
  const { generatePaymentReceipt, generateStickerPrintout } =
    useOrderingPrintout();
  const {
    // handlePrint
  } = useXZReading();
  const { handleReceiptPath: handleOrderReceiptPath } = useReceiptPath();
  const manualDinetype = useAppSelector(
    (state) => state.masterfile.syspar.data[0].manual_dinetype
  );

  const { order } = useOrdering();

  const navigate = useNavigate();
  const { postActivity } = useUserActivityLog();
  const { modalNameDispatch: changeModalName } = useChangeNameModal();
  // const {canProceed} = useVisitingTransactionChecking();

  const {
    change,
    payment,
    activePayment,
    check,
    card,
    giftCheck,
    otherPayment,
  } = useAppSelector((state) => state.payment);

  const selector = useAppSelector((state) => state);
  const { posfiles, specialRequest } = useAppSelector((state) => state.order);
  const { account } = useAppSelector((state) => state.account);
  // const checkRecalled = useAppSelector(
  //   (state) => state.otherTransaction.checkRecall
  // );

  const { transaction, posfileTOTAL: posfile } = useAppSelector(
    (state) => state.order
  );
  const { header, syspar, dineType } = useAppSelector(
    (state) => state.masterfile
  );

  const stickerPrinterStations = useRef<PrinterStationModel[]>([]);

  const appDispatch = useAppDispatch();

  const { handleOrderTicket } = useOrderTicketHooks();

  // this useEffect will be used for free transactions
  // we need to listen if the html receipt was already updated before processing
  // to have the updated data before printing the receipt
  useEffect(() => {
    const process = async () => {
      if (!forFreeItemDataRef.current) return;

      const isDoneGeneratingReceipt =
        forFreeItemDataRef.current?.isDoneGeneratingReceipt;

      forFreeItemDataRef.current = undefined;
      await processReceipt(isDoneGeneratingReceipt);
    };

    process(); // process the receipt if the html receipt was already updated
  }, [pingOnFreeItem.isReceiptUpdated]);

  const forFreeItemDataRef = useRef<{ isDoneGeneratingReceipt?: () => void }>();
  const onAddPayment = async (
    isDoneGeneratingReceipt?: () => void,
    openPaymentInfo?: (
      paymentInfoValue: { total: number; change: number; paid: number },
      callback: () => void
    ) => void
  ) => {
    if (posfile?.data?.extprc === 0) {
      isDoneGeneratingReceipt && isDoneGeneratingReceipt();
      return toast.error("Error: No items added.", {
        autoClose: 3000,
        hideProgressBar: true,
        position: "top-center",
      });
    }

    const isNotFreeItem = !payment.data.find(
      (d) => d.paymentMode === PaymentMethod.FREE
    );

    if (parseFloat(change.data.balance.toFixed(2)) !== 0 && isNotFreeItem) {
      isDoneGeneratingReceipt && isDoneGeneratingReceipt();
      return toast.error("Error: There is unpaid balance.", {
        autoClose: 3000,
        hideProgressBar: true,
        position: "top-center",
      });
    }

    //#region PRINTER STATION
    if (syspar.data[0].sticker_printer === 1) {
      stickerPrinterStations.current = []; // reset printer stations data
      for (const posfile of posfiles.data) {
        if (posfile.isaddon === 1) continue;
        if (posfile.itmcomtyp) continue;

        let printersize = 48;

        const itemfile = posfile.itemfile;
        const locationcde = itemfile?.locationcde;
        const printerStation = await appDispatch(
          getSinglePrinterStation(locationcde)
        );

        if (printerStation.payload) {
          printersize = printerStation.payload.printersize;

          if (!printersize) {
            isDoneGeneratingReceipt && isDoneGeneratingReceipt();
            toast.error(
              `Printer size is not set. Please set the printer size for the ${printerStation.payload.printername} printer station.`,
              {
                autoClose: 5000,
                hideProgressBar: true,
                position: "top-center",
              }
            );

            continue;
          }

          if (
            stickerPrinterStations.current.find(
              (d) => d.locationcde === locationcde
            )
          )
            continue;
          stickerPrinterStations.current.push(printerStation.payload);
        }
      }
    }
    //#endregion PRINTER STATION

    let isFreeItemPayment = false;
    for (const _payment of payment.data) {
      switch (_payment.paymentMode) {
        case PaymentMethod.CASH:
          await onCashPayment(_payment.amount);
          break;
        case PaymentMethod.CHECK:
          await onCheckPayment(_payment.amount);
          break;
        case PaymentMethod.DEBIT_CARD:
          await onCardPayment(_payment.amount);
          break;
        case PaymentMethod.CREDIT_CARD:
          await onCardPayment(_payment.amount);
          break;
        case PaymentMethod.GIFT_CHECK:
          await onGiftCheckPayment(_payment.amount);
          break;
        case PaymentMethod.OTHER_PAYMENT:
          await onOtherPayment(_payment.itmcde, _payment.amount);
          break;
        case PaymentMethod.FREE:
          isFreeItemPayment = true;
          forFreeItemDataRef.current = {
            isDoneGeneratingReceipt: isDoneGeneratingReceipt,
          };

          onFreeTransaction();
          break;
      }
    }

    // end the transaction
    postTransactionV2(
      {
        ordercde: transaction.data?.ordercde,
      },
      () => {},
      "endTransaction",
      undefined,
      true
    );

    //#region PROCESS RECEIPT
    if (!isFreeItemPayment)
      await processReceipt(isDoneGeneratingReceipt, openPaymentInfo);

    //#endregion
  };

  const processReceipt = async (
    isDoneGeneratingReceipt: any,
    openPaymentInfo?: (
      paymentInfoValue: { total: number; change: number; paid: number },
      callback: () => void
    ) => void
  ) => {
    console.log("Payment method", payment, activePayment);
    const mainPrinterStationSize = parseInt(
      localStorage.getItem("lst_conf_printer_size") || "80"
    );

    let copies = 1;

    const ordercode = posfile.data?.ordercde;
    const request = await appDispatch(getPosfiles(ordercode || ""));

    const allDiscounts = request.payload.map((d: any) => d.posDiscount[0]);

    for (let i = 0; i < allDiscounts.length; i++) {
      const d = allDiscounts[i];
      if (d?.govdisc && d.govdisc == 1) {
        console.log("Hi, I guess??????");
        copies += 1;
        break;
      }
    }

    if (
      payment.data[0].paymentMode == PaymentMethod.CHECK ||
      payment.data[0].paymentMode == PaymentMethod.CREDIT_CARD ||
      payment.data[0].paymentMode == PaymentMethod.DEBIT_CARD ||
      payment.data[0].paymentMode == PaymentMethod.GIFT_CHECK
    ) {
      copies += 1;
      console.log(copies, "HELLO");
    }

    if (payment.data[0].paymentMode == PaymentMethod.FREE) copies = 2;

    // OR receipt printing
    const base64 = await generatePaymentReceipt(
      "receipt",
      receiptPrintoutV2(selector, mainPrinterStationSize),
      async () => {
        // order ticket printing
        await handleOrderTicket();
      },
      copies
    );

    // sticker printing
    if (syspar.data[0].sticker_printer === 1) {
      for (const stickerPrinterStation of stickerPrinterStations.current) {
        const stickerPrinterStationPosfiles = posfiles.data.filter(
          (d) =>
            d.isaddon === 0 &&
            d.itemfile?.locationcde === stickerPrinterStation.locationcde
        );
        if (!(stickerPrinterStationPosfiles.length > 0)) continue;

        // check first if one of the posfile item has 2 or more quantity
        const finalStickerPStationPosfiles: PosfileModel[] = [];
        stickerPrinterStationPosfiles.forEach((posfile) => {
          const posfileQuantity = posfile.itmqty || 1;
          for (let i = 0; i < posfileQuantity; i++) {
            finalStickerPStationPosfiles.push(posfile);
          }
        });

        let index = 1;
        for (const stickerPrinterStationPosfile of finalStickerPStationPosfiles) {
          let printStickerData: {
            dineType: string;
            item: string;
            addOns: string[];
            remarks: string[];
            printerSize: number;
          } = {} as any;

          const dineTypeName =
            dineType.data.find(
              (d) => d.postypcde === transaction.data?.postypcde
            )?.postypdsc || "";
          const item = stickerPrinterStationPosfile.itmdsc || "";
          const orderItmId = stickerPrinterStationPosfile.orderitmid || "";
          const addOns = posfiles.data
            .filter((d) => d.mainitmid === orderItmId && d.isaddon === 1)
            .map((d) => d.itmdsc || "");
          const remarks = specialRequest.data
            .filter((d) => d.orderitmid === orderItmId)
            .map((d) => d.modcde);
          const printerSize = stickerPrinterStation.printersize;

          printStickerData = {
            dineType: dineTypeName,
            item,
            addOns,
            remarks,
            printerSize,
          };

          const stickerPrint = stickerPrintout(
            printStickerData.dineType,
            change.data.customerName,
            index,
            finalStickerPStationPosfiles.length,
            printStickerData.item,
            printStickerData.addOns,
            printStickerData.remarks,
            printerSize
          );

          console.log("axdxprintStickerData", stickerPrint);

          await generateStickerPrintout(
            stickerPrint,
            stickerPrinterStation,
            async () => {
              isDoneGeneratingReceipt && isDoneGeneratingReceipt();
            }
          );

          index++;
        }
      }
    }

    if (base64 !== "") {
      await handleOrderReceiptPath(
        {
          base64String: base64 as string,
          code: syspar.data[0].ordocnum?.slice(3),
          // ordercde: transaction.data?.tabletrncde.slice(3),
        },
        undefined,
        undefined,
        `${posfile.data?.trndte}T${posfile.data?.logtim}`
      );
    }

    isDoneGeneratingReceipt && isDoneGeneratingReceipt();

    appDispatch(setClearLessVat());
    appDispatch(removeXButton(false));
    appDispatch(setPayment([]));
    appDispatch(getPosfiles(transaction.data?.ordercde));

    // CHECKING IF THERE IS A RECALL TRANSACTION AND CLOSE THE TRANSACTION
    const response = await ApiService.post(`transaction/check-recall`, {});

    if (!openPaymentInfo) {
      if (response.data.isFromRecall) {
        generateSMCoinsAranetaMallFilesPerTransaction({
          trndte: posfile.data?.trndte,
        });
        resetAllTransaction(response.data.dataValues.ordercde);
        appDispatch(toggle());
      } else {
        generateSMCoinsAranetaMallFilesPerTransaction({
          trndte: posfile.data?.trndte,
        });
        openTransaction();
      }
    }

    openPaymentInfo?.(
      {
        change: change.data.change,
        total: posfile.data?.extprc || 0,
        paid: change.data.paid,
      },
      async () => {
        if (response.data.isFromRecall) {
          generateSMCoinsAranetaMallFilesPerTransaction({
            trndte: posfile.data?.trndte,
          });
          resetAllTransaction(response.data.dataValues.ordercde);
          appDispatch(toggle());
        } else {
          generateSMCoinsAranetaMallFilesPerTransaction({
            trndte: posfile.data?.trndte,
          });
          openTransaction();
        }
      }
    );
  };

  const resetAllTransaction = (ordercde: string) => {
    appDispatch(getPosfiles(ordercde || ""));
    appDispatch(getActiveTransaction());
    appDispatch(getSpecialRequestDetails());
    appDispatch(getOrderDiscount());
    appDispatch(getSysparOrdocnum());
    appDispatch(getTotal(""));
    appDispatch(getServiceCharge(""));
    appDispatch(getLessVatAdj(""));
    appDispatch(getOrderDiscount());
    appDispatch(setActivePrinterStation(null));
  };

  const resetOrdering = () => {
    appDispatch(setOrderDiscount([]));
    appDispatch(setSelectedOrder(null));
    appDispatch(setPosfiles([]));
    appDispatch(setPosfile(null));
    appDispatch(getSysPar());

    appDispatch(getSpecialRequestDetails());
    appDispatch(getOrderDiscount());
    appDispatch(getSysparOrdocnum());
    appDispatch(getTotal(""));
    appDispatch(getServiceCharge(""));
    appDispatch(getLessVatAdj(""));
    appDispatch(getOrderDiscount());
    appDispatch(setActivePrinterStation(null));
  };

  const openTransaction = () => {
    if (manualDinetype === 0) {
      if (isEnd) {
        appDispatch(toggle());
        resetOrdering();
        navigate("/pages/home");
      } else {
        resetOrdering();
        // show dine type selection modal if the manual dine type is disabled
        appDispatch(toggle());
        navigate("/pages/ordering/initialization");
        appDispatch(removeXButton(true)); // remove the X button of the modal, we only want the user to click the cancel btn if manual dinetype is disabled
        appDispatch(toggle());
        changeModalName("Add new transaction");
      }
    } else {
      // else just go to the next sequence if manual dine type is enabled
      const { transaction } = order;
      postOrderingTran(
        {
          status: "OPEN",
          postypcde: transaction.data?.postypcde,
          warcde: transaction.data?.warcde,
          isCreateTransaction: true,
          // isCancelTransaction: false,
          // incrementOrdocnum: true,
        } as any,
        (data: any) => {
          appDispatch(setTransaction(data.model_data));
          appDispatch(toggle());
          navigate("/pages/ordering");
          resetOrdering();
        }
      );
    }
  };

  const calculatePaymentData = (
    paymentList?: any[],
    payStatus?: PaymentStatus
  ) => {
    const listOfAmnts = (paymentList || payment.data).map(
      (d) => d.amount
    ) as unknown as number[];
    const totalAmount = listOfAmnts.reduce((a, b) => a + b, 0);

    const totalPrice = parseFloat(posfile?.data?.extprc + "");

    return {
      paid: totalAmount,
      change: totalAmount >= totalPrice ? totalAmount - totalPrice : 0,
      balance: totalAmount < totalPrice ? totalPrice - totalAmount : 0,
      paymentStatus: payStatus,
    };
  };

  const onCashPayment = async (_amount: number) => {
    return new Promise((resolve) => {
      const dineTypeFind = dineType.data.find(
        (d) => d.postypcde == transaction.data?.postypcde
      );

      const cashPaymentObject = {
        extprc: _amount,
        postrntyp: "PAYMENT",
        itmcde: "CASH",
        cashier: account.data?.usrcde,
        numpax: 1,
        customername: change.data.customerName,
        address: change.data.address,
        tin: change.data.tinNo,
        contactno: change.data.contactNo,
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        ordertyp: dineTypeFind?.ordertyp,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        brhcde: header.data[0].brhcde,
        itmqty: 1,
        trncde: "POS",
        ordercde: transaction.data?.ordercde,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        docnum: syspar.data[0].posdocnum,
      };

      const changePaymentObject = {
        extprc: change.data.change,
        postrntyp: "CHANGE",
        itmcde: "CHANGE",
        cashier: account.data?.usrcde,
        numpax: 1,
        customername: change.data.customerName,
        address: change.data.address,
        tin: change.data.tinNo,
        contactno: change.data.contactNo,
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        ordertyp: dineTypeFind?.ordertyp,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        brhcde: header.data[0].brhcde,
        itmqty: 1,
        trncde: "POS",
        trnstat: 1,
        ordercde: transaction.data?.ordercde,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        docnum: syspar.data[0].posdocnum,
        // ordocnum: posfile.data?.ordocnum,
      };

      // const amount = _amount;
      // const balance = parseFloat(change.data.balance);

      postTransactionV2(
        cashPaymentObject,
        (data) => {
          console.log(data);
          appDispatch(getTotal(""));
          appDispatch(getPosfiles(transaction.data?.ordercde));

          if (change.data.change !== 0) {
            postTransaction(
              changePaymentObject,
              (data) => {
                console.log(data);
                appDispatch(getTotal(""));
                appDispatch(getPosfiles(transaction.data?.ordercde));
                resolve(data);
              },
              "change",
              undefined,
              true
            );
          } else {
            resolve(data);
          }

          // postTransactionV2(
          //   {
          //     ordercde: transaction.data?.ordercde,
          //     ordocnum: posfile.data?.ordocnum,
          //   },
          //   (data) => {
          //     // console.log(data);
          //     resolve(data);
          //     // generateReceipt();
          //   },
          //   "endTransaction",
          //   undefined,
          //   true
          // );
        },
        "payment",
        {
          customError: "Failed To Close Transaction.",
          customSuccess: "Transaction Complete.",
        }
      );
      postActivity({
        module: MODULES.ORDERPREVIEW,
        method: METHODS.PRINT,
        remarks: `PRINTED TRANSACTION:\n${cashPaymentObject.billdocnum}\n${cashPaymentObject.ordercde}`,
      });
    });
  };

  const onFreeTransaction = () => {
    const freeTranObj = {
      customername: change.data.customerName,
      address: change.data.address,
      tin: change.data.tinNo,
      contactno: change.data.contactNo,
      freereason: payment.data.find((d) => d.paymentMode === PaymentMethod.FREE)
        .freereason,
    };

    postTransactionV2(
      freeTranObj,
      async (data) => {
        console.log(data);
        await appDispatch(getPosfiles(transaction.data?.ordercde));
        await appDispatch(getServiceCharge(transaction.data!.ordercde));

        // postTransactionV2(
        //   {
        //     ordercde: transaction.data?.ordercde,
        //     ordocnum: posfile.data?.ordocnum,
        //   },
        //   (data) => {
        //     console.log(data);
        //     // generateReceipt();
        //   },
        //   "endTransaction"
        // );
      },
      "freeTransaction"
    );
  };

  const onCheckPayment = async (_amount: number) => {
    return new Promise((resolve) => {
      const dineTypeFind = dineType.data.find(
        (d) => d.postypcde == transaction.data?.postypcde
      );

      const checkPaymentObject = {
        extprc: _amount,
        postrntyp: "PAYMENT",
        itmcde: "CHECK",
        cashier: account.data?.usrcde,
        numpax: 1,
        customername: change.data.customerName,
        address: change.data.address,
        tin: change.data.tinNo,
        contactno: change.data.contactNo,
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        ordertyp: dineTypeFind?.ordertyp,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        brhcde: header.data[0].brhcde,
        itmqty: 1,
        trncde: "POS",
        ordercde: transaction.data?.ordercde,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        docnum: syspar.data[0].posdocnum,
        ...check.data,
      };

      postTransactionV2(
        checkPaymentObject,
        (data) => {
          console.log(data);
          appDispatch(getTotal(""));
          appDispatch(getPosfiles(transaction.data?.ordercde));
          resolve(data);
          // postTransactionV2(
          //   {
          //     ordercde: transaction.data?.ordercde,
          //     ordocnum: posfile.data?.ordocnum,
          //   },
          //   (data) => {
          //     console.log(data);
          //     // generateReceipt();
          //   },
          //   "endTransaction"
          // );
        },
        "payment"
      );
    });
  };

  const onCardPayment = async (_amount: number) => {
    return new Promise((resolve) => {
      const dineTypeFind = dineType.data.find(
        (d) => d.postypcde == transaction.data?.postypcde
      );

      const checkPaymentObject = {
        extprc: _amount,
        postrntyp: "PAYMENT",
        itmcde: "CARD",
        cashier: account.data?.usrcde,
        numpax: 1,
        customername: change.data.customerName,
        address: change.data.address,
        tin: change.data.tinNo,
        contactno: change.data.contactNo,
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        ordertyp: dineTypeFind?.ordertyp,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        brhcde: header.data[0].brhcde,
        itmqty: 1,
        trncde: "POS",
        ordercde: transaction.data?.ordercde,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        docnum: syspar.data[0].posdocnum,
        ...card?.data,
      };

      postTransactionV2(
        checkPaymentObject,
        (data) => {
          console.log(data);
          appDispatch(getTotal(""));
          appDispatch(getPosfiles(transaction.data?.ordercde));
          resolve(data);
          // postTransactionV2(
          //   {
          //     ordercde: transaction.data?.ordercde,
          //     ordocnum: posfile.data?.ordocnum,
          //   },
          //   (data) => {
          //     console.log(data);
          //     // generateReceipt();
          //   },
          //   "endTransaction"
          // );
        },
        "payment"
      );
    });
  };

  const onGiftCheckPayment = (_amount: number) => {
    return new Promise((resolve) => {
      const dineTypeFind = dineType.data.find(
        (d) => d.postypcde == transaction.data?.postypcde
      );

      const checkPaymentObject = {
        extprc: _amount,
        postrntyp: "PAYMENT",
        itmcde: "GIFT",
        cashier: account.data?.usrcde,
        numpax: 1,
        customername: change.data.customerName,
        address: change.data.address,
        tin: change.data.tinNo,
        contactno: change.data.contactNo,
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        ordertyp: dineTypeFind?.ordertyp,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        brhcde: header.data[0].brhcde,
        itmqty: 1,
        trncde: "POS",
        ordercde: transaction.data?.ordercde,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        docnum: syspar.data[0].posdocnum,
        ...giftCheck?.data,
      };

      postTransactionV2(
        checkPaymentObject,
        (data) => {
          console.log(data);
          appDispatch(getTotal(""));
          appDispatch(getPosfiles(transaction.data?.ordercde));
          resolve(data);
          // postTransactionV2(
          //   {
          //     ordercde: transaction.data?.ordercde,
          //     ordocnum: posfile.data?.ordocnum,
          //   },
          //   (data) => {
          //     console.log(data);
          //     // generateReceipt();
          //   },
          //   "endTransaction"
          // );
        },
        "payment"
      );
    });
  };

  const onOtherPayment = (itmcde: string, _amount: number) => {
    return new Promise((resolve) => {
      const dineTypeFind = dineType.data.find(
        (d) => d.postypcde == transaction.data?.postypcde
      );

      const checkPaymentObject = {
        extprc: _amount,
        postrntyp: "PAYMENT",
        itmcde: itmcde,
        cashier: account.data?.usrcde,
        numpax: 1,
        customername: change.data.customerName,
        address: change.data.address,
        tin: change.data.tinNo,
        contactno: change.data.contactNo,
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        ordertyp: dineTypeFind?.ordertyp,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        brhcde: header.data[0].brhcde,
        itmqty: 1,
        trncde: "POS",
        ordercde: transaction.data?.ordercde,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        docnum: syspar.data[0].posdocnum,
        ...otherPayment?.data,
      };

      postTransactionV2(
        checkPaymentObject,
        (data) => {
          console.log(data);
          appDispatch(getTotal(""));
          appDispatch(getPosfiles(transaction.data?.ordercde));
          resolve(data);
          // postTransactionV2(
          //   {
          //     ordercde: transaction.data?.ordercde,
          //     ordocnum: posfile.data?.ordocnum,
          //   },
          //   (data) => {
          //     console.log(data);
          //     // generateReceipt();
          //   },
          //   "endTransaction"
          // );
        },
        "payment"
      );
    });
  };

  return {
    onAddPayment,
    onFreeTransaction,
    calculatePaymentData,
    resetOrdering,
  };
}

export const PaymentContext = createContext(() => {
  console.log("default function");
});
