import Search from "../../../common/search/Search";
import { OrderingButtons } from "./common/buttons/OrderingButtons";
import { OrderScreen } from "./OrderScreen";
import OrderingTable from "./OrderingTable";
import { ItemWidget } from "./common/widgets/ItemWidget";
import { useOrdering, useOrderingButtons } from "./hooks/orderingHooks";
import React, { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Modal } from "../../../common/modal/Modal";
import { Outlet, useNavigate } from "react-router";
import {
  setActivePrinterStation,
  setHasTransaction,
  setSelectedOrder,
} from "../../../reducer/orderingSlice";
import { resetLoading } from "../../../reducer/transactionSlice";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { useOrderingModal } from "./hooks/orderingModalHooks";
import { useChangeNameModal, useModal } from "../../../hooks/modalHooks";
import {
  toggle,
  handleCurrentModal,
  toggleFullScreen,
} from "../../../reducer/modalSlice";
import { useUserAccessHook } from "../../../hooks/userAccessHook";
import { toast } from "react-toastify";
import { ItemClassWidgetV2 } from "./common/widgets/itemclasswidgetv2/ItemClassWidgetV2";

import OrderTicket from "./receipt/OrderTicket";
import OrderTicketBySubClass from "./receipt/OrderTicketBySubClass";
import {
  getDiscount,
  getOrderDiscount,
} from "../../../store/actions/discount.action";
import { getItemCombo } from "../../../store/actions/items.action";
import {
  getTotal,
  getServiceCharge,
  getLessVatAdj,
  getPosfiles,
} from "../../../store/actions/posfile.action";
import {
  getSpecialRequest,
  getSpecialRequestDetails,
} from "../../../store/actions/specialRequest.action";
import {
  getActiveTransaction,
  savePaxTran,
} from "../../../store/actions/transaction.action";
import { useTheme } from "../../../hooks/theme";
import {
  getSysPar,
  getSysparOrdocnum,
} from "../../../store/actions/systemParameters.action";
import {
  getFreeReason,
  getVoidReason,
} from "../../../store/actions/reason.action";
import { getPrinterStations } from "../../../store/actions/printerStation.action";
import { getItemClassifications } from "../../../store/actions/itemClassification.action";
import { getDineType } from "../../../store/actions/dineType.action";
import { getItemSubclassifications } from "../../../store/actions/itemSubclassification.action";
import { getCardType } from "../../../store/actions/cardType.action";
import { getMallFields } from "../../../store/actions/mallhookup.action";
import { getPriceList } from "../../../store/actions/pricelist.action";
import { PortalLoading } from "../../../common/modal/Loading";
import { HomeFilled } from "@ant-design/icons";

export function Ordering() {
  const { ButtonStyled, ButtonTextStyled, theme } = useTheme();

  const {
    masterfile,
    order,
    onClickActiveItem,
    onClickActiveSubclass,
    onAddTransaction,
    activeItem,
    activeSubclass,
    hasSelectItem,
    hasDiscount,
    isPriceOveridden,
    isFreeItem,
    onSearch,
    setIsSearching,
    isSearching,
    searchedItems,
    onSearchEmpty,
  } = useOrdering();

  console.log('xxxACTIVE', activeItem);
  

  const {
    confirmationModal,
    authModal,
    paymentModal,
    specialRequestModal,
    changeQuantityModal,
    changeOrderTypeModal,
    discountModal,
    freeItemModal,
    priceOverrideModal,
    voidTransactionModal,
    reprintVoidModal,
    addOnModal,
    reprintTransactionModal,
    otherTransactionModal,
    reprintRefundModal,
  } = useOrderingModal();

  const {
    warehouse,
    dineType,
    syspar,
    itemCombo,
    priceList,
    itemClassification,
  } = masterfile;
  const { transaction, posfiles, posfileTOTAL: posfile, selectedOrder, hasTransaction } = order;
  const manualDinetype = syspar.data[0].manual_dinetype;
  const enableRefund = syspar.data[0].enablerefund;
  const isDisableDInTOut = syspar.data[0].no_dineout;

  const { useraccessfiles, isRootUser, orderingAccessMenfields } =
    useUserAccessHook();
  // auths
  const authRemoveItem = syspar.data[0].auth_itm_remove;
  // const authCancelTransaction = syspar.data[0].auth_cancel_tran;
  const authVoidTransaction = syspar.data[0].auth_void_tran;
  const authReprintTransaction = syspar.data[0].auth_reprint_tran;
  const authReprintVoidTransaction = syspar.data[0].auth_reprintvoid_tran;
  const authPriceOverride = syspar.data[0].auth_prc_change;
  const authFreeItem = syspar.data[0].auth_free_itm;
  const authDiscount = syspar.data[0].auth_add_disc;
  // const authZReadReport = syspar.data[0].auth_report;

  const { orderDiscount } = useAppSelector((state) => state.order);
  // useAppSelector((state) => state.otherTransaction);

  const { removeItem /*cancelTransaction*/ } = useOrderingButtons();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { modalNameDispatch } = useChangeNameModal();
  const { modal, enableBackButton } = useModal();

  const itemWidgetContainer = useRef<HTMLDivElement>(null);
  const prevPaxCount = useRef(transaction?.data?.paxcount || 1); // use to check if pax count has changed or not
  const [pax, setPax] = useState<{
    paxcount: number;
    recid: string;
    tabletrncde: string;
  }>({
    paxcount: transaction?.data?.paxcount || 1,
    recid: "",
    tabletrncde: "",
  });

  const [onSearchMode, setOnSearchMode] = useState(false);
  const [isModalSelectWarehouse, setIsModalSelectWarehouse] = useState(false);
  const [itemTableContainerHeight, setItemTableContainerHeight] =
    useState("67vh");
  const [searchKeyReset, setSearchKeyReset] = useState(new Date().getTime()); // used to reset/remount the search component

  isModalSelectWarehouse && console.log("test");

  useEffect(() => {
    dispatch(resetLoading());
    dispatch(getPriceList());
    dispatch(getSpecialRequestDetails());
    dispatch(getDiscount());
    dispatch(getSpecialRequest());
    dispatch(getFreeReason());
    dispatch(getVoidReason());
    dispatch(getPrinterStations());
    dispatch(getItemClassifications());
    dispatch(getItemSubclassifications());
    dispatch(getDineType());
    dispatch(getCardType());
    dispatch(getMallFields(syspar.data[0].active_mall || -1));

    dispatch(getTotal(""));
    dispatch(getSysparOrdocnum());
    dispatch(getServiceCharge(""));
    dispatch(getLessVatAdj(""));
    dispatch(getPosfiles(transaction.data?.ordercde));
    dispatch(getOrderDiscount());
    dispatch(getItemCombo());
    dispatch(getSysPar());
    dispatch(toggleFullScreen(false));

    if (transaction.data?.status === 'RECALL') {
      dispatch(setHasTransaction(true));
    }
    else {
      dispatch(setHasTransaction(false));
    }

    const handleResize = () => {
      const newScreenHeight = window.innerHeight;
      const newItemTableContainerHeight =
        newScreenHeight < 600 ? "62vh" : "67vh";

      setItemTableContainerHeight(newItemTableContainerHeight);
    };
    handleResize();

    // COMMENTED: Obsolete due to we are now getting the pricelist every time this page mounts.
    // if (priceList.data.length === 0) {
    //   navigate("/pages/home");
    // }

    // returns to home page if it isn't able to find the transaction to avoid impending errors
    if (
      priceList.data.length > 0 &&
      !priceList.data.find(
        (item: any) => item.prccde == transaction.data?.warcde
      )?.prcdsc
    ) {
      toast.error("Unable to proceed to ordering. Please try again.", {
        hideProgressBar: true,
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/pages/home");
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [transaction]);

  useEffect(() => {
    if (posfiles.data.length === 0) {
      dispatch(setActivePrinterStation(null));
      onSearchEmpty();
    }

    if (posfiles.data.length > 0 && !hasTransaction) {
      dispatch(setHasTransaction(true));
    }
    if (onSearchMode) {
      setSearchKeyReset(new Date().getTime());
      onSearchEmpty();
      setOnSearchMode(false);
    }

    // if (!posfiles.activePrinterStation) {
    // getActivePrinterStation();
    // }
  }, [posfiles]);

  useEffect(() => {
    setPax({
      recid: "",
      tabletrncde: "",
      paxcount: transaction.data?.paxcount || 1,
    });
  }, [transaction]);

  useEffect(() => {
    if (!modal) {
      setIsModalSelectWarehouse(false);
    }
  }, [modal]);

  // const getActivePrinterStation = async () => {
  //   if (posfiles.data.length > 0) {

  //     let hasActivePrinterStation = false;
  //     const locationcde = getOrderTicketLocationCodes(
  //       posfiles.data,
  //       syspar.data[0].itemclass_printer_station_tag as unknown as number,
  //       syspar.data[0].itemsubclass_printer_station_tag as unknown as number,
  //       itemClassification.data,
  //       itemSubclassification.data,
  //     );

  //     if (locationcde) {
  //       hasActivePrinterStation = true;
  //       dispatch(setActivePrinterStation(locationcde));
  //     }

  //     if (!hasActivePrinterStation) {
  //       dispatch(setActivePrinterStation(null));
  //     }
  //   }
  // }

  const onSearching = (isSearching: boolean) => setIsSearching(isSearching);

  const onChangeDineType = () => {
    navigate("/pages/ordering/initialization");
    dispatch(toggle());
    modalNameDispatch("Add new transaction");
    setIsModalSelectWarehouse(true);
  };

  const changePax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setPax((prev) => ({
      ...prev,
      [name]: parseInt(value) < 1 ? "1" : value,
    }));
  };

  const handleKeyPressPAX = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      await savePax();
    }
  };

  const onBlurPAX = async ({ target }: React.FocusEvent<HTMLInputElement>) => {
    const { value } = target;

    if (value == "") {
      setPax((prev) => ({
        ...prev,
        paxcount: transaction.data?.paxcount || 1,
      }));
    }

    await savePax();
  };

  const savePax = async () => {
    // don't update if there's no changes in pxa count
    if (pax.paxcount === prevPaxCount.current) return;
    prevPaxCount.current = pax.paxcount;

    if (orderDiscount.data.length > 0) {
      toast.error("Remove the discount first", {
        hideProgressBar: true,
        position: "top-center",
      });
      setPax((prev) => ({
        ...prev,
        paxcount: transaction.data?.paxcount || 1,
      }));
      return;
    }

    const data = {
      ...pax,
      recid: transaction.data?.recid,
      tabletrncde: transaction.data?.tabletrncde,
    };

    await dispatch(savePaxTran(data));
    toast.success("Pax updated", {
      toastId: "pax update",
      position: "top-center",
      hideProgressBar: true,
    });
    dispatch(getOrderDiscount());
    dispatch(getActiveTransaction());
  };

  const checkOrderingBtnsMenfield = (menfield: any) => {
    // console.log("xxx", menfield);

    for (const allowfield in menfield) {
      if (allowfield.includes("allow")) {
        if (menfield[allowfield] === 1) {
          return true;
        }
      }
    }

    return undefined;

    // switch (menfield.menfield) {
    //   case "cashiering_removeitem":
    //     return menfield.allowdelete === 0 ? undefined : true;
    //   case "cashiering_adddiscount":
    //     return menfield.allowadd === 0 ? undefined : true;
    //   case "cashiering_freeitem":
    //     return menfield.allowadd === 0 ? undefined : true;
    //   case "cashiering_priceoverride":
    //     return menfield.allowedit === 0 ? undefined : true;
    //   case "cashiering_canceltransaction":
    //     return menfield.allowdelete === 0 ? undefined : true;
    //   case "cashiering_reprinttransaction":
    //     return menfield.allowprint === 0 ? undefined : true;
    //   case "cashiering_reprintvoid":
    //     return menfield.allowprint === 0 ? undefined : true;
    //   case "cashiering_voidtran":
    //     return menfield.allowdelete === 0 ? undefined : true;
    //   default:
    //     console.log("Default case");
    //     break;
    // }
  };

  const hasAccessOnButtons = (menfield: string) => {
    const menfieldIndicator = useraccessfiles
      .filter((file: any) => file.menfield.startsWith("cashiering"))
      .find((a: any) => {
        return a.menfield === menfield;
      });

    return isRootUser() || checkOrderingBtnsMenfield(menfieldIndicator);
  };
  const {cancelTransactionModal} = useAppSelector(state => state.modal);

  return (
    <>
    
      {cancelTransactionModal && <PortalLoading />}
      {/* <PortalLoading /> */}
      <Modal
        title={"Select Type"}
        isActivated={true}
        maxHeight={500}
        // width={1000}
        onClose={() => {
          dispatch(toggleFullScreen(false));
          enableBackButton(false);
        }}
        onBackBtnClick={(modalName) => {
          if (modalName === "Search OR/INV") {
            enableBackButton(false);
            modalNameDispatch(syspar.data[0].refnum);
          } else if (modalName.includes("OR") || modalName.includes("INV")) {
            modalNameDispatch("Search OR/INV");
          }
        }}
      >
        <Outlet></Outlet>
      </Modal>

      <div className="top-0 right-0  fixed -z-20 opacity-[1] bg-white">
        <OrderTicket />
      </div>

      <div className="top-[0%] left-[30%] fixed -z-20 opacity-[1] bg-white">
        <OrderTicketBySubClass />
      </div>

      <section className="h-full w-screen bg-slate-100">
        <div className="flex flex-col h-screen w-screen items-center">
          <div className="flex justify-between items-center bg-white rounded-lg p-5 mt-5 w-[98%] shadow">
            <div className="flex justify-center items-center">
              {!hasTransaction && (
                <ButtonStyled
                  $color={theme.primarycolor}
                  className="p-2 px-3 rounded-full"
                  onClick={() => {
                    dispatch(setSelectedOrder(null));
                    navigate("/pages/home");
                  }}
                >
                  <HomeFilled/>
                </ButtonStyled>
                // <BackButton
                //   onClick={() => {
                //     dispatch(setSelectedOrder(null));
                //   }}
                //   navigateTo={"/pages/home"}
                // />
              )}
              <h1 className=" font-montserrat text-[1rem] font-extrabold">
                {/* <button
                  onClick={() => {
                    console.log(orderDiscount);
                    console.log(checkRecall);
                  }}
                ></button> */}
                {!hasTransaction
                    ? (
                      <></>
                    )
                    : <span>TRANSACTION: {transaction.data?.tabletrncde}</span> }
              </h1>
            </div>

            {manualDinetype === 1 && posfiles.data.length < 1 ? (
              <ButtonStyled
                $color={theme.primarycolor}
                className={`font-montserrat text-[1rem] font-extrabold ${
                  manualDinetype === 1 &&
                  posfiles.data.length < 1 &&
                  "border-2 rounded-md hover:text-black hover:cursor-pointer hover:bg-slate-500 shadow-xl"
                }`}
                {...(manualDinetype === 1 &&
                  posfiles.data.length < 1 && { onClick: onChangeDineType })}
              >
                <ButtonTextStyled $color={theme.primarycolor} className="p-2">
                  Type :{" "}
                  {
                    dineType.data.find(
                      (item: any) =>
                        item.postypcde == transaction.data?.postypcde
                    )?.postypdsc
                  }{" "}
                  | Pricelist :{" "}
                  {
                    priceList.data.find(
                      (item: any) => item.prccde == transaction.data?.warcde
                    )?.prcdsc
                  }
                </ButtonTextStyled>
              </ButtonStyled>
            ) : (
              <p className="font-montserrat font-bold">
                Type :{" "}
                {
                  dineType.data.find(
                    (item: any) => item.postypcde == transaction.data?.postypcde
                  )?.postypdsc
                }{" "}
                | Pricelist :{" "}
                {
                  priceList.data.find(
                    (item: any) => item.prccde == transaction.data?.warcde
                  )?.prcdsc
                }
              </p>
            )}
          </div>

          <div className="relative grid grid-rows-1 grid-flow-col gap-5 h-[68vh] w-full  sm:px-2 lg:px-5">
            <div className="flex flex-col mt-5 h-[94%] w-[56vw] gap-2">
              <div className="flex rounded-lg shadow bg-white p-3 justify-between">
                <div
                  className=" w-[30vw]"
                  onClick={() => console.log(transaction, warehouse)}
                >
                  <Search
                    key={searchKeyReset}
                    onSearchMode={setOnSearchMode}
                    onSearchClick={onSearch}
                    onEmpty={onSearchEmpty}
                    isSearching={onSearching}
                    primaryColor={theme.primarycolor}
                  />
                </div>
                <div className=" w-[70%] my-auto flex">
                  <label htmlFor="" className="mr-3">
                    PAX
                  </label>
                  <input
                    type="number"
                    className="w-[100%] border-b-blue-900"
                    name="paxcount"
                    onChange={changePax}
                    onKeyUp={handleKeyPressPAX}
                    onBlur={onBlurPAX}
                    value={pax.paxcount}
                    disabled={
                      dineType.data.find(
                        (item: any) =>
                          item.postypcde == transaction.data?.postypcde
                      )?.ordertyp == "DINEIN"
                        ? false
                        : true
                    }
                  />
                </div>
              </div>

              <div className="bg-white p-2   h-auto  rounded-lg shadow overflow-hidden  ">
                <ItemClassWidgetV2
                  data={itemClassification}
                  type="itemclass"
                  itmclacde={activeSubclass?.itmclacde}
                  searched={searchedItems}
                  onClick={onClickActiveSubclass}
                  descriptionKey={"itmcladsc"}
                  isSearching={isSearching}
                  activePrinterStation={posfiles.activePrinterStation || ""}
                />
              </div>

              <div className=" bg-white p-2  justify-between h-auto  rounded-lg shadow overflow-hidden h-[68px]">
                <ItemClassWidgetV2
                  // data={{
                  //   data: activeSubclass,
                  // }}
                  itmclacde={activeSubclass?.itmclacde}
                  itmsubclacde={activeItem?.itmsubclacde}
                  searched={searchedItems}
                  onClick={onClickActiveItem}
                  descriptionKey={"itemsubclassdsc"}
                  type="itemsubclass"
                  activePrinterStation={posfiles.activePrinterStation || ""}
                />
              </div>

              <div
                ref={itemWidgetContainer}
                className="bg-white p-3  h-[94%] rounded-lg shadow flex-wrap overflow-y-scroll"
              >
                <ItemWidget
                  // data={{
                  //   data: activeItem,
                  // }}
                  container={itemWidgetContainer}
                  itmsubclacde={activeItem?.itmsubclacde}
                  prccde={activeItem?.prccde}
                  searchedTerm={searchedItems?.searchedTerm[0]}
                  onClick={onAddTransaction}
                  descriptionName={"itmdsc"}
                  itemCombo={itemCombo}
                />
              </div>
            </div>

            <div
              className={`flex flex-col h-[92%] w-[40vw]  max-h-[${itemTableContainerHeight}] bg-white rounded-lg mt-5 shadow sm:w-[38vw] lg:w-[40vw]  `}
            >
              <OrderScreen />
              <OrderingTable />
            </div>
          </div>

          <div className="flex justify-between items-center bg-white rounded-lg p-2 mb-5 w-[98%] h-[20vh] max-h-[15vh] min-h-[15vh] shadow">
            <div className="grid grid-rows-1 grid-flow-col w-full h-full overflow-x-auto">
              {hasAccessOnButtons(orderingAccessMenfields.removeitem) && (
                <OrderingButtons
                  onClick={() => {
                    if (hasSelectItem() && !hasDiscount()) {
                      if (authRemoveItem === 0) {
                        authModal();
                        dispatch(handleCurrentModal("Remove Item"));
                      } else {
                        removeItem();
                      }
                    }
                  }}
                  description={"Remove Item"}
                  color="danger"
                />
              )}

              <OrderingButtons
                onClick={() => {
                  if (
                    hasSelectItem() &&
                    !hasDiscount() &&
                    !isFreeItem() &&
                    !isPriceOveridden()
                  ) {
                    changeQuantityModal();
                  }
                }}
                description={"Change Quantity"}
              />
              {isDisableDInTOut === 0 && (
                <OrderingButtons
                  onClick={() => changeOrderTypeModal()}
                  description={"Change Order Type"}
                />
              )}
              <OrderingButtons
                onClick={() => specialRequestModal()}
                description={"Special Request"}
              />
              {hasAccessOnButtons(orderingAccessMenfields.adddiscount) && (
                <OrderingButtons
                  onClick={() => {
                    if (isFreeItem()) return;

                    if (authDiscount === 0) {
                      authModal();
                      dispatch(handleCurrentModal("Discounting"));
                    } else {
                      discountModal();
                    }
                  }}
                  description={"Add Discount"}
                />
              )}
              {hasAccessOnButtons(orderingAccessMenfields.freeitem) && (
                <OrderingButtons
                  onClick={() => {
                    if (
                      hasSelectItem() &&
                      !hasDiscount() &&
                      !isPriceOveridden()
                    ) {
                      if (selectedOrder.data.extprc == 0) {
                        toast.error("Item is already zero value.", {
                          hideProgressBar: true,
                          position: "top-center",
                          autoClose: 1000,
                        });
                      } else {
                        if (authFreeItem === 0) {
                          authModal();
                          dispatch(handleCurrentModal("Free Item"));
                          return;
                        }

                        freeItemModal();
                      }
                    }
                  }}
                  description={"Free Item"}
                />
              )}
              {hasAccessOnButtons(orderingAccessMenfields.priceoverride) && (
                <OrderingButtons
                  onClick={() => {
                    console.log("xxx", selectedOrder.data);

                    if (
                      selectedOrder.data &&
                      selectedOrder.data.changed === 1
                    ) {
                      toast.error("Item price is already overridden.", {
                        hideProgressBar: true,
                        position: "top-center",
                        autoClose: 1000,
                      });
                    } else {
                      if (hasSelectItem() && !hasDiscount() && !isFreeItem()) {
                        if (authPriceOverride === 0) {
                          authModal();
                          dispatch(handleCurrentModal("Price Override"));
                        } else {
                          priceOverrideModal();
                        }
                      }
                    }
                  }}
                  description={"Price Override"}
                />
              )}
              <OrderingButtons
                onClick={() => {
                  if (isFreeItem() || isPriceOveridden()) return;

                  addOnModal();
                }}
                description={"Add On Item"}
              />
              {hasAccessOnButtons(
                orderingAccessMenfields.canceltransaction
              ) && (
                <OrderingButtons
                  onClick={() => confirmationModal()}
                  description={"Cancel Transaction"}
                  color="danger"
                />
              )}
              {hasAccessOnButtons(
                orderingAccessMenfields.reprinttransaction
              ) && (
                <OrderingButtons
                  onClick={() => {
                    if (authReprintTransaction === 0) {
                      authModal();
                      dispatch(handleCurrentModal("Reprint Transaction"));
                    } else {
                      reprintTransactionModal();
                    }
                  }}
                  description={"Reprint Transaction"}
                />
              )}
              {hasAccessOnButtons(orderingAccessMenfields.reprintvoid) && (
                <OrderingButtons
                  onClick={() => {
                    if (authReprintVoidTransaction === 0) {
                      authModal();
                      dispatch(handleCurrentModal("Reprint Void Transaction"));
                    } else {
                      reprintVoidModal();
                    }
                  }}
                  description={"Reprint Void"}
                />
              )}
              {enableRefund === 1 && (
                <OrderingButtons
                  onClick={() => reprintRefundModal()}
                  description={"Reprint Refund"}
                />
              )}

              <OrderingButtons
                onClick={() => {
                  console.log(posfile.data?.groext);
                  if (!posfile.data?.groext) {
                    toast.error("Add Item First.", {
                      hideProgressBar: true,
                      position: "top-center",
                      autoClose: 1000,
                    });
                  } else {
                    paymentModal();
                  }
                }}
                description={"Payment"}
              />
              {hasAccessOnButtons(orderingAccessMenfields.voidtran) && (
                <OrderingButtons
                  onClick={() => {
                    if (authVoidTransaction === 0) {
                      authModal();
                      dispatch(handleCurrentModal("Void Transaction"));
                    } else {
                      voidTransactionModal();
                    }
                  }}
                  description={"Void Transaction"}
                  color="orange"
                />
              )}
              {enableRefund === 1 && (
                <OrderingButtons
                  onClick={() => {
                    authModal();
                    dispatch(handleCurrentModal("Refund Transaction"));
                    // refundTransactionModal();
                  }}
                  description={"Refund Transaction"}
                  color="orange"
                />
              )}
              <OrderingButtons
                onClick={() => otherTransactionModal()}
                description={"Other Transaction"}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
