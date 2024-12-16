
interface TransferTransactionModalProps {
  modalTitle: string;
  onNo: () => void;
  onYes: () => void;
}

export function TransferTransactionModal(props: TransferTransactionModalProps ) {

  return (
    <>
      <div className="absolute w-full h-full z-20">
          <div className="flex justify-center items-center bg-black/75 w-full center h-full z-30">
            <div className="rounded bg-white shadow-lg flex flex-col">
              <div className="font-montserrat px-8 py-5 border-b border-[#adacac] font-bold">
                <div className="flex items-center justify-between">
                  {props.modalTitle}
                </div>
              </div>

              <div className="min-w-[500px] max-w-[500px] p-[10px] font-montserrat overflow-y-auto overflow-x-hidden relative">
                <div className="flex justify-center items-center bg-white sticky bottom-0">
                  <button
                    type="button"
                    className="px-4 py-2 rounded border border-solid border-red-500 hover:bg-red-500 hover:text-white my-5 mxl-3"
                    onClick={props.onNo}
                  >
                    No
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
                    onClick={props.onYes}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}