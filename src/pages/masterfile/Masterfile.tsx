import {BackButton} from "../../common/backbutton/BackButton";
import {Modal} from "../../common/modal/Modal";
import {Outlet} from "react-router";
import {usePage} from "../../hooks/modalHooks";
import {masterfileInit} from "../../hooks/masterfileHooks";
import {useUserAccessHook} from "../../hooks/userAccessHook";
import { useAppSelector } from "../../store/store";
import { SelectionCardMasterfile } from "./selectionCard/SelectionCardMasterfile";
import { useMemo } from "react";

export function Masterfile() {
  masterfileInit();

  const {masterfileMenu} = useAppSelector(state => state.menu);
  const {isRootUser, hasAccess, useraccessfiles} = useUserAccessHook();
  const {pageActive} = usePage();

  const sort = useMemo(() =>{
    const menuClone = [...masterfileMenu.data];
    return menuClone.sort((a:any,b:any) => a.order-b.order);
  }, [masterfileMenu]);

  return (
    <>
      {pageActive && <Outlet></Outlet>}

      {!pageActive && (
        <>
          <Modal title="ModalSample" isActivated={true} height='full' maxHeight={620} width={800}>
            <Outlet></Outlet>
          </Modal>
          <div className="h-full w-full relative">
            <div className="flex bg-white z-10 w-full ps-10 items-center fixed shadow">
              <BackButton navigateTo={"/pages/home"} />
              <div className="text-[3rem] font-montserrat">Masterfile</div>
            </div>
            <div className="flex z-0 flex-col w-full max-w-[95%] relative left-[3%] top-[6rem]">
              {/* {itemList.children.map(
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
              )} */}
              {
                sort.map((item: any, index) =>(  
                  (isRootUser() ||
                  useraccessfiles.find(
                    (a: any) =>
                      a.menfield === item.menfield && hasAccess(a)
                  )) && (
                  <SelectionCardMasterfile
                    key={index}
                    name={item.mencap}
                    url={item.url}
                    isPage={item.isPage}
                    menfield={item.menfield}
                  />
                  )
                ))
              }
            </div>
          </div>
        </>
      )}
    </>
  );
}
