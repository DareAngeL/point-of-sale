/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { toast } from "react-toastify";
import { useService } from "../../../../hooks/serviceHooks";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { ItemSubclassificationModel } from "../../../../models/itemsubclassification";
import { useEffect, useState } from "react";
import { ItemModel } from "../../../../models/items";
import { ItemClassificationModel } from "../../../../models/itemclassification";
import { PosfileModel } from "../../../../models/posfile";
import moment from "moment";
import {
  setSelectedOrder,
  setSpecialRequestDetails,
  setPosfile,
  setPosfiles,
  setTransaction,
  setOrderDiscount,
  setActivePrinterStation,
  setIsProcessingTransaction,
  setHasTransaction,
} from "../../../../reducer/orderingSlice";
import { useNavigate } from "react-router";
import {
  changeName,
  toggle,
  removeXButton,
  setCancelTransactionModal,
} from "../../../../reducer/modalSlice";
import { WarehouseModel } from "../../../../models/warehouse";
import { PricelistModel } from "../../../../models/pricelist";
import { OrderingModel } from "../model/OrderingModel";
import { SpecialRequestDetailModel } from "../../../../models/specialrequest";
import { DiscountModel, DiscountOrderModel } from "../../../../models/discount";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../../enums/activitylogs";
import { useOrderingPrintout } from "./orderingPrintoutHooks";
// import {useXZReading} from "../../../../hooks/reportHooks";
import { v4 as uuidv4 } from "uuid";
import { useReceiptPath } from "../../../../hooks/receiptPath";
import { useChangeNameModal } from "../../../../hooks/modalHooks";
import { ItemComboModel } from "../../../../models/itemCombo";
import { useOrderTicketHooks } from "./orderTicketHooks";
import { ApiService } from "../../../../services";
import { getOrderDiscount } from "../../../../store/actions/discount.action";
import {
  getTotal,
  getServiceCharge,
  getPosfiles,
  getLessVatAdj,
  deleteAllPosfileDiscounts,
} from "../../../../store/actions/posfile.action";
import { getSpecialRequestDetails } from "../../../../store/actions/specialRequest.action";
import { getSysPar } from "../../../../store/actions/systemParameters.action";
import {
  getActiveTransaction,
  getTransactions,
} from "../../../../store/actions/transaction.action";
import {
  deleteDiscount,
  openTransaction,
  postDiscount,
  putOrderTypeComboBulk,
  putTransactionCombo,
  refundTransaction as refundTransactionRedux,
} from "../../../../store/actions/ordering.action";
import { getDineTypeByPosType } from "../../../../store/actions/dineType.action";
import { getSingleMEMC } from "../../../../store/actions/memc.action";
import { refundReceiptPrintoutV2 } from "../../../../hooks/printer/refundReceiptHookV2";
import { voidReceiptPrintoutV2 } from "../../../../hooks/printer/voidReceiptHookV2";
import { receiptDefiner } from "../../../../helper/ReceiptNumberFormatter";

export function useOrderingService<T>(url: string) {
  const { putData, deleteData, postBulkData, postData } = useService<T>(url);

  const postTransaction = (
    data: T,
    cb: (cbData: T) => void,
    url?: string,
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    },
    noModal?: boolean
  ) => {
    const toastLoading = toast.loading("Uploading", {
      toastId: "postTransactionLoading",
      position: "top-center",
      hideProgressBar: true,
    });

    putData("" + (url ? url : ""), data, async (model, error) => {
      toast.dismiss(toastLoading);

      if (error) {
        if (!noModal) {
          const errorMessage = customMessage?.customError
            ? customMessage.customError
            : `Error: ${error.message}`;
          toast.error(errorMessage, {
            hideProgressBar: true,
            position: "top-center",
          });
        }
      } else {
        if (!noModal) {
          const succesMessage = customMessage?.customSuccess
            ? customMessage?.customSuccess
            : "Successfully uploaded.";
          toast.success(succesMessage, {
            toastId: "postTransaction",
            autoClose: 2000,
            position: "top-center",
            hideProgressBar: true,
          });
        }

        console.log(model);
        cb(model as T);
      }
    });
  };

  const postTransactionV2 = (
    data: T,
    cb: (cbData: T) => void,
    url?: string,
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    },
    noModal?: boolean
  ) => {
    const toastLoading = toast.loading("Uploading", {
      toastId: "postTransactionV2Loading",
      hideProgressBar: true,
      position: "top-center",
    });

    postData("" + (url ? url : ""), data, async (model, error) => {
      toast.dismiss(toastLoading);

      if (error) {
        if (!noModal) {
          const errorMessage = customMessage?.customError
            ? customMessage.customError
            : `Error: ${error.message}`;
          toast.error(errorMessage, {
            hideProgressBar: true,
            position: "top-center",
          });
        }
        cb(error as T);
      } else {
        if (!noModal) {
          const succesMessage = customMessage?.customSuccess
            ? customMessage?.customSuccess
            : "Successfully uploaded.";
          toast.success(succesMessage, {
            toastId: "postTransactionV2",
            position: "top-center",
            hideProgressBar: true,
          });
        }

        console.log(model);
        cb(model as T);
      }
    });
  };

  const postBulkTransaction = (
    data: T[],
    cb: (cbData: T) => void,
    url?: string,
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    }
  ) => {
    const toastLoading = toast.loading("Uploading", {
      toastId: "postBulkTransactionLoading",
      position: "top-center",
      hideProgressBar: true,
    });

    postBulkData("" + (url ? url : ""), data, async (model, error) => {
      toast.dismiss(toastLoading);

      if (error) {
        const errorMessage = customMessage?.customError
          ? customMessage.customError
          : `Error: ${error.message}`;
        toast.error(errorMessage, {
          hideProgressBar: true,
          position: "top-center",
        });
      } else {
        const succesMessage = customMessage?.customSuccess
          ? customMessage?.customSuccess
          : "Successfully uploaded.";
        toast.success(succesMessage, {
          toastId: "postBulkTransction",
          position: "top-center",
          hideProgressBar: true,
        });

        console.log(model);
        cb(model as T);
      }
    });
  };

  const deleteTransaction = (
    cb: (cbData: T) => void,
    url?: string,
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    },
    showToast?: boolean
  ) => {
    const toastLoading = toast.loading("Uploading", {
      toastId: "deleteTransactionLoading",
      position: "top-center",
      hideProgressBar: true,
    });

    deleteData(url || "", async (model, error) => {
      toast.dismiss(toastLoading);

      if (error && showToast) {
        const errorMessage = customMessage?.customError
          ? customMessage.customError
          : `Error: ${error.message}`;
        toast.error(errorMessage, {
          hideProgressBar: true,
          position: "top-center",
        });
      } else {
        if (showToast) {
          const succesMessage = customMessage?.customSuccess
            ? customMessage?.customSuccess
            : "Successfully uploaded.";
          toast.success(succesMessage, {
            toastId: "deleteTransaction",
            position: "top-center",
            hideProgressBar: true,
          });
        }

        console.log(model);
        cb(model as T);
      }
    });
  };

  return {
    postTransaction,
    deleteTransaction,
    postBulkTransaction,
    postTransactionV2,
    // deleteTransactionWithPayload,
  };
}

export function useOrdering() {
  const appDispatch = useAppDispatch();
  // const selector = useAppSelector((state) => state);
  const masterfile = useAppSelector((state) => state.masterfile);

  const order = useAppSelector((state) => state.order);
  const { account } = useAppSelector((state) => state.account);
  const { postActivity } = useUserActivityLog();

  const { selectedOrder, transaction, posfiles, orderDiscount } = order;

  const { postTransaction, deleteTransaction, postBulkTransaction } =
    useOrderingService<PosfileModel>("posfile");

  const {
    // item,
    // itemSubclassification,
    // itemClassification,
    header,
    syspar,
    dineType,
    priceList,
    warehouse,
  } = masterfile;

  // const [activeSubclass, setActiveSubclass] =
  //   useState<ItemSubclassificationModel[]>();
  // const [activeItem, setActiveItem] = useState<ItemModel[]>();
  const [activeSubclass, setActiveSubclass] = useState<
    { itmclacde: string } | undefined
  >(undefined);
  const [activeItem, setActiveItem] = useState<
    | {
        itmsubclacde: string | undefined;
        prccde: string | undefined;
      }
    | undefined
  >(undefined);

  const [isSearching, setIsSearching] = useState(false);
  const [searchedItems, setSearchedItems] = useState<{
    [key: string]: { subclass: any }[] | string;
  }>();

  const [pricelistActive, setPricelistActive] = useState<PricelistModel>();

  useEffect(() => {
    const load = async () => {
      setActiveSubclass(undefined);
      setActiveItem({
        itmsubclacde: undefined,
        prccde: undefined,
      });

      // const genPricelist = await priceListGenerator(
      //   warehouse.data,
      //   priceList.data,
      //   transaction.data as OrderingModel
      // );
      // setPricelistActive(genPricelist);
      // console.log("xxxASDGEN", genPricelist);
    };

    load();
  }, [transaction.data]);

  useEffect(() => {
    const _setPricelist = async () => {
      setPricelistActive(
        await priceListGenerator(
          warehouse.data,
          priceList.data,
          transaction.data as OrderingModel
        )
      );
    };

    _setPricelist();
  }, [priceList.data]);

  const refreshData = () => {
    appDispatch(getTotal(""));
    appDispatch(getServiceCharge(""));
  };

  const onClickActiveSubclass = (itemClass: ItemClassificationModel) => {
    setActiveSubclass({
      itmclacde: itemClass.itmclacde,
    });
    setActiveItem({
      itmsubclacde: undefined,
      prccde: undefined,
    });

    refreshData();
  };

  const onClickActiveItem = (itemSubclass: ItemSubclassificationModel) => {
    setActiveItem({
      itmsubclacde: itemSubclass.itemsubclasscde,
      prccde: pricelistActive?.prccde,
    });

    // const findPriceList = priceList.data.find(d => d.prccde)
    // const mappedUpdatedPrice = findItemSubclassification?.itemfiles
    //   .map((item) => {
    //     const findActivePrice = pricelistActive?.pricecodefile2s.find(
    //       (pl) => pl.itmcde == item.itmcde
    //     );

    //     if (findActivePrice) {
    //       console.log("Active price pareh", findActivePrice);
    //       return {
    //         ...item,
    //         grossprc: findActivePrice.untprc,
    //         groprc: findActivePrice.untprc,
    //         groext: findActivePrice.untprc,
    //         extprc: findActivePrice.untprc,
    //       };
    //     }
    //   })
    //   .filter((el) => el != undefined);

    // setActiveItem(mappedUpdatedPrice as ItemModel[]);
    refreshData();
  };

  const onSearch = (text: string) => {
    return new Promise((resolve) => {
      const init = async () => {
        // reset
        setActiveItem({
          itmsubclacde: undefined,
          prccde: undefined,
        });

        const res = (
          await ApiService.get(
            `pricedetail/ordering/search/${text.toLowerCase()}/${
              pricelistActive?.prccde
            }`
          )
        ).data;
        const keys = Object.keys(res);

        setSearchedItems({ ...res, searchedTerm: [text] });
        setActiveSubclass({
          itmclacde: keys[0],
        });
        setActiveItem({
          itmsubclacde: res[keys[0]][0].subclass,
          prccde: pricelistActive?.prccde,
        });
      };

      init();
      resolve(true);
    });
  };

  const onSearchEmpty = () => {
    setSearchedItems(undefined);
    setActiveSubclass(undefined);
    setActiveItem({
      itmsubclacde: undefined,
      prccde: undefined,
    });
  };

  const hasSelectItem = () => {
    if (!selectedOrder.data) {
      toast.error("Error : Select item first.", {
        hideProgressBar: true,
        position: "top-center",
      });
      return false;
    }

    return true;
  };

  const hasDiscount = (orderitmid?: string) => {
    const findDiscount = orderDiscount.data.find(
      (od) =>
        (orderitmid ? orderitmid : selectedOrder.data.orderitmid) ==
        od.orderitmid
    );

    if (findDiscount) {
      toast.error("Error : Remove discount first.", {
        hideProgressBar: true,
        position: "top-center",
      });
      return true;
    }

    return false;
  };

  const isFreeItem = () => {
    if (
      selectedOrder.data?.freereason &&
      selectedOrder.data?.freereason != ""
    ) {
      toast.error("Error : Remove free item first.", {
        hideProgressBar: true,
        position: "top-center",
      });
      return true;
    }

    return false;
  };

  const isPriceOveridden = () => {
    console.log(selectedOrder);
    if (selectedOrder.data && selectedOrder.data.changed == 1) {
      toast.error("Error : Remove price override first.", {
        hideProgressBar: true,
        position: "top-center",
      });
      return true;
    }

    return false;
  };

  const hasItem = () => {
    if (posfiles.data.length <= 0) {
      toast.error("Error : No added items", {
        hideProgressBar: true,
        position: "top-center",
      });
      return false;
    }

    return true;
  };

  const onAddTransactionCombo = async (selectedItem: {
    itm: ItemComboModel[];
    comboTotal: number;
    quantity: number;
    baseItem: any;
    quantityReference: any[];
  }) => {
    appDispatch(setIsProcessingTransaction(true));

    let grandtotal = 0;

    const findItem = selectedItem.baseItem[0];
    const dineTypeFind = dineType.data.find(
      (d) => d.postypcde == order.transaction.data?.postypcde
    );

    const baseItemPosfile = {
      ordercde: order.transaction.data?.ordercde,
      brhcde: header.data[0].brhcde ?? "",
      itmcde: findItem?.itmcde,
      itmqty: selectedItem.quantity,
      voidqty: 0,
      extprc:
        parseFloat(selectedItem.baseItem[0].untprc) * selectedItem.quantity,
      grossprc: selectedItem.baseItem[0].untprc,
      groext:
        parseFloat(selectedItem.baseItem[0].untprc) * selectedItem.quantity,
      groprc: selectedItem.baseItem[0].untprc,
      untprc: selectedItem.baseItem[0].untprc,
      vatrte: syspar.data[0].vatrte,
      ordertyp: dineTypeFind?.ordertyp,
      memc: findItem?.memc,
      taxcde: findItem?.taxcde,
      itmpaxcount: findItem?.itmpaxcount,
      itmdsc: findItem?.itmdsc,
      isaddon: 0,
      mainitmcde: findItem?.itmcde,
      postypcde: order.transaction.data?.postypcde,
      warcde: order.transaction.data?.warcde,
      postrntyp: "ITEM",
      docnum: syspar.data[0].posdocnum,
      billdocnum: syspar.data[0].billdocnum,
      trndte: moment(new Date()).format("YYYY-MM-DD"),
      logtim: moment(new Date()).format("H:mm:ss"),
      cashier: account.data?.usrcde,
      numpax: 1,
      postrmno: header.data[0].postrmno,
      bnkcde: header.data[0].bnkcde,
      itmnum: findItem?.itmnum,
      vatamt:
        parseFloat(findItem?.untprc) * selectedItem.quantity * (1 - 1 / 1.12),
      netvatamt: (parseFloat(findItem?.untprc) * selectedItem.quantity) / 1.12,
      vatexempt: parseFloat(findItem?.untprc) * selectedItem.quantity,
      chkcombo: 1,
    };

    const baseCombo: any[] = [];

    for (const selected of selectedItem.itm) {
      // const findItem = item.data.find((d) => selected.itmcde == d.itmcde);
      const findItem = (
        await ApiService.get(`item/filter/?itmcde=${selected.itmcde}`)
      ).data[0];

      const dineTypeFind = dineType.data.find(
        (d) => d.postypcde == order.transaction.data?.postypcde
      );
      const findActivePrice = pricelistActive?.pricecodefile2s.find(
        (pl) => pl.itmcde == selected.itmcde
      );

      const baseModel = {
        itmcomcde: selected.itmcomcde,
        ordercde: order.transaction.data?.ordercde,
        brhcde: header.data[0].brhcde ?? "",
        itmcde: findItem?.itmcde,
        itmqty: selectedItem.quantity,
        voidqty: 0,
        extprc:
          findActivePrice && findActivePrice.untprc * selectedItem.quantity,
        grossprc: (findItem?.untprc || 0) * (selectedItem.quantity || 0),
        groext:
          findActivePrice && findActivePrice.untprc * selectedItem.quantity,
        // findActivePrice?.untprc,
        groprc: findActivePrice?.untprc,
        untprc: findActivePrice?.untprc,
        vatrte: syspar.data[0].vatrte,
        ordertyp: dineTypeFind?.ordertyp,
        memc: findItem?.memc,
        taxcde: findItem?.taxcde,
        itmpaxcount: findItem?.itmpaxcount,
        itmdsc: findItem?.itmdsc,
        isaddon: 0,
        mainitmcde: findItem?.itmcde,
        postypcde: order.transaction.data?.postypcde,
        warcde: order.transaction.data?.warcde,
        postrntyp: "ITEM",
        docnum: syspar.data[0].posdocnum,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        cashier: account.data?.usrcde,
        numpax: 1,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        itmnum: findItem?.itmnum,
        vatamt:
          parseFloat(findItem?.untprc) * selectedItem.quantity * (1 - 1 / 1.12),
        netvatamt:
          (parseFloat(findItem?.untprc) * selectedItem.quantity) / 1.12,
        vatexempt: parseFloat(findItem?.untprc) * selectedItem.quantity,
        itmcomtyp: selected.itmcomtyp,
        chkcombo: 0,
      };

      if (selected.itmcomtyp === "UPGRADE") {
        const findQuantity = selectedItem.quantityReference.find(
          (item) => item.recid === selected.recid
        );
        grandtotal += parseFloat(selected.upgprc) * findQuantity.comboQuantity;

        baseModel.untprc = parseFloat(selected.upgprc);
        baseModel.groprc = parseFloat(selected.upgprc);
        baseModel.grossprc = parseFloat(selected.upgprc);
        baseModel.extprc =
          parseFloat(selected.upgprc) * findQuantity.comboQuantity;
        baseModel.groext =
          parseFloat(selected.upgprc) * findQuantity.comboQuantity;
        baseModel.itmqty = findQuantity.comboQuantity;

        console.log("UPGRADE BASE MODEL:", baseModel);
        baseCombo.push(baseModel);
      } else {
        baseModel.untprc = 0;
        baseModel.groprc = 0;
        baseModel.grossprc = 0;
        baseModel.extprc = 0;
        baseModel.groext = 0;
        console.log("DEFAULT OTHER MODEL:", baseModel);
        baseCombo.push(baseModel);
      }
    }

    // const updateExtprc =
    // parseFloat(selectedItem.baseItem[0].untprc) * selectedItem.quantity;
    baseItemPosfile.extprc =
      parseFloat(baseItemPosfile.untprc) * selectedItem.quantity;
    baseItemPosfile.groext =
      parseFloat(baseItemPosfile.untprc) * selectedItem.quantity;
    baseItemPosfile.groprc = parseFloat(baseItemPosfile.untprc);
    baseItemPosfile.grossprc = parseFloat(baseItemPosfile.untprc);
    // baseItemPosfile.untprc = parseFloat(baseItemPosfile.untprc) + grandtotal;

    // return;

    try {
      await appDispatch(
        putTransactionCombo({
          baseCombo,
          baseItemPosfile,
        })
      );
      refreshData();
      await appDispatch(getPosfiles(order.transaction.data?.ordercde));
      appDispatch(setIsProcessingTransaction(false));
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeOrdertypeComboBulk = async (posfileBulkCombo: any[]) => {
    console.log(posfileBulkCombo);
    try {
      await appDispatch(
        putOrderTypeComboBulk({
          posfileBulkCombo: posfileBulkCombo,
        })
      );
      refreshData();
      appDispatch(getPosfiles(order.transaction.data?.ordercde));
    } catch (error) {
      console.log(error);
    }
  };

  const onAddTransaction = async (selectedItem: {
    itm: ItemModel;
    quantity?: number;
    overridePrice?: number;
    orderType?: string;
  }) => {
    const { itm } = selectedItem;
    const dineType = (
      await appDispatch(
        getDineTypeByPosType(order.transaction.data?.postypcde || "")
      )
    ).payload;
    const memc = (await appDispatch(getSingleMEMC({ code: itm.memc }))).payload;

    const posfileObject: PosfileModel = {
      ordercde: order.transaction.data?.ordercde,
      brhcde: header.data[0].brhcde ?? "",
      itmcde: itm?.itmcde,
      itmqty: selectedItem.quantity ?? 1,
      voidqty: 0,
      grossprc: (itm.untprc || 0) * (selectedItem.quantity || 0),
      groext: itm.groext,
      groprc: itm.groprc,
      untprc: itm.groprc,
      vatrte: syspar.data[0].vatrte,
      ordertyp: selectedItem.orderType
        ? selectedItem.orderType
        : dineType?.ordertyp,
      memc: itm.memc,
      memc_value: memc?.value,
      taxcde: itm.taxcde,
      itmpaxcount: itm.itmpaxcount,
      itmdsc: itm.itmdsc,
      isaddon: 0,
      mainitmcde: itm.itmcde,
      postypcde: order.transaction.data?.postypcde,
      warcde: order.transaction.data?.warcde,
      postrntyp: "ITEM",
      docnum: syspar.data[0].posdocnum,
      billdocnum: syspar.data[0].billdocnum,
      trndte: moment(new Date()).format("YYYY-MM-DD"),
      logtim: moment(new Date()).format("H:mm:ss"),
      cashier: account.data?.usrcde,
      numpax: 1,
      postrmno: header.data[0].postrmno,
      bnkcde: header.data[0].bnkcde,
      itmnum: itm.itmnum,
      vatamt: itm.groext * 1 * (1 - 1 / 1.12),
      netvatamt: (itm.groext * 1) / 1.12,
      vatexempt: itm.groext * 1,
      // vatamtloc : ,
    };

    appDispatch(setIsProcessingTransaction(true));

    postTransaction(
      posfileObject,
      (data) => {
        console.log(data);
        refreshData();
        appDispatch(getPosfiles(order.transaction.data?.ordercde));

        setTimeout(() => {
          appDispatch(setIsProcessingTransaction(false));
        }, 500);
      },
      "transaction",
      {
        customError: "Item Failed to Add.",
        customSuccess: "Item Added Successfully.",
      }
    );
    postActivity({
      method: METHODS.CREATE,
      module: MODULES.ORDERING,
      remarks: `ITEM ORDER ADDED:\nITEM CODE: ${itm?.itmcde}\nDESCRIPTION: ${itm?.itmdsc}\nPRICE: ${itm?.untprc}`,
    });
  };

  const onAddBulkTransaction = async (
    selectedItem: {
      itm: ItemModel;
      quantity?: number;
      overridePrice?: number;
      orderType?: string;
      orderitmid?: string;
    }[],
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    }
  ) => {
    console.log("DITO");

    const posfileObjects: PosfileModel[] = [];

    for (const selected of selectedItem) {
      // const findItem = item.data.find((d) => selected.itm.itmcde == d.itmcde);
      const findItem = (
        await ApiService.get(`item/filter/?itmcde=${selected.itm.itmcde}`)
      ).data[0];
      const dineTypeFind = dineType.data.find(
        (d) => d.postypcde == order.transaction.data?.postypcde
      );

      const posfileObject: PosfileModel = {
        ordercde: order.transaction.data?.ordercde,
        orderitmid: selected.orderitmid,
        brhcde: header.data[0].brhcde ?? "",
        itmdsc: findItem?.itmdsc,
        itmcde: findItem?.itmcde,
        itmqty: selected.quantity ?? 1,
        voidqty: 0,
        grossprc: (findItem?.untprc || 0) * (selected.quantity || 0),
        groprc: selected.overridePrice
          ? selected.overridePrice
          : findItem?.untprc,
        untprc: selected.overridePrice
          ? selected.overridePrice
          : findItem?.untprc,
        groext: selected.overridePrice
          ? selected.overridePrice
          : findItem?.untprc,
        vatrte: syspar.data[0].vatrte,
        ordertyp: selected.orderType
          ? selected.orderType
          : dineTypeFind?.ordertyp,
        memc: findItem?.memc,
        taxcde: findItem?.taxcde,
        itmpaxcount: findItem?.itmpaxcount,
        isaddon: 0,
        mainitmcde: findItem?.itmcde,
        postypcde: order.transaction.data?.postypcde,
        warcde: order.transaction.data?.warcde,
        postrntyp: "ITEM",
        docnum: syspar.data[0].posdocnum,
        billdocnum: syspar.data[0].billdocnum,
        trndte: moment(new Date()).format("YYYY-MM-DD"),
        logtim: moment(new Date()).format("H:mm:ss"),
        cashier: account.data?.usrcde,
        numpax: 1,
        postrmno: header.data[0].postrmno,
        bnkcde: header.data[0].bnkcde,
        itmnum: findItem?.itmnum,
        vatamt:
          (findItem?.untprc as number) *
          (findItem?.itmqty as number) *
          (1 - 1 / 1.12),
        netvatamt:
          ((findItem?.untprc as number) * (findItem?.itmqty as number)) / 1.12,
        vatexempt: (findItem?.untprc as number) * (findItem?.itmqty as number),
      };

      posfileObjects.push(posfileObject);
    }

    postBulkTransaction(
      posfileObjects,
      (data) => {
        console.log(data);
        refreshData();
        appDispatch(getPosfiles(order.transaction.data?.ordercde));
      },
      "changeordertype",
      customMessage
    );
  };

  const onDeleteTransaction = (
    recid: string,
    cb?: () => void,
    customMessage?: { customError?: string; customSuccess?: string }
  ) => {
    deleteTransaction(
      (posfileObject) => {
        console.log("deleted then callback par", posfileObject);

        if (cb) {
          cb();
        }
      },
      recid,
      customMessage,
      true
    );
  };

  return {
    masterfile,
    order,
    onClickActiveItem,
    onClickActiveSubclass,
    onAddTransaction,
    onDeleteTransaction,
    onAddBulkTransaction,
    activeItem,
    activeSubclass,
    isFreeItem,
    isPriceOveridden,
    hasSelectItem,
    hasDiscount,
    hasItem,
    onSearch,
    searchedItems,
    isSearching,
    setIsSearching,
    onSearchEmpty,
    onAddTransactionCombo,
    onChangeOrdertypeComboBulk,
  };
}

export function useSpecialRequest() {
  const { postBulkTransaction, deleteTransaction } =
    useOrderingService<SpecialRequestDetailModel>("specialrequest");
  //   const {postActivity} = useUserActivityLog();

  const onAddSpecialRequest = (
    sr: SpecialRequestDetailModel[],
    cb: (data: SpecialRequestDetailModel) => void
  ) => {
    postBulkTransaction(
      sr,
      (data) => {
        cb(data);
      },
      "bulkDetail",
      {
        customError: "Failed to Add Special Request.",
        customSuccess: "Special Request Added.",
      }
    );
  };

  const onDeleteSpecialRequest = (
    recid: string,
    cb: (data: SpecialRequestDetailModel) => void,
    item?: any,
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    }
  ) => {
    deleteTransaction(
      (srObject) => {
        cb && cb(srObject);
      },
      "deleteDetail/" + recid,
      customMessage
    );

    console.log(item);
    // postActivity({
    //   method: METHODS.DELETE,
    //   module: MODULES.ORDERING,
    //   remarks: `DELETED SPECIAL REQUEST:\nREQUEST: ${item.modcde}\nFROM ITEM ID: ${item.orderitmid}`,
    // });
  };

  return { onAddSpecialRequest, onDeleteSpecialRequest };
}

export function useTransaction() {
  const { postTransaction: postOrderingTran, postTransactionV2 } =
    useOrderingService<any>("transaction");
  const navigate = useNavigate();

  const appDispatch = useAppDispatch();
  const { order, masterfile } = useAppSelector((state) => state);
  const { transaction } = order;
  const { syspar } = masterfile;

  const resetOrdering = () => {
    appDispatch(setOrderDiscount([]));
    appDispatch(setSelectedOrder(null));
    appDispatch(setPosfiles([]));
    appDispatch(setPosfile(null));

    appDispatch(getSpecialRequestDetails());
    appDispatch(getOrderDiscount());
    appDispatch(getTotal(""));
    appDispatch(getServiceCharge(""));
    appDispatch(getLessVatAdj(""));
    appDispatch(getOrderDiscount());
  };

  const onCancelTransaction = (cb: (data: unknown) => void) => {
    postTransactionV2(
      {
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        status: "OPEN",
      } as unknown,
      (data) => {
        cb(data);
        // appDispatch(getActiveTransaction());
        // appDispatch(getTransactions());
      },
      "cancel",
      {
        customError: "No Active Transaction.",
        customSuccess: "Transaction Successfully Cancelled.",
      }
    );
  };

  const onHoldTransaction = (cb: (data: any) => void) => {
    postTransactionV2(
      {
        warcde: transaction.data?.warcde,
        postypcde: transaction.data?.postypcde,
        tabletrncde: transaction.data?.tabletrncde,
      } as any,
      (data) => {
        if (data.data && data.data.isHold) {
          if (data.data.isFromRecall) {
            // resets and open the OPEN transaction
            appDispatch(getPosfiles(data.data.ordercde || ""));
            appDispatch(getActiveTransaction());
            appDispatch(getSpecialRequestDetails());
            appDispatch(getOrderDiscount());
            appDispatch(getTotal(""));
            appDispatch(getServiceCharge(""));
            appDispatch(getLessVatAdj(""));
            appDispatch(getOrderDiscount());
            appDispatch(toggle());
            return;
          }

          if (syspar.data[0].manual_dinetype !== 1) {
            appDispatch(changeName({ modalName: "Add new transaction" }));
            navigate("/pages/ordering/initialization");
            appDispatch(removeXButton(true)); // remove the X button of the modal, we only want the user to click the cancel btn if manual dinetype is disabled
          } else {
            postOrderingTran(
              {
                status: "OPEN",
                postypcde: transaction.data?.postypcde,
                warcde: transaction.data?.warcde,
                isCreateTransaction: true,
                // isCancelTransaction: false,
                // incrementOrdocnum: true
              } as any,
              (data: any) => {
                appDispatch(setTransaction(data.model_data));
                appDispatch(toggle());
                navigate("/pages/ordering");
                resetOrdering();
              }
            );
          }
        } else {
          cb(data);
          appDispatch(toggle());
        }
      },
      "hold"
    );
  };

  const onRecallTransaction = (
    cb: (data: OrderingModel) => void,
    ordercde?: string
  ) => {
    postTransactionV2(
      {} as any,
      (data) => {
        cb(data);
        appDispatch(getActiveTransaction());
        appDispatch(getTransactions());
        appDispatch(toggle());
      },
      `recall/${ordercde}`
    );
  };

  return { onCancelTransaction, onHoldTransaction, onRecallTransaction };
}

export function useDiscount() {
  const appDispatch = useAppDispatch();
  const { deleteTransaction } =
    useOrderingService<DiscountOrderModel>("orderitemdiscount");

  const onAddDiscount = async (payload: object, cb: (data: any) => void) => {
    const addedData = await appDispatch(postDiscount(payload));
    cb(addedData.payload);
  };

  const onDeleteDiscount = async (
    recid: string, // recid for orderitemdiscountfile table
    cb: (deletedPosfileItem: PosfileModel) => void,
    posfilefields: { orderitmid: string; discde: string },
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    }
    // addOnRecids?: string
  ) => {
    deleteTransaction(
      async () => {
        // cb && cb(odObject);

        // delete posfile entry
        try {
          const newPosfilefields = {
            ...posfilefields,
            discde: encodeURIComponent(posfilefields.discde),
          };
          const deletedPosfile = await appDispatch(
            deleteDiscount(newPosfilefields)
          );
          cb && cb(deletedPosfile.payload);
        } catch (error) {
          console.log(error);
        }
      },
      "deleteDetail/" + recid,
      customMessage,
      true
    );
  };

  const onDeleteAllDiscount = (
    ordercde: string,
    cb: (data: DiscountOrderModel) => void,
    customMessage?: {
      customError?: string;
      customSuccess?: string;
    },
    showToast?: boolean
  ) => {
    deleteTransaction(
      (odObject) => {
        cb && cb(odObject);
      },
      `deleteAll/${ordercde}`,
      customMessage,
      showToast
    );

    // delete posfile entry
    try {
      appDispatch(deleteAllPosfileDiscounts(ordercde));
    } catch (error) {
      console.error(error);
    }
  };

  return { onAddDiscount, onDeleteDiscount, onDeleteAllDiscount };
}

export function useOrderingButtons() {
  const {
    postTransaction,
    deleteTransaction,
    postTransactionV2,
    postBulkTransaction,
  } = useOrderingService<PosfileModel>("posfile");
  const { postData: checkRecallTran } = useService("transaction");

  const { generateOrderingReceipt } = useOrderingPrintout();
  // const {handlePrint} = useXZReading();
  const { onAddSpecialRequest } = useSpecialRequest();
  const { onAddDiscount, onDeleteAllDiscount } = useDiscount();
  const { onCancelTransaction, onHoldTransaction, onRecallTransaction } =
    useTransaction();
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const { handleReceiptPath: handleOrderReceiptPath } = useReceiptPath();
  const { modalNameDispatch } = useChangeNameModal();

  const selector = useAppSelector((state) => state);
  const { selectedOrder, transaction } = useAppSelector((state) => state.order);
  const { header, syspar, dineType } = useAppSelector(
    (state) => state.masterfile
  );
  const { account } = useAppSelector((state) => state.account);

  const { postActivity } = useUserActivityLog();
  const { handleOrderTicketCancel, handleOrderTicketVoid } =
    useOrderTicketHooks();

  const discountButton = async (
    selectedDiscount: DiscountModel,
    selectedItemPosfiles: PosfileModel[],
    customerDetails?: any
  ) => {
    const payload = {
      selectedDiscount,
      selectedItemPosfiles: selectedItemPosfiles.map((d) => d.recid),
      customerDetails,
      userDetails: {
        ordercde: transaction.data?.ordercde,
        usrcde: account.data?.usrcde,
      },
    };

    onAddDiscount(payload, async (data) => {
      appDispatch(setSelectedOrder(null));
      appDispatch(getOrderDiscount());
      appDispatch(getTotal(""));
      appDispatch(getServiceCharge(""));
      appDispatch(getPosfiles(transaction.data?.ordercde));
      appDispatch(toggle());
      appDispatch(getLessVatAdj(""));

      appDispatch(setPosfile(data.posfile));

      toast.success(`${selectedDiscount.discde}: Discount Added.`, {
        hideProgressBar: true,
        position: "top-center",
      });

      postActivity({
        method: METHODS.UPDATE,
        module: MODULES.ORDERDETAILS,
        remarks: `ADDED DISCOUNT: [ITEM ID:]\nDISCOUNT DESCRIPTION: #ADD HERE\nDISCOUNT RATE: #ADD HERE`,
      });
    });
  };

  const changeOrderType = () => {
    let posfileObject = selectedOrder?.data as PosfileModel;

    if (!posfileObject) return;

    if (selectedOrder.data?.itmqty && selectedOrder.data?.itmqty > 1) {
      navigate("/pages/ordering/changeordertype");
      appDispatch(toggle());
      appDispatch(changeName({ modalName: "Change order type" }));
    } else {
      if (selectedOrder.data?.ordertyp == "DINEIN") {
        posfileObject = { ...posfileObject, ordertyp: "TAKEOUT" };
      } else {
        posfileObject = { ...posfileObject, ordertyp: "DINEIN" };
      }

      // return;
      postTransaction(
        posfileObject,
        (data) => {
          appDispatch(getTotal(""));
          appDispatch(getServiceCharge(""));
          appDispatch(setSelectedOrder(data));
          appDispatch(getPosfiles(transaction.data?.ordercde));
        },
        "",
        {
          customError: "Failed to Changed Order Type.",
          customSuccess: "Order Type Changed.",
        }
      );
      postActivity({
        method: METHODS.UPDATE,
        module: MODULES.ORDERING,
        remarks: `ITEM CHANGED ORDER TYPE [ITEM ID: ${posfileObject.orderitmid}]:\nORDER TYPE: ${posfileObject.ordertyp}`,
      });
    }
  };

  const changeQuantity = () => {
    const posfileObject = selectedOrder?.data as PosfileModel;
    console.log(posfileObject);

    postTransaction(
      posfileObject,
      (data) => {
        appDispatch(getTotal(""));
        appDispatch(getServiceCharge(""));
        appDispatch(setSelectedOrder(data));
        appDispatch(getPosfiles(transaction.data?.ordercde));
      },
      "",
      {
        customError: "Failed To Change Quantity.",
        customSuccess: "Item Quantity Changed.",
      }
    );
  };

  const specialRequest = (specialRequestState: object) => {
    console.log(specialRequestState);
    const specialRequestValues = Object.values(specialRequestState);
    onAddSpecialRequest(
      specialRequestValues as SpecialRequestDetailModel[],
      (data) => {
        appDispatch(setSpecialRequestDetails(data));
      }
    );
  };

  const removeItem = async () => {
    if (!selectedOrder.data) return;

    appDispatch(setIsProcessingTransaction(true));

    deleteTransaction(
      (data) => {
        appDispatch(getTotal(""));
        appDispatch(getServiceCharge(""));
        appDispatch(setSelectedOrder(null));
        appDispatch(getPosfiles(transaction.data?.ordercde));
        appDispatch(getLessVatAdj(""));

        postActivity({
          method: METHODS.DELETE,
          module: MODULES.ORDERING,
          remarks: `ITEM ORDER REMOVED:\nITEM CODE: ${data.itmcde}\nORDER TYPE: ${data.ordertyp}\nQUANTITY: ${data.itmqty}`,
        });

        appDispatch(setIsProcessingTransaction(false));
      },
      selectedOrder.data?.recid,
      {
        customError: "Item Failed To Remove.",
        customSuccess: "Item Successfully Removed.",
      },
      true
    );
  };

  const freeItem = (
    freeReason: string,
    customMessage?: { customError?: string; customSuccess?: string }
  ) => {
    const freeItemTemplate = {
      ...selectedOrder.data,
      freereason: freeReason,
      groprc: 0,
      // grossprc: 0,
      groext: 0,
      extprc: 0,
      amtdis: 0,
      // untprc: 0,
      netvatamt: 0,
      vatamt: 0,
      disamt: 0,
      scharge: 0,
    };

    postTransaction(
      freeItemTemplate,
      (data) => {
        appDispatch(getTotal(""));
        appDispatch(getServiceCharge(""));
        appDispatch(setSelectedOrder(data));
        appDispatch(getPosfiles(transaction.data?.ordercde));

        appDispatch(toggle());

        postActivity({
          method: METHODS.UPDATE,
          module: MODULES.ORDERDETAILS,
          remarks: `ADDED FREE ITEM:\nITEM DESCRIPTION: #ADD HERE\nITEM PRICE: #ADD HERE`,
        });
      },
      "freeItem",
      customMessage
    );
  };

  const resetPriceOverride = (selectedRow: PosfileModel) => {
    console.log(selectedRow);
    console.log(selectedRow.itmqty, parseFloat(selectedRow.itmqty + ""));

    if (syspar.data[0].vatrte) {
      const priceOverrideTemplate = {
        ...selectedRow,
        groprc: parseFloat(selectedRow.untprc + ""),
        grossprc: parseFloat(selectedRow.untprc + ""),
        groext:
          parseFloat(selectedRow.untprc + "") *
          parseFloat(selectedRow?.itmqty + ""),
        extprc:
          parseFloat(selectedRow?.untprc + "") *
          parseFloat(selectedRow.itmqty + ""),
        vatamt:
          parseFloat(selectedRow?.untprc + "") *
          parseFloat(selectedRow.itmqty + "") *
          (1 - 1 / (1 + syspar.data[0].vatrte / 100)),
        netvatamt:
          (parseFloat(selectedRow?.untprc + "") *
            parseFloat(selectedRow.itmqty + "")) /
          (1 + syspar.data[0].vatrte / 100),
        // vatexempt:
        //   parseFloat(selectedRow?.untprc + "") *
        //   parseFloat(selectedRow.itmqty + ""),
        changed: 0,
      };

      console.log(priceOverrideTemplate);

      postTransactionV2(
        priceOverrideTemplate,
        (data) => {
          appDispatch(getTotal(""));
          appDispatch(getServiceCharge(""));
          appDispatch(setSelectedOrder(data));
          appDispatch(getPosfiles(transaction.data?.ordercde));

          postActivity({
            method: METHODS.UPDATE,
            module: MODULES.ORDERDETAILS,
            remarks: `PRICE OVERRIDEN\n:ITEM DESCRIPTION #${
              selectedOrder.data.itmdsc
            }\n ORIGINAL PRICE: ${parseFloat(selectedOrder.data.untprc).toFixed(
              2
            )}\nNEW PRICE: #${(selectedRow?.untprc || 0).toFixed(2)}`,
          });
        },
        "priceoverride",
        {
          customError: `Failed to Override Price.`,
          customSuccess: `Item Price override removed`,
        }
      );
    }
  };

  const priceOverride = (price: number) => {
    if (syspar.data[0].vatrte) {
      const priceOverrideTemplate = {
        ...selectedOrder.data,
        // freereason: "",
        groprc: price,
        grossprc: price,
        groext: price * selectedOrder.data.itmqty,
        extprc: price * selectedOrder.data.itmqty,
        vatamt:
          price *
          selectedOrder.data.itmqty *
          (1 - 1 / (1 + syspar.data[0].vatrte / 100)),
        netvatamt:
          (price * selectedOrder.data.itmqty) /
          (1 + syspar.data[0].vatrte / 100),
        // vatexempt: price * selectedOrder.data.itmqty,
        changed: 1,
      };

      postTransactionV2(
        priceOverrideTemplate,
        (data) => {
          console.log("you are my special", data);

          appDispatch(getTotal(""));
          appDispatch(getServiceCharge(""));
          appDispatch(setSelectedOrder((data as any).data));
          appDispatch(getPosfiles(transaction.data?.ordercde));

          appDispatch(toggle());

          postActivity({
            method: METHODS.UPDATE,
            module: MODULES.ORDERDETAILS,
            remarks: `PRICE OVERRIDEN\n:ITEM DESCRIPTION #${
              selectedOrder.data.itmdsc
            }\n ORIGINAL PRICE: ${parseFloat(selectedOrder.data.untprc).toFixed(
              2
            )}\nNEW PRICE: #${price.toFixed(2)}`,
          });
        },
        "priceoverride",
        {
          customError: `Failed to Override Price.`,
          customSuccess: `Price Overridden Successfully.`,
        }
      );
    }
  };

  const addOnItem = (items: ItemModel[]) => {
    const template = {
      ordercde: transaction.data?.ordercde,
      brhcde: header.data[0].brhcde ?? "",
      vatrte: syspar.data[0].vatrte,
      postrntyp: "ITEM",
      trncde: "POS",
      docnum: syspar.data[0].posdocnum,
      billdocnum: syspar.data[0].billdocnum,
      trndte: moment(new Date()).format("YYYY-MM-DD"),
      logtim: moment(new Date()).format("H:mm:ss"),
      cashier: account.data?.usrcde,
      numpax: 1,
      postrmno: header.data[0].postrmno,
      bnkcde: header.data[0].bnkcde,
    };

    const bulkObject: PosfileModel[] = [];
    const dineTypeFind = dineType.data.find(
      (d) => d.postypcde === transaction.data?.postypcde
    );

    items.forEach((item) => {
      const postObject = {
        ...template,
        itmcde: item?.itmcde,
        itmqty: 1,
        grossprc: item?.untprc || 0,
        groext: item?.untprc,
        groprc: item?.untprc,
        untprc: item?.untprc,
        extprc: item?.untprc,
        ordertyp: dineTypeFind?.ordertyp,
        memc: item?.memc,
        taxcde: item?.taxcde,
        itmpaxcount: item?.itmpaxcount,
        itmdsc: item?.itmdsc,
        isaddon: 1,
        mainitmcde: item?.itmcde,
        postypcde: transaction.data?.postypcde,
        warcde: transaction.data?.warcde,
        itmnum: item?.itmnum,
        vatamt: (item?.untprc as number) * (1 - 1 / 1.12),
        netvatamt: (item?.untprc as number) / 1.12,
        vatexempt: 0,
        orderitmid: uuidv4(),
        mainitmid: selectedOrder.data.orderitmid,
      } as PosfileModel;

      bulkObject.push(postObject);
    });

    postBulkTransaction(
      bulkObject,
      (d) => {
        console.log(d);
        appDispatch(getPosfiles(transaction.data?.ordercde));
        appDispatch(getTotal(""));
        appDispatch(getServiceCharge(""));
        appDispatch(toggle());
      },
      "",
      {
        customError: "Failed to add ADD ONS.",
        customSuccess: `Add ons Added.`,
      }
    );

    postActivity({
      method: METHODS.UPDATE,
      module: MODULES.ORDERDETAILS,
      remarks: `ADDED ADD ON ITEM:\nITEM DESCRIPTION: #ADD HERE`,
    });
  };
  const cancelTransaction = async () => {
    appDispatch(setIsProcessingTransaction(true));
    await handleOrderTicketCancel();
    // cancels and closes the takeouttranfile transaction
    onCancelTransaction(async (data: unknown) => {
      const dataRes = data as any;
      if (dataRes.data && dataRes.data && dataRes.data.isFromRecall) {
        // resets and go to the open order
        appDispatch(getPosfiles(dataRes.data.dataValues.ordercde || ""));
        appDispatch(getActiveTransaction());
        appDispatch(getTransactions());
        appDispatch(getSpecialRequestDetails());
        appDispatch(getTotal(""));
        appDispatch(getServiceCharge(""));
        appDispatch(getLessVatAdj(""));
        appDispatch(getOrderDiscount());
        appDispatch(getSysPar());
        appDispatch(setCancelTransactionModal(false));
        return;
      }
      
      const content = {
        status: "OPEN",
        postypcde: transaction.data?.postypcde,
        warcde: transaction.data?.warcde,
        isCreateTransaction: true
      };

      const response = await appDispatch(openTransaction(content));
      appDispatch(setTransaction(response.payload.model_data));

      // try to delete all discount(s) if there's any
      onDeleteAllDiscount(transaction.data?.ordercde || "", async (_) => {
        modalNameDispatch("Add new transaction");
        appDispatch(getSysPar());
        appDispatch(getSpecialRequestDetails());
        appDispatch(getTotal(""));
        appDispatch(getServiceCharge(""));
        appDispatch(getLessVatAdj(""));
        appDispatch(getActiveTransaction());

        appDispatch(setOrderDiscount([]));
        appDispatch(setPosfiles([]));
        appDispatch(setPosfile([]));
        appDispatch(setSelectedOrder(null));
        appDispatch(setActivePrinterStation(null));
        appDispatch(setCancelTransactionModal(false));

        // show the closed and holded transaction
        const changedStatus = response.payload.changed_status as {hold: string[], closed: string[]};
        const closed = changedStatus.closed;
        const holds = changedStatus.hold;
        
        for (const ordercde of closed) {
          await postActivity({
            method: METHODS.UPDATE,
            module: MODULES.ORDERDETAILS,
            remarks: `CLOSED TRANSACTION:\nTRANSACTION CODE: ${ordercde}`,
          });
        }

        if (holds.length > 0) {
          let msg = '\nThe following ordercde(s) has been hold:\n';

          for (const ordercde of holds) {
            msg += `${ordercde}\n`
            await postActivity({
              method: METHODS.UPDATE,
              module: MODULES.ORDERDETAILS,
              remarks: `HOLD TRANSACTION:\nTRANSACTION CODE: ${ordercde}`,
            });
          }

          toast.info(msg, {
            position: 'top-center',
            autoClose: 10000,
            hideProgressBar: true
          })
        }

        await postActivity({
          method: METHODS.UPDATE,
          module: MODULES.ORDERDETAILS,
          remarks: `CANCELLED TRANSACTION:\nTRANSACTION CODE: #ADD HERE`,
        });

        appDispatch(setIsProcessingTransaction(false));
      });
    });
  };

  const reprintTransaction = () => {
    postActivity({
      method: METHODS.PRINT,
      module: MODULES.ORDERDETAILS,
      remarks: `RE-PRINTED TRANSACTION:\nTRANSACTION CODE: #ADD HERE`,
    });
  };

  const { allPOSVoid } = useAppSelector((state) => state.void);
  const reprintVoid = async () => {
    const generateReceipt = async () => {
      const voidTotal = allPOSVoid.data.voidTotal;

      const base64 = await generateOrderingReceipt(
        "voidreceipt",
        voidReceiptPrintoutV2(selector, true),
        undefined,
        2
      );
      // base64 && handlePrint(11, 8.5, undefined, "pdf", base64);
      // const voidnum = syspar.data[0].voidnum!.slice(5);
      // const vNum = parseInt(voidnum) - 1;
      // const finalVoidnum = vNum.toString().padStart(16, "0");

      await handleOrderReceiptPath(
        {
          base64String: base64 as string,
          code: receiptDefiner(syspar.data[0].receipt_title||0, voidTotal.ordocnum) //finalVoidnum,
        },
        "void"
      );
    };

    await generateReceipt();

    postActivity({
      method: METHODS.PRINT,
      module: MODULES.ORDERDETAILS,
      remarks: `RE-PRINTED VOID:\nTRANSACTION CODE: #ADD HERE`,
    });
  };

  const reprintRefund = async (inv_num: string, isReprint: boolean) => {
    console.log("reprinting");
    console.log(inv_num);

    const generateReceipt = async () => {
      const base64 = await generateOrderingReceipt(
        "refundreceipt",
        refundReceiptPrintoutV2(selector, isReprint)
      );

      await handleOrderReceiptPath(
        {
          base64String: base64 as string,
          code: receiptDefiner(syspar.data[0].receipt_title||0, inv_num),
        },
        "refund",
        receiptDefiner(syspar.data[0].receipt_title||0, inv_num)
      );
    };

    await generateReceipt();

    postActivity({
      method: METHODS.PRINT,
      module: MODULES.ORDERDETAILS,
      remarks: `RE-PRINTED FUND:\nTRANSACTION CODE: #ADD HERE`,
    });
  };

  const voidTransaction = async (
    reason: string,
    selectedOr: PosfileModel | undefined
  ) => {

    const voidTotal = allPOSVoid.data.voidTotal;

    const base64 = await generateOrderingReceipt(
      "voidreceipt",
      voidReceiptPrintoutV2(selector),
      undefined,
      2
    );

    await handleOrderReceiptPath(
      {
        base64String: base64 as string,
        code: receiptDefiner(syspar.data[0].receipt_title||0, voidTotal.ordocnum),
      },
      "void"
    );
    await handleOrderTicketVoid();

    const cloneSelectedOr: PosfileModel = {
      ...selectedOr,
      voidnum: syspar.data[0].voidnum,
      void: 1,
      voidreason: reason,
    };

    const posfileObject = {
      docnum: selectedOr?.docnum,
      postrntyp: "REFUND",
      trndte: selectedOr?.trndte,
      logtim: selectedOr?.logtim,
      billdocnum: selectedOr?.billdocnum,
      itmcde: "REFUND",
      vatamt: selectedOr?.vatamt,
      netvatamt: selectedOr?.netvatamt,
      extprc: selectedOr?.extprc,
      cashier: selectedOr?.cashier,
      numpax: selectedOr?.numpax,
      ordercde: selectedOr?.ordercde,
      ordocnum: selectedOr?.ordocnum,
      voidnum: selectedOr?.voidnum,
      postrmno: selectedOr?.postrmno,
      brhcde: selectedOr?.brhcde,
      warcde: selectedOr?.warcde,
    };

    postTransactionV2(
      cloneSelectedOr,
      (data) => {
        console.log("voidTran", data);
        postTransaction(
          posfileObject,
          (data) => {
            console.log(data);
            appDispatch(getSysPar());
            appDispatch(getTotal(""));
            appDispatch(getServiceCharge(""));
            appDispatch(getPosfiles(transaction.data?.ordercde));
            appDispatch(toggle());
            // generateReceipt();
            navigate("/pages/ordering");
          },
          "",
          undefined,
          true
        );
      },
      "void",
      {
        customError: `Failed to Void Transaction.`,
        customSuccess: `Transaction Void Successful`,
      }
    );

    postActivity({
      method: METHODS.UPDATE,
      module: MODULES.ORDERDETAILS,
      remarks: `VOIDED TRANSACTION:\nOR:${selectedOr} REASON:${reason}`,
    });
  };
  const refundTransactionState = async (
    reason: string,
    refundTran: PosfileModel[],
    modeOfRefund: "CASH" | "CHECK" | "CARD" | "OTHER PAYMENT",
    supportingDetails?: any
  ) => {
    const now = moment();
    const arrObj: PosfileModel[] = [];

    refundTran.forEach((selectedOr) => {
      const extprc = selectedOr.extprc! * 1,
        groext = selectedOr.groext! * 1,
        amtdis = selectedOr.amtdis! * 1,
        scharge = selectedOr.scharge! * 1,
        scharge_disc = selectedOr.scharge_disc! * 1,
        lessvat = selectedOr.lessvat! * 1,
        vatexempt = selectedOr.vatexempt! * 1,
        itmqty = selectedOr.itmqty! * 1,
        refundqty = selectedOr.refundqty;

      const newExtPrc =
        extprc && refundqty && itmqty ? (extprc / itmqty) * refundqty : 0;

      const newGroExt =
        groext && refundqty && itmqty ? (groext / itmqty) * refundqty : 0;

      const newAmtDis =
        extprc && refundqty && itmqty ? (amtdis / itmqty) * refundqty : 0;

      const newScharge =
        scharge && refundqty && itmqty ? (scharge / itmqty) * refundqty : 0;

      const newSchargeDisc =
        scharge_disc && refundqty && itmqty
          ? (scharge_disc / itmqty) * refundqty
          : 0;

      const newLessVat =
        lessvat && refundqty && itmqty ? (lessvat / itmqty) * refundqty : 0;

      const newVatExempt =
        vatexempt && refundqty && itmqty ? (vatexempt / itmqty) * refundqty : 0;

      const posfileObject = {
        billdocnum: selectedOr?.billdocnum,
        // docnum: selectedOr?.docnum,
        postrntyp: selectedOr?.postrntyp,
        trndte: selectedOr?.trndte,
        logtim: selectedOr?.logtim,
        refunddte: now.format("YYYY-MM-DD"),
        refundlogtim: now.format("HH:mm:ss"),
        orderitmid: selectedOr?.orderitmid,
        itmcde: selectedOr?.itmcde,
        amtdis: newAmtDis === 0 ? selectedOr?.amtdis : newAmtDis,
        lessvat: newLessVat === 0 ? selectedOr?.lessvat : newLessVat,
        vatexempt: newVatExempt === 0 ? selectedOr?.vatexempt : newVatExempt,
        vatamt: selectedOr?.vatamt,
        netvatamt: selectedOr?.netvatamt,
        extprc: newExtPrc === 0 ? selectedOr.extprc : newExtPrc,
        groext: newGroExt === 0 ? selectedOr.groext : newGroExt,
        scharge: newScharge === 0 ? selectedOr?.scharge : newScharge,
        scharge_disc:
          newSchargeDisc === 0 ? selectedOr?.scharge_disc : newSchargeDisc,
        cashier: selectedOr?.cashier,
        trncde: selectedOr?.trncde,
        ordercde: selectedOr?.ordercde,
        postrmno: selectedOr?.postrmno,
        brhcde: selectedOr?.brhcde,
        refundreason: reason,
        taxcde: selectedOr?.taxcde,
        numpax: 1,
        refund: 1,
        trnstat: 1,
        ordocnum: selectedOr?.ordocnum,
        postypcde: selectedOr?.postypcde,
        untprc: selectedOr?.untprc,
        itmqty: selectedOr.refundqty, //selectedOr?.itmqty,
        itmqty2: selectedOr?.itmqty,
        refundqty: selectedOr.refundqty,
        ordertyp: selectedOr.ordertyp,
        itmdsc: selectedOr.itmdsc,
      } as PosfileModel;

      arrObj.push(posfileObject);
    });

    let inv_num = "";

    try {
      const response = await appDispatch(
        refundTransactionRedux({
          refundObj: arrObj,
          modeOfRefund,
          supportingDetails,
        })
      );

      inv_num = response.payload.findRefund.ordocnum;
      toast.success("Transaction Refunded.", {
        hideProgressBar: true,
        position: "top-center",
      });
    } catch (error) {
      toast.error("Transaction Failed to Refund.", {
        hideProgressBar: true,
        position: "top-center",
      });
      console.log(error);
    }

    // postBulkTransaction(
    //   arrObj,
    //   (data) => {
    //     console.log(data);
    //   },
    //   "refund"
    // );

    // postTransactionV2(posfileObject, (data) => {
    //   console.log(data);
    // }, "refund");

    postActivity({
      method: METHODS.UPDATE,
      module: MODULES.ORDERDETAILS,
      remarks: `REFUNDED TRANSACTION:\nTRANSACTION CODE: #ADD HERE\nAMOUNT: ADD HERE`,
    });

    return inv_num;
  };

  const holdTransaction = () => {
    onHoldTransaction((data) => {
      appDispatch(setHasTransaction(false));
      appDispatch(getPosfiles(data.data.ordercde));
      appDispatch(getTotal(""));
      appDispatch(getServiceCharge(""));
      appDispatch(getActiveTransaction());
      appDispatch(getLessVatAdj(""));
      // dispatch(toggle());
    });
  };

  const recallTransaction = (ordercde: string) => {
    onRecallTransaction((data) => {
      console.log(data);
      appDispatch(getPosfiles(ordercde));
      appDispatch(getTotal(""));
      appDispatch(getServiceCharge(""));
      appDispatch(getActiveTransaction());
      appDispatch(getLessVatAdj(""));
      appDispatch(getOrderDiscount());
      // dispatch(getTransaction());
    }, ordercde);
  };

  const otherTransaction = () => {
    postActivity({
      method: METHODS.UPDATE,
      module: MODULES.ORDERDETAILS,
      remarks: `REFUNDED TRANSACTION:\nTRANSACTION CODE: #ADD HERE\n`,
    });
  };

  return {
    discountButton,
    changeOrderType,
    changeQuantity,
    removeItem,
    specialRequest,
    otherTransaction,
    refundTransaction: refundTransactionState,
    voidTransaction,
    addOnItem,
    reprintRefund,
    reprintVoid,
    cancelTransaction,
    reprintTransaction,
    priceOverride,
    resetPriceOverride,
    freeItem,
    recallTransaction,
    holdTransaction,
  };
}

export async function priceListGenerator(
  _: WarehouseModel[],
  priceList: PricelistModel[],
  transaction: OrderingModel
) {
  const findPricelist = priceList.find(
    (prclist) => prclist.prccde === transaction?.warcde
  );

  return findPricelist;
}
