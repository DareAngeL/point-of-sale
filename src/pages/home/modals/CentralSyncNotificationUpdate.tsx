import { Key } from "react";
import { useCentral } from "../../../hooks/centralHooks";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { useNavigate } from "react-router";
import { toggle } from "../../../reducer/modalSlice";
import { useAppDispatch } from "../../../store/store";
import { Spin } from "antd";
import NoCentralConnection from "../../../assets/icon/no-connection.svg?react";
import Synced from "../../../assets/icon/synced.svg?react";
import styled from "styled-components";

const StyledSynced = styled(Synced)`
  fill: #6CB83C;
  width: 150px;
  height: 150px;
`

export function CentralSyncNotificationUpdate() {
  const { content, isCentralConnected, isChecking } = useCentral();
  const navigate = useNavigate();
  const appDispatch = useAppDispatch();

  if (!isChecking && content.length === 0 && isCentralConnected.current) {
    return (
      <>
        <div className="flex flex-col justify-center items-center w-full h-[400px]">
          <StyledSynced />
          <p className="font-sans text-[13px]">Already synced to central.</p>
        </div>
      </>
    )
  }

  return (
    <>
      {!isCentralConnected.current ? (
        <div className="flex flex-col w-full h-[400px] justify-center items-center">
          <NoCentralConnection className="fill-gray-300" />
          <p className="font-sans text-[14px]">Oops! cannot established connection to central</p>
        </div>
      ) : (
        <div className="rounded bg-white shadow-lg flex flex-col">
          <div className="font-montserrat px-8 border-[#adacac] font-bold">
            <div>The following master file(s) has an update:</div>
          </div>

          <div className="max-h-[700px] min-w-[350px] max-w-[350px] my-5 px-10 font-montserrat overflow-y-auto overflow-x-hidden relative w-auto self-center">
            <ul className="flex flex-col justify-center text-[1.3rem] mb-[12px] list-disc list-inside">
              {isChecking ? (
                <Spin />
              ) : (
                content.map((value: any, index: Key) => (
                  <li key={index}>{value}</li>
                ))
              )}
            </ul>

            <div className="text-[black] text-[14px] flex flex-col">
              <span>
                {"Kindly sync them in Utilities > Sync Master File "}
                <b>(Manager's Access)</b>
              </span>
              <br /> Do you want to update your POS?
            </div>

            <ButtonForm
              formName=""
              cancelBtnTxt="No"
              onCancelBtnClick={() => {
                navigate("/pages/home");
              }}
              okBtnTxt="Yes, Go to Utilities"
              onOkBtnClick={() => {
                navigate("/pages/utilities");
                appDispatch(toggle());
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
