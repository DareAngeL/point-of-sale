import {RefundTable} from "./RefundTable";

export function RefundTransactionList() {
  return (
    <>
      <RefundTable />
      {/* {allLoadedData.map((item)=>(
                <>


                    {item.ordocnum != posfile.data?.ordocnum && (
                        <>
                            <div className="flex justify-between mt-2 border-b cursor-pointer" onClick={() => {
                            }}>
                                <div>{item.ordocnum}</div>
                                <div>{numberPadFormatter(item.groext, 2)}</div>
                                
                            </div>
                        </>
                    )}

                </>
            ))} */}
    </>
  );
}
