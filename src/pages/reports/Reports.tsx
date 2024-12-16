import {Key} from "react";
import {BackButton} from "../../common/backbutton/BackButton";
import {usePage} from "../../hooks/modalHooks";
import {Outlet} from "react-router";
import {Modal} from "../../common/modal/Modal";
import {masterfileInit} from "../../hooks/masterfileHooks";
import {useUserAccessHook} from "../../hooks/userAccessHook";
import {useAppSelector} from "../../store/store";
import XReadPrint from "./xreading/receipt/XReadPrint";
import XReadPrintCSV from "./xreading/receipt/XReadCSV";
import XReadText from "./xreading/receipt/XReadText";
import {ZReadingReceipt} from "./zreading/receipt/ZReadingReceipt";
import { SelectionCard } from "./selectionCard/SelectionCard";
import ReprintCashfundReceiptV2 from "./reprintcashfund/receipt/ReprintCashfundReceiptV2";

interface ReportsProps {
  data: any;
}

export function Reports(props: ReportsProps) {
  masterfileInit();

  const itemList = props.data;
  const {pageActive} = usePage();

  const {useraccessfiles} = useAppSelector((state) => state.account);
  const {isRootUser, hasAccess} = useUserAccessHook();

  return (
    <>
      {pageActive && <Outlet></Outlet>}

      {!pageActive && (
        <>
          <Modal title="ModalSample" isActivated={true}>
            <Outlet></Outlet>
          </Modal>

          <div className="h-full relative w-full">
            <div className="flex bg-white z-10 w-full ps-5 items-center fixed shadow">
              <BackButton navigateTo={'/pages/home'} />
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
                ) =>
                  Object.keys(item).length === 0
                    ? ""
                    : (isRootUser() ||
                        useraccessfiles.find(
                          (a: any) =>
                            a.menfield === item.menfield && hasAccess(a)
                        )) && (
                        <SelectionCard
                          key={index}
                          name={item.name}
                          url={item.url}
                          isPage={item.isPage}
                          menfield={item.menfield}
                        />
                      )
              )}
            </div>
          </div>

          <div className="absolute top-0 right-0 -z-10 h-full w-[50%] bg-white opacity-[0] ">
            <XReadPrint />
            <XReadPrintCSV />
            <XReadText />
          </div>
          <div className="top-0 right-0 z-10 w-[80%] bg-white opacity-[0] max-h-[0px] overflow-clip">
            <ZReadingReceipt />
          </div>
          <div className="absolute top-0 right-0 -z-10 h-full w-[50%] bg-white opacity-[0] ">
            <ReprintCashfundReceiptV2 />
          </div>
        </>
      )}
    </>
  );
}
