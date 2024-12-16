import {CloseOutlined} from "@ant-design/icons";
import "./Modal.css";
import {ReactNode} from "react";

interface CustomModalProps {
  modalName: string;
  onExitClick?: () => void;
  maxHeight: string;
  height?: number;
  children: ReactNode;
  isShowXBtn?: boolean;
}

export function CustomModal(props: CustomModalProps) {
  return (
    <>
      <div className="absolute w-full h-full z-20">
        <div className="flex justify-center items-center bg-black/75 center h-full w-full z-30">
          <div className={`rounded bg-white shadow-lg flex flex-col`}>
            <div className=" font-montserrat px-8 py-5 border-b border-[#adacac] font-bold">
              <div className="flex items-center justify-between">
                <h1>{props.modalName}</h1>
                {props.isShowXBtn && (
                  <CloseOutlined onClick={props.onExitClick} />
                )}
              </div>
            </div>
            <div
              className={`${
                props.maxHeight ? `max-h-[${props.maxHeight}px]` : "max-h-[450px]"
              } h-[${props.height || 500}px] min-w-[500px] max-w-[500px] my-5 px-10 font-montserrat overflow-y-auto overflow-x-hidden relative w-auto `}
            >
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
