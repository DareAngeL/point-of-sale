/// <reference types="vite-plugin-svgr/client" />
import {
  AreaChartOutlined,
  BookOutlined,
  DesktopOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import "./Home.css";
import { HomeCard } from "./homecard/HomeCard";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from "../../common/modal/Modal";
import { changeName, toggle } from "../../reducer/modalSlice";
import { initialization } from "./hooks/homeHooks";
import { useAppSelector } from "../../store/store";
import { AuthenticationGuard } from "../../security/authentication/AuthGuards";
import { setAccount } from "../../reducer/accountSlice";
import { useVisitingTransactionChecking } from "../../hooks/transactionHook";
import { useUserActivityLog } from "../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../enums/activitylogs";
import { useEffect, useState } from "react";
import { useCentral } from "../../hooks/centralHooks";
import React from "react";
import { resetLoading } from "../../reducer/transactionSlice";
import { getRemainingZread } from "../../store/actions/posfile.action";
import { getActiveTransaction } from "../../store/actions/transaction.action";
import { useTheme } from "../../hooks/theme";
import OpenOrderIcon from "../../assets/icon/open-order.svg?react";
import AutomationErrorIcon from "../../assets/icon/automation-error.svg?react";
import CloudSyncIcon from "../../assets/icon/cloud-sync.svg?react";
import WifiConnected from "../../assets/icon/wifi-connected.svg?react";
import WifiDisconnected from "../../assets/icon/wifi-disconnected.svg?react";
import styled from "styled-components";
import { Spin } from "antd";
import { getDineType } from "../../store/actions/dineType.action";
import { getPriceList } from "../../store/actions/pricelist.action";

const StyledOpenOrderIcon = styled(OpenOrderIcon)<{ $color: string }>`
  fill: ${(props) => props.$color};
  width: 35px;
  height: 35px;
`;

const StyledCloudSyncIcon = styled(CloudSyncIcon)<{ $color: string }>`
  fill: ${(props) => props.$color};
  width: 35px;
  height: 35px;
`;

const StyledAutomationErrorIcon = styled(AutomationErrorIcon)<{
  $color: string;
}>`
  fill: ${(props) => props.$color};
  width: 35px;
  height: 35px;
`;

const StyledWifiConnected = styled(WifiConnected)<{ $color: string }>`
  fill: ${(props) => props.$color};
  width: 35px;
  height: 35px;
`;

const StyledWifiDisconnected = styled(WifiDisconnected)<{ $color: string }>`
  fill: ${(props) => props.$color};
  width: 35px;
  height: 35px;
`;

const Home = React.memo(() => {
  const { dispatch: appDispatch, initializeHome } = initialization();
  const navigate = useNavigate();
  const { theme, ButtonStyled } = useTheme();

  const { postActivity } = useUserActivityLog();
  const { transaction } = useAppSelector((state) => state.order);
  const {
    noEOD,
    isEnd,
    isLoading,
    allHoldTransactions: allOpenTransactions,
  } = useAppSelector((state) => state.transaction);
  const mallHookUp = useAppSelector((state) => state.masterfile.mallHookUp);

  const { account, useraccessfiles } = useAppSelector((state) => state.account);
  const { corrupted_autoofsales } = useAppSelector((state) => state.utility);

  // const {hasCashFund, lastTransaction} = useAppSelector(
  //   (state) => state.transaction
  // );

  const { canProceed } = useVisitingTransactionChecking();

  const {
    UnSyncMasterfiles,
    isChecking,
    hasConnectionToRemoteCentral,
    isCentralConnected,
  } = useCentral();
  // const [modalNotification, setModalNotification] = useState<boolean>(false);
  const [isCardDisable, setIsCardDisable] = useState<boolean>(true);
  // const orderingRef = useRef<HTMLDivElement>(null);

  const logOut = () => {
    if (isLoading) return;

    sessionStorage.clear();
    appDispatch(
      setAccount({ payload: null, isLoggedIn: false, isLoaded: false })
    );
    appDispatch(resetLoading());

    postActivity({
      method: METHODS.LOGOUT,
      module: MODULES.LOGOUT,
      remarks: `LOGIN:\nUSERCODE:${account.data?.usrcde}\nUSERNAME:${account.data?.usrname}`,
    });
    toast.success("Successfully Logged out", {
      hideProgressBar: true,
      position: "top-center",
      autoClose: 1500,
    });
  };

  const onToggleModal = () => {
    if (isLoading) return;

    if (!canProceed("hasRequiredHeaders")) return;

    if (noEOD.NOEOD) {
      navigate("/pages/home/noeod");
      if (mallHookUp.data?.mallname === "Robinsons") {
        // special kind daw kase si robinsons kaya iba ung name ng modal nia pag NOEOD xD
        appDispatch(
          changeName({ modalName: "Previous day's EOD was not performed" })
        );
      } else {
        appDispatch(changeName({ modalName: "No transaction EOD" }));
      }
      appDispatch(toggle());
      return;
    }

    if (!canProceed("remainingZRead") || !canProceed("isEndTime")) {
      console.log(
        canProceed("isEndTime"),
        canProceed("remainingZRead"),
        "HELLO BITCH"
      );
      toast.error("Perform Z-Reading first", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });

      if (mallHookUp.data?.mallname === "Robinsons") {
        appDispatch(
          changeName({ modalName: "Previous day's EOD was not performed" })
        );
      } else {
        appDispatch(changeName({ modalName: "ZReading" }));
      }

      navigate("/pages/home/iszread");
      appDispatch(toggle());
      return;
    }
    // if (!canProceed("terminalno")) return;
    if (!canProceed("lastTransaction")) return;
    if (!canProceed("hasCashFund")) return;

    // CONDITION IF IT IS GOING TO OPEN MODAL OR GO TO THE CASHIER ORDERING DIRECTLY
    if (!transaction.data) {
      appDispatch(getDineType());
      appDispatch(getPriceList());

      navigate("/pages/home/initialization");
      appDispatch(toggle());
      appDispatch(changeName({ modalName: "Add new transaction" }));
    } else {
      navigate("/pages/ordering");
    }
  };

  const onToggleCashieringModal = () => {
    // if (isLoading) return;
    if (!canProceed("hasRequiredHeaders")) return;
    if (noEOD.NOEOD) {
      navigate("/pages/home/noeod");
      if (mallHookUp.data?.mallname === "Robinsons") {
        // special kind daw kase si robinsons kaya iba ung name ng modal nia pag NOEOD xD
        appDispatch(
          changeName({ modalName: "Previous day's EOD was not performed" })
        );
      } else {
        appDispatch(changeName({ modalName: "No transaction EOD" }));
      }
      appDispatch(toggle());
      return;
    }

    appDispatch(getRemainingZread());
    appDispatch(getActiveTransaction());
    if (!canProceed("printer_station")) return;

    if (canProceed("lastTransaction")) {
      navigate("/pages/cashiering");
    }
  };

  const onToggleOpenTransactions = () => {
    navigate("/pages/home/open_transactions");
    appDispatch(changeName({ modalName: "Hold Transactions" }));
    appDispatch(toggle());
  };

  const onToggleOpenCentralSync = () => {
    navigate("/pages/home/central_sync");
    appDispatch(changeName({ modalName: "Central Sync" }));
    appDispatch(toggle());
  };

  const onToggleAutoOfSalesCorrupted = () => {
    navigate("/pages/home/autofosales_corrupted");
    appDispatch(changeName({ modalName: "Corrupted Automation Of Sales" }));
    appDispatch(toggle());
  };

  const onToggleSystemSettings = () => {
    if (isLoading) return;
    navigate("/pages/systemsettings");
  };
  const onToggleReports = () => {
    if (isLoading) return;
    navigate("/pages/reports");
  };
  const onToggleMasterfile = () => {
    if (isLoading) return;
    if (!canProceed("printer_station")) return;
    navigate("/pages/masterfile");
  };
  const onToggleUtilities = () => {
    if (isLoading) return;
    navigate("/pages/utilities");
  };

  useEffect(() => {
    initializeHome((hasRemZread, hasNOEOD) => {
      if (hasRemZread || !canProceed("isEndTime")) {
        navigate("/pages/home/iszread");
        if (mallHookUp.data?.mallname === "Robinsons") {
          appDispatch(
            changeName({ modalName: "Previous day's EOD was not performed" })
          );
        } else {
          appDispatch(changeName({ modalName: "ZReading" }));
        }
        appDispatch(toggle());
      } else if (hasNOEOD) {
        navigate("/pages/home/noeod");
        if (mallHookUp.data?.mallname === "Robinsons") {
          // special kind daw kase si robinsons kaya iba ung name ng modal nia pag NOEOD xD
          appDispatch(
            changeName({ modalName: "Previous day's EOD was not performed" })
          );
        } else {
          appDispatch(changeName({ modalName: "No transaction EOD" }));
        }
        appDispatch(toggle());
      }
    });
  }, []);

  useEffect(() => {
    if (isEnd) {
      navigate("/pages/home/iszread");
      if (mallHookUp.data?.mallname === "Robinsons") {
        appDispatch(
          changeName({ modalName: "Previous day's EOD was not performed" })
        );
      } else {
        appDispatch(changeName({ modalName: "ZReading" }));
      }
      appDispatch(toggle());
    }
  }, [isEnd]);

  useEffect(() => {
    if (!isLoading) {
      const close: any = setTimeout(() => {
        toast.dismiss();
        setIsCardDisable(false);

        return clearTimeout(close);
      }, 500);
    }
  }, [isLoading]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/api/mallhookup/robinsonNotif');
  
    eventSource.onmessage = (event) => {
      const data: { message?: string; error?: string } = JSON.parse(event.data); // Parse incoming data
  
      // Show toast for each new message
      if (data.message) {
        toast.success(data.message, {
          hideProgressBar: true,
          position: "top-center",
          autoClose: 1500,
        });
      }
  
      if (data.error) {
        toast.error(data.error, {
          hideProgressBar: true,
          position: "top-center",
          autoClose: 1500,
        });
      }
    };
  
    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close(); // Close the connection on error
    };
  
    return () => {
      eventSource.close(); // Cleanup on component unmount
    };
  }, []); // Ensure effect runs only once on mount

  return (
    <>
      <AuthenticationGuard
        condition={account.isLoggedIn}
        redirectTo={"/pages/login"}
      >
        <section className=" flex flex-col w-full h-screen px-[]">
          <Modal title={"Select Type"} isActivated={true}>
            <Outlet></Outlet>
          </Modal>

          <div className="flex items-center justify-between px-[70px] pb-2 border-b-2 my-2">
            <h1 className="font-montserrat text-[2rem]">
              Welcome, {account.data?.usrname}!
            </h1>

            <div className="">
              {hasConnectionToRemoteCentral ? (
                <StyledWifiConnected $color="#008000" />
              ) : (
                <StyledWifiDisconnected $color="#FF0000" />
              )}
            </div>

            <div className="flex items-center">
              <div
                className="relative rounded-full p-2 mx-1 bg-gray-100 cursor-pointer"
                onClick={onToggleOpenTransactions}
              >
                <StyledOpenOrderIcon $color={theme.primarycolor} />
                {(allOpenTransactions?.data?.count || 0) > 0 && (
                  <div className="absolute flex justify-center items-center top-0 right-0 rounded-full bg-red-500 h-[20px] min-w-[20px] w-auto p-1">
                    <span className="text-white font-montserrat font-bold text-[12px]">
                      {allOpenTransactions.data.count > 10
                        ? "10+"
                        : allOpenTransactions.data.count}
                    </span>
                  </div>
                )}
              </div>

              <div
                className="relative rounded-full p-2 mx-1 me-2 bg-gray-100 cursor-pointer"
                onClick={() => !isChecking && onToggleOpenCentralSync()}
              >
                <StyledCloudSyncIcon $color={theme.primarycolor} />
                {UnSyncMasterfiles.length > 0 && (
                  <div className="absolute flex justify-center items-center top-0 right-0 rounded-full bg-red-500 h-[20px] min-w-[20px] w-auto p-1">
                    <span className="text-white font-montserrat font-bold text-[12px]">
                      {UnSyncMasterfiles.length > 10
                        ? "10+"
                        : UnSyncMasterfiles.length}
                    </span>
                  </div>
                )}
                {isChecking && <Spin className="absolute top-4 left-4" />}
              </div>

              <div
                className="relative rounded-full p-2 mx-1 me-2 bg-gray-100 cursor-pointer"
                onClick={onToggleAutoOfSalesCorrupted}
              >
                <StyledAutomationErrorIcon $color={theme.primarycolor} />
                {isCentralConnected.current &&
                  corrupted_autoofsales.length > 0 && (
                    <div className="absolute flex justify-center items-center top-0 right-0 rounded-full bg-red-500 h-[20px] min-w-[20px] w-auto p-1">
                      <span className="text-white font-montserrat font-bold text-[12px]">
                        {corrupted_autoofsales.length > 10
                          ? "10+"
                          : corrupted_autoofsales.length}
                      </span>
                    </div>
                  )}
              </div>

              <ButtonStyled
                $color={theme.primarycolor}
                className="rounded-md bg-slate-600 w-[100px] h-[35px] hover:bg-[#3e516b] text-white"
                onClick={logOut}
              >
                Logout
              </ButtonStyled>
            </div>
          </div>

          <div className="flex flex-col gap-4 h-full items-center">
            <div className="flex flex-wrap gap-2 max-w-[80rem] justify-center">
              {(account.data?.usrtyp === "ROOT" ||
                useraccessfiles.find((a: any) =>
                  a.menfield.includes("masterfile")
                )) && (
                <button className="mx-2" onClick={onToggleMasterfile}>
                  <HomeCard
                    disable={isCardDisable}
                    title="Master File"
                    primaryColor={theme.primarycolor}
                  >
                    <BookOutlined
                      className={`animation text-[5rem] text-[${theme.primarycolor}]`}
                    />
                  </HomeCard>
                </button>
              )}
              {(account.data?.usrtyp === "ROOT" ||
                useraccessfiles.find(
                  (a: any) =>
                    a.menfield === "cashin" ||
                    a.menfield === "cashfund" ||
                    a.menfield === "cashout" ||
                    a.menfield === "cashdeclaration"
                )) && (
                <button className="mx-2" onClick={onToggleCashieringModal}>
                  <HomeCard
                    disable={isCardDisable}
                    title="Cashiering"
                    primaryColor={theme.primarycolor}
                  >
                    <DesktopOutlined
                      className={`animation text-[5rem] text-[${theme.primarycolor}]`}
                    />
                  </HomeCard>
                </button>
              )}
              <button className="mx-2" onClick={onToggleModal}>
                <HomeCard
                  disable={isCardDisable}
                  title="Ordering"
                  primaryColor={theme.primarycolor}
                >
                  <ShoppingCartOutlined
                    className={`animation text-[5rem] text-[${theme.primarycolor}]`}
                  />
                </HomeCard>
              </button>

              {(account.data?.usrtyp === "ROOT" ||
                useraccessfiles.find((a: any) =>
                  a.menfield.includes("reports")
                )) && (
                <button className="mx-2" onClick={onToggleReports}>
                  <HomeCard
                    disable={isCardDisable}
                    title="Reports"
                    primaryColor={theme.primarycolor}
                  >
                    <AreaChartOutlined
                      className={`animation text-[5rem] text-[${theme.primarycolor}]`}
                    />
                  </HomeCard>
                </button>
              )}
              {(account.data?.usrtyp === "ROOT" ||
                useraccessfiles.find((a: any) =>
                  a.menfield.includes("utilities")
                )) && (
                <button className="mx-2" onClick={onToggleUtilities}>
                  <HomeCard
                    disable={isCardDisable}
                    title="Utilities"
                    primaryColor={theme.primarycolor}
                  >
                    <ToolOutlined
                      className={`animation text-[5rem] text-[${theme.primarycolor}]`}
                    />
                  </HomeCard>
                </button>
              )}
              {account.data?.usrtyp === "ROOT" && (
                <button className="mx-2" onClick={onToggleSystemSettings}>
                  <HomeCard
                    disable={isCardDisable}
                    title="Settings"
                    primaryColor={theme.primarycolor}
                  >
                    <SettingOutlined
                      className={`animation text-[5rem] text-[${theme.primarycolor}]`}
                    />
                  </HomeCard>
                </button>
              )}
            </div>
          </div>
        </section>
      </AuthenticationGuard>
    </>
  );
});
export default Home;
