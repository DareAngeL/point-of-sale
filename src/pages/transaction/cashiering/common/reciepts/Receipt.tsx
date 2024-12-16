import {useAppSelector} from "../../../../../store/store";
import {dateNowFormattedNumerical} from "../../../../../helper/Date";
import {formatNumberWithCommasAndDecimals} from "../../../../../helper/NumberFormat";

const Receipt = () => {
  const {header} = useAppSelector((state) => state.masterfile);
  const {account} = useAppSelector((state) => state.account);
  const {denom, reason, cashieringType, cashDeclarationTotal, cashTotal} =
    useAppSelector((state) => state.transaction);

  return (
    <>
      <div
        id="cashiering-receipt"
        className="w-full flex justify-center items-center font-montserrat"
      >
        <div id="content">
          <p className=" text-center text-lg font-black">
            {header.data[0].business1}
          </p>
          {/* <p className=" text-center text-lg font-black">
            {header.data[0].business2}
          </p> */}
          <p className=" text-center text-lg font-black">
            {header.data[0].business3}
          </p>
          <p className=" text-center text-lg font-black">
            {(header.data[0].chknonvat ? "NON-VAT Reg."
            : "VAT Reg.") + ` TIN- ${header.data[0].tin}`}
          </p>
          <p className=" text-center text-lg font-black">
            {header.data[0].address1}
          </p>
          <p className=" text-center text-lg font-black">
            {header.data[0].address2}
          </p>
          <p className=" text-center text-lg font-black">
            {header.data[0].address3}
          </p>
          <p className=" text-center text-lg font-black">
            MIN#{header.data[0].machineno} SN#{header.data[0].serialno}
          </p>

          <div className="border-t border-dashed border-black pb-4 mt-4"></div>

          <div className="flex flex-col">
            <p className="bold-text text-lg font-black text-center">
              {cashieringType}
            </p>
            <p className="text-center font-black text-lg">
              {dateNowFormattedNumerical()}
            </p>
          </div>

          <div className="border-t border-dashed border-black pb-4 mt-4"></div>

          <div className="flex justify-between">
            <p className="font-black text-lg">
              CASHIER: {account.data?.usrname}
            </p>
          </div>

          <div className="border-t border-dashed border-black pb-4 mt-4"></div>

          {cashieringType !== "CASH DECLARATION" ? (
            <>
              <div className="flex justify-between">
                <p className="font-black text-lg">TOTAL:</p>
                <p className="text-right font-black text-lg">
                  {formatNumberWithCommasAndDecimals(cashTotal, 2)}
                </p>
              </div>
              {cashieringType !== "CASH FUND" && (
                <>
                  <div className="h-[50px]"></div>
                  <div className="flex justify-between">
                    <p className="text-lg font-black">REASON:</p>
                    <p className="text-right font-black text-lg">{reason}</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {denom.map((item: any, index: number) => {
                const {total, quantity, value} = item;
                return (
                  <div className="flex justify-between font-black" key={index}>
                    <p className="text-lg font-black">
                      {value} x {quantity}
                    </p>
                    <p className="text-lg font-black">
                      {formatNumberWithCommasAndDecimals(total, 2)}
                    </p>
                  </div>
                );
              })}
              <div className="border-t border-dashed border-black pb-4 mt-4"></div>
              <div className="h-[50px]"></div>
              <div className="flex justify-between">
                <p className="font-black font-black text-lg">TOTAL:</p>
                <p className="font-black font-black text-lg">
                  {formatNumberWithCommasAndDecimals(cashDeclarationTotal, 2)}
                </p>
              </div>
            </>
          )}

          <div className="border-t border-dashed border-black pb-4 mt-4"></div>
          <div className="h-[50px]"></div>
          <div className="flex flex-col">
            <div className="w-[80%] border-t border-dashed border-black pb-2 mt-4 mx-auto"></div>
            <p className="text-center font-black text-lg">
              Cashier's Signature
            </p>
          </div>
          <div className="h-[40px]"></div>
          <div className="flex flex-col">
            <div className="w-[80%] border-t border-dashed border-black pb-2 mt-4 mx-auto"></div>
            <p className="text-center font-black text-lg">
              Supervisor's Signature
            </p>
          </div>
          <div className="h-[40px]"></div>
          <div className="border-t border-dashed border-black pb-4 mt-4"></div>
          <div className="h-[100px]"></div>
        </div>
      </div>
    </>
  );
};

export default Receipt;
