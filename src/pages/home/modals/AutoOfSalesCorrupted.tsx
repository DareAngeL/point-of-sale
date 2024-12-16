import { Empty } from "antd";
import { useAppSelector } from "../../../store/store"
import { useCentral } from "../../../hooks/centralHooks";
import NoCentralConnection from "../../../assets/icon/no-connection.svg?react";

export function AutoOfSalesCorrupted() {
  const {isCentralConnected} = useCentral();

  const { corrupted_autoofsales } = useAppSelector((state) => state.utility);
  
  if (!isCentralConnected.current) {
    return (
      <div className="flex flex-col w-full h-[400px] justify-center items-center">
        <NoCentralConnection className="fill-gray-300" />
        <p className="font-sans text-[14px]">Oops! cannot established connection to central</p>
      </div>
    )
  }

  return (
    <>
      {corrupted_autoofsales.length === 0 ? (
        <>
          <div className="flex justify-center items-center w-full h-[400px]">
            <Empty description="No corrupted files." />
          </div>
        </>
      ) : (
        <>
          <p className="font-bold">List of corrupted files in automatic generation of POS<br/> transactions for syncing with CENTRAL database:</p>
            {corrupted_autoofsales.map(d => (
              <div className="mt-2">
                {d.docnum}
              </div>
            ))}

            <p className="text-[13px] mt-10">The corrupted files must be manually regenerated <br/> for synching.<br/> Please go to <span className="font-bold">{'Utilities > Automation of Sales Transactions'}</span> <br/>to process accordingly.</p>
        </>
      )}
    </>
  )
}