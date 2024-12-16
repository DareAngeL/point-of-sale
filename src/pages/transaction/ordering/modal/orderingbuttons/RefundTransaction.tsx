import {useState} from "react";
import {PosfileModel} from "../../../../../models/posfile";
// import {RefundReceipt} from "../../receipt/RefundReceipt";
import {RefundReason} from "./reason/RefundReason";

export function RefundTransaction() {
  const [selectedOr] = useState<PosfileModel>();

  return (
    <>
      <section>
        {/* <div className="hidden"> */}
        {/* <RefundReceipt voidPosfile={undefined} /> */}
        {/* </div> */}
        <RefundReason reason={selectedOr} />
        {/* {customModal ? (
                    <CustomModal modalName={"Set refund reason"} height={""}>
                        <RefundReason reason={selectedOr} />
                    </CustomModal>) : (<>
                {allLoadedData.map((item)=>(
                    <>
                        {item.ordocnum != posfile.data?.ordocnum && (
                            <>
                                <div className="flex justify-between mt-2 border-b cursor-pointer" onClick={() => {
                                    setCustomModal(true);
                                    setSelectedOr(item);
                                    dispatch(getPreviousPosfiles(item.ordercde || ""));
                                    dispatch(getPreviousTotal(item.ordercde || ""));
                                    console.log();
                                }}>
                                    
                                    <div>{item.ordocnum}</div>
                                    <div>{numberPadFormatter(item.groext, 2)}</div>
                                    
                                </div>
                            </>
                        )}
                        
                    </>
                ))}
                </>)} */}
      </section>
    </>
  );
}
