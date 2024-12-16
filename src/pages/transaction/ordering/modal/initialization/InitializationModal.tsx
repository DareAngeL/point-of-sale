import React, { useEffect, useState } from "react";
import { ButtonForm } from "../../../../../common/form/ButtonForm";
import { Selection } from "../../../../../common/form/Selection";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { OrderingModel } from "../../model/OrderingModel";
import {
  setOrderDiscount,
  setPosfile,
  setPosfiles,
  setSelectedOrder,
  setTransaction,
} from "../../../../../reducer/orderingSlice";
import { useOrderingService } from "../../hooks/orderingHooks";
import { toggle } from "../../../../../reducer/modalSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { setPreviousInitialization } from "../../../../../reducer/orderingSlice";
import { removeXButton } from "../../../../../reducer/modalSlice";
import { getOrderDiscount } from "../../../../../store/actions/discount.action";
import {
  getTotal,
  getServiceCharge,
  getLessVatAdj,
} from "../../../../../store/actions/posfile.action";
import { getSpecialRequestDetails } from "../../../../../store/actions/specialRequest.action";
import { getSysPar } from "../../../../../store/actions/systemParameters.action";

export function InitializationModal() {
  const { postTransaction } = useOrderingService<OrderingModel | any>(
    "transaction"
  );
  const { postTransaction: closeTransaction } =
    useOrderingService("transaction");

  const { dineType, syspar, priceList } = useAppSelector(
    (state) => state.masterfile
  );
  const manualDineType = syspar.data[0].manual_dinetype;
  const { transaction } = useAppSelector((state) => state.order);

  const [disable, setDisable] = useState(false);

  const [orderingState, setOrderingState] = useState<OrderingModel>();
  // const [filteredWarehouse, setFilteredWarehouse] =
  //   useState<WarehouseModel[]>();
  const [selectedOrderType, setSelectedOrderType] = useState<any[]>([]);
  const [selectedDineType, setSelectedDineType] = useState<string>();

  const [fieldState, setFieldState] = useState<{
    dineType: any;
    warehouse: any;
  }>();

  const resetOrdering = () => {
    dispatch(setOrderDiscount([]));
    dispatch(setSelectedOrder(null));
    dispatch(setPosfiles([]));
    dispatch(setPosfile(null));
    dispatch(getSysPar());

    dispatch(getSpecialRequestDetails());
    dispatch(getOrderDiscount());
    dispatch(getTotal(""));
    dispatch(getServiceCharge(""));
    dispatch(getLessVatAdj(""));
    dispatch(getOrderDiscount());
  };

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setOrderingState(
      (prev) =>
        ({
          ...prev,
          status: "OPEN",
          ...(transaction.data && transaction.data),
          paxcount: 1,
        } as OrderingModel)
    );
  }, []);

  const dineTypeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;
    setSelectedDineType(value);
    // const filteredW = warehouse.data.filter((item) => {
    //   const isWarehouseIncluded = item.warehousefile2s.find(
    //     (d) => d.postypcde == value
    //   );
    //   if (isWarehouseIncluded) return item;
    // });

    const filterPricelist = priceList.data.filter(
      (item) => item.postypcde === value
    );

    setSelectedOrderType(filterPricelist);

    setFieldState(
      (prev) =>
        ({
          ...prev,
          recid: undefined,
          dineType: value,
          warehouse: null,
          tabletrncde: "",
          ordercde: "",
          opentime: "",
        } as any)
    );

    // setFilteredWarehouse(filteredW);

    setOrderingState(
      (prev) =>
        ({
          ...prev,
          [name]: value,
          recid: undefined,
          warcde: "",
          tabletrncde: "",
          ordercde: "",
          opentime: "",
        } as OrderingModel)
    );

    /**
     * COMMENTED OUT
     * reason: NOT ABLE TO OPEN TRANSACTION IF MANUAL CHANGE OF DINE TYPE IS ENABLED. (manualDineType === 1)
     */
    // if (manualDineType === 0) {
    //   setOrderingState(
    //     (prev) =>
    //       ({
    //         ...prev,
    //         [name]: value,
    //         recid: undefined,
    //         warcde: "",
    //         tabletrncde: "",
    //         ordercde: "",
    //         opentime: "",
    //       } as OrderingModel)
    //   );
    // } else {
    //   setOrderingState(
    //     (prev) =>
    //       ({
    //         ...prev,
    //         [name]: value,
    //       } as OrderingModel)
    //   );
    // }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;

    // setFieldState({...fieldState, warehouse : value } && undefined)
    console.log("pinasa", value, name);

    setFieldState(
      (prev) =>
        ({
          ...prev,
          warehouse: value,
        } as any)
    );

    setOrderingState(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as OrderingModel)
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisable(true);

    if (fieldState && fieldState.dineType && fieldState.warehouse) {
      if (fieldState && fieldState?.dineType && fieldState.warehouse) {
        if (orderingState != null) {
          closeTransaction(
            {postypcde: selectedDineType, warcde: orderingState.warcde},
            (data: any) => {
              postTransaction(
                {
                  ...orderingState,
                  isCreateTransaction: data.status
                  // incrementOrdocnum: data.isIncrementOrdocnum,
                },
                onSubmitFunction,
                undefined,
                {
                  customError: "Failed to open transaction.",
                  customSuccess: "Transaction Opened Successfully.",
                }
              );
            },
            "closeTransaction",
            {
              customError: "Failed to close transaction.",
              customSuccess: "Transaction Closed Successfully.",
            },
            true
          );
        } else {
          console.log("error");
        }
      }

      return;
    }

    toast.error("Please select a pricelist", {
      hideProgressBar: true,
      position: "top-center",
      autoClose: 1500,
    });
  };

  const onSubmitFunction = (data: OrderingModel) => {
    dispatch(getSysPar());
    dispatch(removeXButton(false)); // bring back the x button of the modal component
    
    const cloneTransactionData = {
      status: data.status,
      postypcde: data.postypcde,
      warcde: data.warcde,
    };
    dispatch(
      setPreviousInitialization({
        postypcde: fieldState?.dineType,
        warcde: fieldState?.warehouse,
      })
    );

    dispatch(setTransaction(data));
    console.log("look", cloneTransactionData);
    console.log("here", orderingState);

    dispatch(toggle());
    navigate("/pages/ordering");
    resetOrdering();
  };

  const onCancel = () => {
    dispatch(removeXButton(false)); // bring back the x button of the modal component
    if (manualDineType !== 1) navigate("/pages/home");
    else navigate(-1);
  };

  return (
    <>
      <form id="initializationForm" onSubmit={onSubmit}>
        <Selection
          handleSelectChange={dineTypeSelectChange}
          description={"Filter Pricelist by Dine type"}
          id={"postypcde"}
          name={"postypcde"}
          keyValuePair={dineType.data.map((item) => {
            return { value: item.postypcde, key: item.postypdsc };
          })}
          showEmptyIndicator={!fieldState?.dineType}
          value={selectedDineType}
        />

        {/* <Selection
          handleSelectChange={handleSelectChange}
          description={"Select Warehouse"}
          value={orderingState?.warcde}
          id={"warcde"}
          name={"warcde"}
          keyValuePair={
            filteredWarehouse &&
            filteredWarehouse.map((item) => {
              return {value: item.warcde, key: item.wardsc};
            })
          }
          showEmptyIndicator={!fieldState?.warehouse}
        /> */}

        <Selection
          handleSelectChange={handleSelectChange}
          description={"Add new transaction"}
          value={orderingState?.warcde}
          // keyValuePair={priceList.data.map((price) => {
          //   return {value: price.prccde, key: price.prcdsc};
          // })}
          keyValuePair={selectedOrderType.map((price) => {
            return { value: price.prccde, key: price.prcdsc };
          })}
          id={"warcde"}
          name={"warcde"}
          showEmptyIndicator={!fieldState?.warehouse}
        />
      </form>

      <ButtonForm
        formName={"initializationForm"}
        okBtnTxt="Proceed"
        onCancelBtnClick={onCancel}
        disabled={disable}
      />
    </>
  );
}
