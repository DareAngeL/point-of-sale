import { dateNowFormattedNumerical } from "../../../../helper/Date";
import { formatNumberWithCommasAndDecimals } from "../../../../helper/NumberFormat";
import { useAppSelector } from "../../../../store/store";

const ReprintCashfundReceiptV2 = () => {
  const {header} = useAppSelector((state) => state.masterfile);
  // const {account} = useAppSelector((state) => state.account);
  const {lastCashFund: lastCashieringTran} = useAppSelector((state) => state.transaction);

  console.log("lastCashieringTran: ", lastCashieringTran);
  

  return (
    <>
      <div
        id="cashreprint-cashfund"
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
              {lastCashieringTran?.postrntyp}
            </p>
            <p className="text-center font-black text-lg">
              {lastCashieringTran?.trndte ? dateNowFormattedNumerical(lastCashieringTran?.trndte + ' ' + lastCashieringTran?.logtim) : ""}
            </p>
          </div>

          <div className="border-t border-dashed border-black pb-4 mt-4"></div>

          <div className="flex justify-between">
            <p className="font-black text-lg">
              CASHIER: {lastCashieringTran?.cashier}
            </p>
          </div>

          <div className="border-t border-dashed border-black pb-4 mt-4"></div>

          <div className="flex justify-between">
            <p className="font-black text-lg">TOTAL:</p>
            <p className="text-right font-black text-lg">
              {formatNumberWithCommasAndDecimals(lastCashieringTran?.extprc||0, 2)}
            </p>
          </div>

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

export default ReprintCashfundReceiptV2;
