import {useChangeNameModal, useModal} from "../../../../../hooks/modalHooks";
import {useAppDispatch} from "../../../../../store/store";
import {handleCashieringType} from "../../../../../reducer/transactionSlice";
import { CustomModal } from "../../../../../common/modal/CustomModal";
import { useState } from "react";
import { useService } from "../../../../../hooks/serviceHooks";
import { toast } from "react-toastify";
import { OrderingModel } from "../../../ordering/model/OrderingModel";
import { usePrinterCommands } from "../../../../../enums/printerCommandEnums";
import { openDrawer } from "../../../../../hooks/cashieringHooks";
import { useTheme } from "../../../../../hooks/theme";

interface CashieringCardProps {
  index: number;
  name: string;
  isPage: boolean;
  disabled?: boolean | true;
  color?: string;
}

export function CashieringCard(props: CashieringCardProps) {

  const { ButtonStyled, DisabledButtonStyled, theme } = useTheme();

  const { getData, postData, query } = useService("transaction");

  const {dispatch} = useModal();
  const appDispatch = useAppDispatch();
  const {modalNameDispatch} = useChangeNameModal();

  const {openCashDrawer, encode} = usePrinterCommands();

  const [showOnHoldOrder, setShowOnHoldOrder] = useState<OrderingModel[]>([]);

  const onclick = async () => {
    if (props.disabled) return;
    console.log(props);
    console.log("test");

    // check if there's onhold order, cannot cash declare if there's a hold order.
    if (props.name === "Cash Declaration") {
      await getData(
        `active/${query({
          status: "HOLD",
        })}`,
        (model: any, err) => {
          if (err) {
            toast.error("Something went wrong.", {
              autoClose: 2000,
              position: 'top-center',
              hideProgressBar: true,
            });
            return;
          }

        const onHoldOrders = model.data as OrderingModel[];

        if (err) {
          toast.error("Something went wrong.", {
            autoClose: 2000,
            position: 'top-center',
            hideProgressBar: true
          })
          return;
        }

        openCashDrawer();
        openDrawer(encode());

        if (onHoldOrders.length > 0) {
          setShowOnHoldOrder(onHoldOrders);
        }
      });
    }

    appDispatch(handleCashieringType(props.name.toUpperCase()));
    modalNameDispatch(props.name);
    if (!props.isPage) {
      dispatch();
    }
  };

  const cancelOnHoldOrders = () => {
    postData("cancel-onhold", "", (data: any, err) => {
      if (err) {
        toast.error("Something went wrong.", {
          autoClose: 2000,
          position: 'top-center',
          hideProgressBar: true
        });
        return;
      }

      if (data.data.status) {
        toast.success("On-hold orders cancelled.", {
          autoClose: 2000,
          position: 'top-center',
          hideProgressBar: true
        });
      }

      dispatch();
    });
  }

  const isPrevDayOnHold = (opentime: string) => {
    const a = new Date(opentime);
    const b = new Date();

    return b.getDate() - a.getDate() !== 0;
  }

  return (
    <>
      {showOnHoldOrder.length > 0 && props.name === "Cash Declaration" ? (
        <CustomModal
          modalName={""}
          maxHeight={"450"}
          height={150}
        >
          <p>You still have an on-hold order. Please complete/cancel it first.</p>
          <div className="flex flex-col justify-center">
            {isPrevDayOnHold(showOnHoldOrder[0].opentime) && (
              <div className="flex flex-col">
                <div className="my-2">
                  <span>On-hold orders:</span>
                </div>
                {showOnHoldOrder.map(d => (
                  <>
                    <div className="flex justify-between">
                      <p>{d.tabletrncde}</p>
                    </div>
                    <div className="border-[1px] border-slate-300"/>
                  </>
                ))}
              </div>
            )}

            <button
              type="button"
              className={
                "px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
              }
              onClick={() => {
                if (isPrevDayOnHold(showOnHoldOrder[0].opentime)) {
                  cancelOnHoldOrders();
                }

                setShowOnHoldOrder([]);
                dispatch();
              }}
            >
              {isPrevDayOnHold(showOnHoldOrder[0].opentime) ? "Cancel Orders" : "Okay"}
            </button>
          </div>
        </CustomModal>
      ) : (
        <div onClick={onclick} className="w-[450px]">
          {props.disabled ? (
            <DisabledButtonStyled disabled={props.disabled} className="font-montserrat w-full text-center p-8 rounded-md text-lg cursor-pointer hover:border-blue-200 shadow-md">
              <p>{props.name}</p>
            </DisabledButtonStyled>
          ) : (
            <ButtonStyled disabled={props.disabled} $color={theme.primarycolor} 
              className="font-montserrat w-full text-center p-8 rounded-md text-lg cursor-pointer shadow-md"
            >
              <p>{props.name}</p>
            </ButtonStyled>
          )}
        </div>
      )}
    </>
  );
}
