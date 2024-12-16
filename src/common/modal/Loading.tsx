import ReactDOM from "react-dom";
import "./Modal.css";
import { Spin } from "antd";
import React from "react";

export function Loading() {
  return (
    <>
      <div className="absolute w-full h-full z-20 font-montserrat text-white">
        <div className="flex justify-center items-center bg-black/75 center h-full w-full z-30">
          <div className={`rounded flex`}>
            <Spin />
            <span className="ms-2">Loading. Please wait...</span>
          </div>
        </div>
      </div>
    </>
  );
}

export const PortalLoading: React.FC = () => {
  return ReactDOM.createPortal(
    <>
      <div className="absolute w-full h-full z-20 font-montserrat text-white">
        <div className="flex justify-center items-center bg-black/75 center h-full w-full z-30">
          <div className={`rounded flex`}>
            <Spin />
            <span className="ms-2">Loading. Please wait...</span>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
      