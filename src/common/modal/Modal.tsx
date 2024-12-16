import { ReactNode, useEffect, useState } from "react";
import { useChangeNameModal, useModal } from "../../hooks/modalHooks";
import { CloseOutlined } from "@ant-design/icons";
import "./Modal.css";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { BackButton } from "../backbutton/BackButton";

interface ModalProps {
  id?: string;
  title: string;
  children: ReactNode;
  width?: number;
  maxWidth?: string;
  height?: number | "full";
  maxHeight?: number;
  isActivated?: boolean | true;
  onClose?: () => void;
  // isBack?: boolean;
  customFunction?: () => void;
  onBackBtnClick?: (modalName: string) => void;
  onExit?: () => void;
  bodyRef?: any;
}

export function Modal(props: ModalProps) {
  const { modal, removeXbutton, dispatch, isFullScreen, isEnableBackButton } =
    useModal();
  const { modalName } = useChangeNameModal();
  const Navigate = useNavigate();

  const [isRemoveXBtn, setIsRemoveXBtn] = useState<boolean | undefined>(false);

  useEffect(() => {
    setIsRemoveXBtn(removeXbutton);
  }, [removeXbutton]);

  // prevent scrolling when modal is active
  useEffect(() => {
    const body = document.body;
    setIsRemoveXBtn(removeXbutton);

    if (modal) {
      body.style.overflow = "hidden";
    } else {
      // body.style.overflow = "unset";
      props.onClose && props.onClose();
    }
  }, [modal]);

  const onExitClick = () => {
    props.onExit && props.onExit();
    if (props.customFunction) {
      console.log("here");
      props.customFunction();
    } else {
      console.log("here 2");
      dispatch();
    }
    if (props.isActivated) Navigate(-1);
  };

  return modal ? (
    <>
      <div className="absolute w-full h-full z-20">
        <div className="flex justify-center items-center bg-black/75 center h-full w-full z-30">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div
              id={props.id}
              className={`rounded bg-white shadow-lg flex flex-col`}
            >
              <div
                className={`${
                  isFullScreen
                    ? "w-[95vw]"
                    : `max-w-[${props.maxWidth || "600px"}]`
                } font-montserrat px-8 py-5 border-b border-[#adacac] font-bold`}
              >
                <div className="flex items-center justify-between">
                  {isEnableBackButton && (
                    <BackButton
                      onClick={() =>
                        props.onBackBtnClick && props.onBackBtnClick(modalName)
                      }
                    />
                  )}
                  <h1 className="me-2">{modalName}</h1>
                  {!isRemoveXBtn && <CloseOutlined onClick={onExitClick} />}
                </div>
              </div>
              <div
                ref={props.bodyRef}
                className={`${
                  isFullScreen
                    ? `h-[82vh] w-[95vw] my-5 px-10 font-montserrat overflow-y-auto overflow-x-hidden relative`
                    : `${
                        props.maxHeight
                          ? `max-h-[${props.maxHeight}px]`
                          : "max-h-[450px]"
                      } min-w-[500px] max-w-[600px] my-5 px-10 font-montserrat overflow-y-auto overflow-x-hidden relative w-auto`
                } `}
                style={{
                  height: props.height
                    ? props.height === "full"
                      ? "80vh"
                      : `${props.height}px`
                    : "500px",
                  width: props.width ? `${props.width}px` : "auto",
                }}
              >
                {props.children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}
