import {useNavigate} from "react-router";
import {toggle} from "../../../../../reducer/modalSlice";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {useOrdering} from "../../hooks/orderingHooks";
import {InputNumber} from "../../../../../common/form/InputNumber";
import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {useState} from "react";
import {useModal} from "../../../../../hooks/modalHooks";
import {toast} from "react-toastify";
import { ApiService } from "../../../../../services";
import { setSelectedOrder } from "../../../../../reducer/orderingSlice";

export function ChangeOrderType() {
  const {
    onAddBulkTransaction,
    onDeleteTransaction,
    onChangeOrdertypeComboBulk,
  } = useOrdering();
  const {selectedOrder, transaction} = useAppSelector((state) => state.order);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {dispatch: dispatchModal} = useModal();

  const [orderType, setOrderType] = useState<{
    [index: string]: number;
    dineIn: number;
    takeOut: number;
  }>({dineIn: 0, takeOut: 0});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let {name, value} = e.target;

    if ((selectedOrder.data?.itmqty || 0) < parseInt(value)) {
      value = selectedOrder.data?.itmqty?.toString() as string;
    }

    setOrderType((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      Number(orderType.dineIn) + Number(orderType.takeOut) !==
      Number(selectedOrder.data?.itmqty)
    ) {
      toast.error(
        "Dine type quantity must be equal to selected item quantity.",
        {
          autoClose: 2500,
          hideProgressBar: true,
          position: "top-center",
        }
      );

      return;
    }

    dispatch(toggle());

    const findItem = (await ApiService.get(`item/filter/?itmcde=${selectedOrder.data?.itmcde}&page=0&pageSize=10`)).data[0];

    console.log(findItem);
    console.log(selectedOrder);

    if (selectedOrder.data?.recid) {
      console.log("test 1");

      if (selectedOrder.data.chkcombo === 1) {
        console.log("sheesh");
        const ordersQty = [];
        let isFirstItem = true;

        console.log("test 1 1");
        console.log(orderType);

        for (const key in orderType) {
          const qty = Number(orderType[key]);

          if (qty > 0) {
            const order = {
              itm: selectedOrder.data,
            };

            order.itm = {
              ...order.itm,
              ordertyp: key === "dineIn" ? "DINEIN" : "TAKEOUT",
              itmqty: qty,
            };

            ordersQty.push(order);

            if (!isFirstItem) {
              order.itm = {
                ...order.itm,
                recid: undefined,
                orderitmid: crypto.randomUUID(),
              };
            }
            isFirstItem = false;
          }
        }

        onChangeOrdertypeComboBulk(ordersQty);
      } else {
        console.log("test 2");

        onDeleteTransaction(
          selectedOrder.data?.recid,
          async () => {
            console.log("Selected Order", selectedOrder, selectedOrder.data?.warcde);
            const findItemPrice = (await ApiService.get(`/pricedetail/filter/?itmcde=${selectedOrder.data?.itmcde}&prccde=${transaction.data?.warcde}`)).data[0];

            if (findItem) {
              const ordersQty = [];

              for (const key in orderType) {
                const qty = Number(orderType[key]);

                if (qty > 0) {
                  ordersQty.push({
                    itm: findItem,
                    quantity: qty,
                    orderType: key === "dineIn" ? "DINEIN" : "TAKEOUT",
                    orderitmid: crypto.randomUUID(),
                    overridePrice: findItemPrice?.untprc,
                  });
                }
              }

              console.log("ano to pre", ordersQty);

              await onAddBulkTransaction(ordersQty, {
                customError: "Failed to Changed Order Type.",
                customSuccess: "Order Type Changed.",
              });
            }
          },
          {
            customError: "Failed to Changed Order Type.",
            customSuccess: "Order Type Changed.",
          }
        );
      }
    }

    dispatch(setSelectedOrder(null));
  };

  const cancelOnClick = () => {
    dispatch(toggle());
    dispatchModal();
    navigate(-1);
  };

  return (
    <>
      <form id="changeQuantity" onSubmit={onSubmit}>
        <InputNumber
          handleInputChange={handleInputChange}
          name={"dineIn"}
          id={"dineIn"}
          description={"Set Dine in quantity"}
          value={orderType.dineIn}
        />
        <InputNumber
          handleInputChange={handleInputChange}
          name={"takeOut"}
          id={"takeOut"}
          description={"Set Take out quantity"}
          value={orderType.takeOut}
        />

        {/* <InputText
          handleInputChange={handleInputChange}
          name={"dineIn"}
          id={"dineIn"}
          description={"Set Dine in quantity"}
          value={orderType.dineIn}
        />
        <InputText
          handleInputChange={handleInputChange}
          name={"takeOut"}
          id={"takeOut"}
          description={"Set Take out quantity"}
          value={orderType.takeOut}
        /> */}
      </form>

      <ButtonForm
        formName={"changeQuantity"}
        okBtnTxt="Change"
        onCancelBtnClick={cancelOnClick}
      />
    </>
  );
}
