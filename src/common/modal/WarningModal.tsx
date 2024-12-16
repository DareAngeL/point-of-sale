interface WarningModalProps {
  modalName: string;
  onYes: () => void;
  onNo: () => void;
}

export function WarningModal(props: WarningModalProps) {
  return (
    <>
      <div className="absolute w-full h-full z-20">
        <div className="flex justify-center items-center bg-black/75 w-full center h-full z-30">
          <div className={`rounded bg-white shadow-lg flex flex-col`}>
            <div className=" font-montserrat px-8 py-5 border-b border-[#adacac] font-bold">
              <div className="flex items-center justify-between">
                <h1>{props.modalName}</h1>
              </div>
            </div>
            <div className="h-auto my-5 px-10 font-montserrat overflow-auto relative w-100">
              You have changes. Are you sure you want to cancel?
            </div>
            <div className="font-montserrat flex items-center justify-center">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-solid border-gray-300 hover:bg-blue-500 hover:text-white my-5 mxl-3"
                onClick={props.onNo}
              >
                No
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-solid border-green-500 bg-green-500 text-white my-5 mx-3"
                onClick={props.onYes}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
