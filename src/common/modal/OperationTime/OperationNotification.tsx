import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useWebSocketContext } from "../../../WebSocketContext";
import { Modal } from "antd";
import { RadioButton } from "../../form/RadioButton";
import { Checkbox } from "../../form/Checkbox";
import { toast } from "react-toastify";
import { AuthOperationFragment } from "./AuthOperationFragment";
import { InputNumber } from "../../form/InputNumber";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  addMinutesToTime,
  isOneHourDifference,
  realTimeDifferenceInMinutes,
} from "../../../helper/Date";
import { getSysPar } from "../../../store/actions/systemParameters.action";
import { setIsEnd } from "../../../reducer/transactionSlice";

export const OperationNotification = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [open, setOpen] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [timeExtension, setTimeExtension] = useState(30);
  const [validate, setValidate] = useState(false);
  const { syspar } = useAppSelector((state) => state.masterfile);
  const dispatch = useAppDispatch();

  const fetchSyspar = useCallback(() => {
    dispatch(getSysPar());
  }, [syspar]);

  const currentTimeEnd = useMemo(
    () =>
      syspar.data[0]?.isextended == 1
        ? syspar.data[0]?.timeextension || ""
        : syspar.data[0]?.timeend || "",
    [syspar]
  );

  useEffect(() => {
    console.log("ha??");
    fetchSyspar();
  }, []);

  useEffect(() => {
    if (lastJsonMessage?.isEnd) {
      dispatch(setIsEnd(lastJsonMessage.isEnd));
    }

    if (lastJsonMessage?.operationNotif) {
      console.log(lastJsonMessage);
      setOpen(true);
    }
    if (lastJsonMessage?.code == 200) {
      toast.success("Successfully updated!", {
        hideProgressBar: true,
        position: "top-center",
        autoClose: 1500,
      });
      handleClose();
    }
    if (lastJsonMessage?.code == 400) {
      toast.error(lastJsonMessage.message, {
        hideProgressBar: true,
        position: "top-center",
        autoClose: 1500,
      });
    }
  }, [lastJsonMessage]);

  const onSelect = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
    setIsCheck(checked);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    console.log(value);
    setTimeExtension(parseInt(value));
  };

  const extendTime = () => {
    sendJsonMessage({
      type: "Notification",
      payload: {
        type: "Extension",
        isExtended: 1,
        timeExtension: timeExtension,
      },
    });

    console.log(timeExtension);
  };

  const handleInputArrowClick = (_: string, type: "up" | "down") => {
    setTimeExtension((prev: number) =>
      type == "up" ? prev + 30 : prev - 30 < 0 ? 0 : prev - 30
    );
  };

  return (
    <>
      <Modal
        okButtonProps={{ style: { backgroundColor: "green" } }}
        title="Do you wish to extend your closing time?"
        open={open}
        onOk={async () => {
          const currentEndTimeExtension = addMinutesToTime(
            currentTimeEnd as string,
            timeExtension
          );

          const diff =
            realTimeDifferenceInMinutes(
              syspar.data[0]?.timestart || "",
              currentEndTimeExtension
            ) - 60;

          console.log(
            "mid diff",
            diff,
            currentEndTimeExtension,
            syspar.data[0]?.timestart
          );

          if (
            isOneHourDifference(
              syspar.data[0]?.timestart || "",
              currentEndTimeExtension
            ) ||
            diff < 0
          ) {
            toast.error("Failed. You will exceed to 23 hours.", {
              hideProgressBar: true,
              position: "top-center",
              autoClose: 1500,
            });
            return;
          }
          setValidate(true);
        }}
        onCancel={async () => {
          // cancelExtendTime();
          // validate
          handleClose();
          setValidate(false);
        }}
        footer={validate ? null : undefined}
      >
        {validate ? (
          <div className="flex justify-center items-center">
            <AuthOperationFragment
              onAuthorized={function (): void {
                extendTime();
                handleClose();
              }}
            />
          </div>
        ) : (
          <>
            <div
              className={
                isCheck
                  ? "bg-[#cfcfcf] pointer-events-none select-none"
                  : "bg-[#FFFFFF] pointer-events-auto select-auto"
              }
            >
              <RadioButton
                name={"timeextension"}
                id={"timeextension"}
                radioDatas={[
                  { name: "30 minutes", id: "30mins", value: 30 },
                  { name: "1 Hour", id: "1hr", value: 60 },
                  { name: "1 Hour and 30 minutes", id: "1hr30mins", value: 90 },
                  { name: "2 Hours", id: "1hr", value: 120 },
                ]}
                value={timeExtension}
                description={"Time extension"}
                handleInputChange={handleInputChange}
                // disabled={
                //   props.originalGovDiscHolder === 1 && props.singleData?.recid ? true : false
                // }
              />
            </div>

            <Checkbox
              checked={isCheck}
              id={""}
              name={""}
              description={"Dynamic time extension"}
              handleInputChange={onSelect}
            />

            <div
              className={
                !isCheck
                  ? "bg-[#cfcfcf] pointer-events-none select-none"
                  : "bg-[#FFFFFF] pointer-events-auto select-auto"
              }
            >
              <InputNumber
                inputWidth={80}
                handleInputChange={handleInputChange}
                name={""}
                value={timeExtension}
                id={""}
                description={"Other time extension *"}
                trailingText="minutes"
                onArrowClick={handleInputArrowClick}
                showArrow
                // error={errors}
                required
              />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};
