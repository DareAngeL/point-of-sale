import {useAppSelector} from "../../../../store/store";
import {formatNumberWithCommasAndDecimals} from "../../../../helper/NumberFormat";
import moment from "moment";

export default function OrderTicketBySubClass() {
  const {posfileTOTAL: posfile, posfiles} = useAppSelector((state) => state.order);
  const {account} = useAppSelector((state) => state.account);

  const renderItems = () => {
    return posfiles.data.map((item) => {
      return (
        <div className="flex font-black ml-2">
          <div className="flex gap-2">
            <p>{formatNumberWithCommasAndDecimals(item.itmqty as number)}</p>
            <p>{item && item.itmdsc && item.itmdsc.toUpperCase()}</p>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div
        id="orderticket-bysubclass"
        className="w-full flex justify-center items-center font-montserrat"
      >
        <div id="content" className="w-[400px] h-full">
          <div className="flex justify-between mt-2">
            <p className="">SERVER: {account.data?.usrname}</p>
          </div>
          <div className="border-t border-dashed border-gray-400 pb-4 "></div>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className="flex justify-center font-black">
            <p className="text-center">-- {posfile.data?.ordertyp || ""} --</p>
          </div>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          {renderItems()}
          <div className="flex justify-center">
            <p className="text-center text-[12px]">
              -- {`${posfiles.data.length} PRODUCTS ORDERED`} --
            </p>
          </div>
          <div className="border-t border-dashed border-gray-400 pb-1 mt-4"></div>
          <p className="text-right">
            {moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
              "MM/DD/YYYY h:mm:ss A"
            )}
          </p>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className="flex justify-center font-black">
            <p className="text-center">** ORDER TICKET **</p>
          </div>
          <div className="flex font-black">
            <p className="text-center">CUSTOMER: {posfile.data?.ordercde}</p>
          </div>
        </div>
      </div>
    </>
  );
}
