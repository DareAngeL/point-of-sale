import React from "react";
import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {InputNumber} from "../../../../../common/form/InputNumber";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {setSelectedOrder} from "../../../../../reducer/orderingSlice";
import {useOrderingButtons} from "../../hooks/orderingHooks";
import {toggle} from "../../../../../reducer/modalSlice";
import {useNavigate} from "react-router";
import {useUserActivityLog} from "../../../../../hooks/useractivitylogHooks";
import {METHODS, MODULES} from "../../../../../enums/activitylogs";
import {useModal} from "../../../../../hooks/modalHooks";
import { toast } from "react-toastify";
export function ChangeQuantity() {
  const {selectedOrder} = useAppSelector((state) => state.order);
  const dispatch = useAppDispatch();
  const {changeQuantity} = useOrderingButtons();
  const navigate = useNavigate();
  const {postActivity} = useUserActivityLog();
  const {dispatch: dispatchModal} = useModal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    dispatch(setSelectedOrder({
      ...selectedOrder.data, 
      [name]: parseInt(value) < 1 ? "1" : value
    }));
    console.log(name, value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOrder.data?.itmqty === "") {
      return toast.error("Please input quantity", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true
      });
    }

    console.log(selectedOrder);
    changeQuantity();
    dispatch(toggle());
    postActivity({
      method: METHODS.UPDATE,
      module: MODULES.ORDERING,
      remarks: `ITEM ORDER UPDATE [ITEM ID:${selectedOrder.data.orderitmid}]:\nITEM QUANTITY:${selectedOrder.data.itmqty}\n`,
    });
  };

  const cancelOnClick = () => {
    dispatch(toggle());
    dispatchModal();
    navigate(-1);
  };

  console.log(selectedOrder.data?.itmqty);

  return (
    <>
      <form id="changeQuantity" onSubmit={onSubmit}>
        <InputNumber
          handleInputChange={handleInputChange}
          name={"itmqty"}
          id={"itmqty"}
          description={"Set Quantity"}
          value={parseInt(selectedOrder.data?.itmqty)}
        />
      </form>

      <ButtonForm
        formName={"changeQuantity"}
        okBtnTxt="Change"
        onCancelBtnClick={cancelOnClick}
      />
    </>
  );
}
