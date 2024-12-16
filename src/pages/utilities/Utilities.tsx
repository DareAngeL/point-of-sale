import {Key} from "react";
import {BackButton} from "../../common/backbutton/BackButton";
import {SelectionCard} from "../masterfile/selectionCard/SelectionCard";
import {usePage} from "../../hooks/modalHooks";
import {Outlet} from "react-router";
import {Modal} from "../../common/modal/Modal";
import {masterfileInit} from "../../hooks/masterfileHooks";
import {useUserAccessHook} from "../../hooks/userAccessHook";
import { useAppSelector } from "../../store/store";
import { useCentral } from "../../hooks/centralHooks";
interface UtilitiesProps {
  data: any;
}

export function Utilities(props: UtilitiesProps) {
  masterfileInit();

  const itemList = props.data;
  const {pageActive} = usePage();
  const { isCentralConnected } = useCentral();

  const {isRootUser, hasAccess, useraccessfiles} = useUserAccessHook();
  const mallHookUp = useAppSelector((state) => state.masterfile.mallHookUp);
  const sticker_printer = useAppSelector((state) => state.masterfile.syspar.data[0].sticker_printer);

  // hides the modules that is connected to the central if central connection was disabled
  const hideCentralModule = (name: string) => {
    const names = ["Central Server Setup", "Download and Sync Master File", "Automation of Sales Transaction"];
    if (Number(localStorage.getItem("withtracc")) === 0) {
      return names.includes(name);
    }

    return false;
  }

  return (
    <>
      {pageActive && <Outlet></Outlet>}

      {!pageActive && (
        <>
          <Modal title="ModalSample" isActivated={true}>
            <Outlet></Outlet>
          </Modal>

          <div className="h-full relative w-full">
            <div className="flex bg-white ps-10 z-10 w-full items-center fixed shadow">
              <BackButton navigateTo={"/pages/home"} />
              <div className="text-[3rem] font-montserrat">{itemList.name}</div>
            </div>
            <div className="flex z-0 flex-col w-full relative max-w-[95%] left-[5%] translate-x-[-3%] top-[6rem]">
              {itemList.children.map(
                (
                  item: {
                    name: string;
                    url: string;
                    isPage: boolean;
                    menfield: string;
                  },
                  index: Key | null | undefined
                ) => {
                  if ((item.name === 'Theme Settings' || item.name === "Cancel Z-Reading") && isRootUser()) {
                    return (
                      <>
                        <SelectionCard
                          key={index}
                          name={item.name}
                          url={item.url}
                          isPage={item.isPage}
                          menfield={item.menfield}
                        />
                      </>
                    )
                  } else if (item.name === 'Theme Settings') {
                    // else if this is theme settings but the user is not a root user, then don't show theme settings
                    return <></>
                  } else if (item.name === "View Sent Files" && mallHookUp.data?.mallname !== "Robinsons") {
                    // else if this is view sent files but the mall is not robinson, then don't show view sent files
                    return <></>
                  } else if (isCentralConnected.current && (item.name === "Import" || item.name === "Export")) {
                    // else if the central is connected and the item is import or export, then don't show import and export
                    return <></>
                  } else if (item.name === "Reprint Stickers" && sticker_printer === 0) {
                    return <></>
                  }

                  return Object.keys(item).length === 0 ? (
                    <></>
                  ) : (
                    (isRootUser() ||
                      useraccessfiles.find(
                        (a: any) => a.menfield === item.menfield && hasAccess(a)
                      )) && !hideCentralModule(item.name) && (
                      <>
                        <SelectionCard
                          key={index}
                          name={item.name}
                          url={item.url}
                          isPage={item.isPage}
                          menfield={item.menfield}
                        />
                      </>
                    )
                  )
                }
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
