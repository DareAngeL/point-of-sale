import {useAppSelector} from "../../../../store/store";
import {BackButton} from "../../../../common/backbutton/BackButton";
import moment from "moment";
import {formatDataForReceipt} from "../../../../helper/FileConversion";

export default function FileView() {
  const {
    xReadingView: {fileType},
    xReading: {data},
  } = useAppSelector((state) => state.report);
  const header = useAppSelector((state) => state.masterfile.header);
  console.log(header);
  const {
    address1,
    address2,
    address3,
    business1,
    business2,
    business3,
    tin,
    machineno,
    serialno,
  } = header.data[0];
  const xread = data[0];

  console.log(xread);

  // temp

  switch (fileType) {
    case "pdf":
      return (
        <div className="h-[100vh] w-[100%]  flex flex-col overflow-auto flex flex-col gap-4">
          <BackButton />
          <h1 className="text-center font-bold">PDF File View</h1>
          <div className="border border-gray-300 flex flex-col gap-4 p-4 pb-[40px] pt-[40px] ml-[100px] mr-[100px]">
            <div className="header flex flex-col items-center justify-center ">
              <h1 className="font-bold">{business1}</h1>
              <h1 className="font-bold">{business2}</h1>
              <h1 className="font-bold">{business3}</h1>
              <h1 className="font-bold">VAT Reg. {tin}</h1>
              <h1 className="font-bold">{address1}</h1>
              <h1 className="font-bold">{address2}</h1>
              <h1 className="font-bold">{address3}</h1>
              <h1 className="font-bold ">
                MIN#{machineno} SN#{serialno}
              </h1>
              <h1 className="title font-bold border-t-[2px] border-b-[2px] border-dashed border-gray-300 w-full text-center p-4 mt-4">
                <h1 className="font-bold">X-Reading</h1>
              </h1>
              <h1 className="title font-bold border-b-[2px] border-dashed border-gray-300 w-full text-center p-4 ">
                <h1 className="font-bold">{moment().format("MMM-DD-YYYY")}</h1>
              </h1>
            </div>

            <h1 className="title font-bold border-b-[2px] border-dashed border-gray-300 w-full  p-4 pl-0  ">
              <h1>Cashier: {xread.cashier}</h1>
            </h1>

            <div className="cashier"></div>
            <div className="sales">
              <div className="flex justify-between">
                <p>Gross Sales</p>
                <p>{xread.sales_summ.gross_sales.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Less Paid Void</p>
                <p>{xread.sales_summ.less_post_void.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Less Paid Refund</p>
                <p>{xread.sales_summ.less_post_refund.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Less Discount</p>
                <p>{xread.sales_summ.less_disc.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Less Service Charge</p>
                <p>{xread.sales_summ.less_serv_charge.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Less VAT Adj</p>
                <p>{xread.sales_summ.less_vat_adj.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Net Sales WVAT</p>
                <p>{xread.sales_summ.net_sales.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Net Sales W/O Vat</p>
                <p>{xread.sales_summ.vat_exempt_net.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Total Vat Sales</p>
                <p>{xread.sales_summ.total_vat_sales.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Total Vat Amount</p>
                <p>{xread.sales_summ.vat_amount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Local Tax 0%</p>
                <p>{xread.sales_summ.localtax.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Total Vat Exempt</p>
                <p>{xread.sales_summ.total_vat_exempt.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Total # of Transaction</p>
                <p>{xread.sales_summ.total_numtrans.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Total # of PAX</p>
                <p>{xread.sales_summ.total_numpax.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Total Quantity</p>
                <p>{xread.sales_summ.total_quantity.toFixed(2)}</p>
              </div>
            </div>

            <div className="discounts flex flex-col border-b-[2px] border-dashed border-gray-300 pb-4 pt-4">
              <h1 className="font-bold border-b-[2px] border-t-[2px] border-dashed border-gray-300 w-full  p-4 text-center ">
                {xread.discounts.length > 0 && <p>Discounts</p>}
              </h1>
              {xread.discounts.map(
                (disc: {discde: any; qty: any; amtdis: number}) => {
                  return (
                    <>
                      <p>{disc.discde}</p>
                      <div className="flex justify-between">
                        <p className="">{parseInt(disc.qty)}</p>
                        <p className="">{disc.amtdis.toFixed(2)}</p>
                      </div>
                    </>
                  );
                }
              )}
            </div>

            <div className="cash  pb-4  ">
              <div className="flex flex-col">
                <p> CASH</p>
                <div className="flex justify-between">
                  <p>{xread.cash_tran_summ.cash.qty}</p>
                  <p>{xread.cash_tran_summ.cash.cashsales}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <p> CASH FUND </p>
                <p>{xread.cash_tran_summ.cashfund.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p> CASH IN</p>
                <p>{xread.cash_tran_summ.cash_in.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p> CASH OUT </p>
                <p>{xread.cash_tran_summ.cash_out.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p> CASH IN DRAWER </p>
                <p>{xread.cash_tran_summ.end_cash.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p> POS CASH </p>
                <p>{xread.cash_tran_summ.pos_cash.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p> SHORT/OVER </p>
                <p>{xread.cash_tran_summ.shortover.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p> EXCESS </p>
                <p>{xread.cash_tran_summ.excess.toFixed(2)}</p>
              </div>
            </div>

            <h1 className="title font-bold  border-b-[2px]  border-t-[2px]  border-dashed border-gray-300 w-full  p-4   text-center">
              {xread.card_sales.length > 0 && <h1>Card Sales</h1>}
            </h1>
            <div className="card-sales pt-4 pb-4">
              {xread.card_sales.map(
                (card: {
                  cardtype: string;
                  cardList: {amount: number; cardclass: string; qty: number}[];
                }) => {
                  console.log(card);
                  return (
                    <>
                      <p>
                        {card.cardtype == "null"
                          ? "PLACEHOLDER CARD"
                          : card.cardtype}
                      </p>
                      {card.cardList.map((item) => {
                        return (
                          <div className="flex justify-between">
                            <p className="w-[40%] ">{item.cardclass}</p>
                            <p className="w-[20%] text-center">{item.qty}</p>
                            <p className="w-[40%] text-end">
                              {item.amount.toFixed(2)}1
                            </p>
                          </div>
                        );
                      })}
                    </>
                  );
                }
              )}
            </div>

            <h1 className="title font-bold  border-b-[2px]  border-t-[2px]  border-dashed border-gray-300 w-full  p-4   text-center">
              {xread.othermop.length > 0 && <h1>Other Mop Sales</h1>}
            </h1>
            <div className="mop-sales">
              {xread.othermop.map(
                (mop: {
                  paymenttype: any;
                  qty: any;
                  amount: any;
                  excess: any;
                }) => {
                  return (
                    <div className="flex justify-between">
                      <p>{mop.paymenttype}</p>
                      <p>{parseInt(mop.qty)}</p>
                      <p>{parseFloat(mop.amount).toFixed(2)}</p>
                    </div>
                  );
                }
              )}
            </div>
            <h1 className="title font-bold  border-b-[2px]  border-t-[2px]  border-dashed border-gray-300 w-full  p-4   text-center">
              <h1 className="font-bold">X-Reading</h1>
            </h1>
            <div className="or border-b-[2px]  border-t-[2px]  border-dashed border-gray-300">
              <div className="flex justify-between font-bold  border-b-[2px]   border-dashed border-gray-300   p-4">
                <p>Beginning OR</p>
                <p>{xread.docnum_summ.beg_or}</p>
              </div>
              <div className="space"></div>
              <div className="flex justify-between font-bold   p-4 ">
                <p>Ending OR</p>
                <p>{xread.docnum_summ.end_or}</p>
              </div>
            </div>
            <div className="end border-b-[2px]    border-dashed border-gray-300 p-4">
              <h1 className="font-bold">
                {moment().format("MMM-DD-YYYY hh:mm:ss A")}
              </h1>
              <h1 className="font-bold text-center">End of Cashier's Report</h1>
            </div>
          </div>
        </div>
      );
    case "csv":
      return (
        <div className="h-[100vh] w-[100%]  flex flex-col overflow-auto flex flex-col gap-4 ">
          <BackButton />
          <h1 className="text-center font-bold ">CSV File View</h1>
          <div className="border border-gray-300 flex flex-col align-center justify-center  text-center pb-[40px] pt-[40px] ml-[100px] mr-[100px] p-4">
            <div>
              {formatDataForReceipt(header.data[0], xread)
                .filter((value: any) => value.length > 1) // Remove empty strings
                .map((value: any, index: number) => (
                  <div style={{display: "flex", gap: "5px"}} key={index}>
                    {value.map((item: any, index: number) => (
                      <p
                        style={
                          index === 0 && item !== "" ? {marginRight: "5px"} : {}
                        }
                      >
                        {index === value.length - 1 ? `${item},` : item}
                      </p>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      );
    case "textfile":
      return (
        <div className="h-[100vh] w-[100%]  flex flex-col overflow-auto flex flex-col gap-4">
          <BackButton />
          <h1 className="text-center font-bold ">Text File View</h1>
          <div className="border border-gray-300 flex flex-col align-center justify-center  text-center pb-[40px] pt-[40px] ml-[100px] mr-[100px] p-4">
            <div>
              {formatDataForReceipt(header.data[0], xread)
                .filter((value: any) => value.length > 1) // Remove empty strings
                .map((value: any, index: number) => (
                  <div style={{display: "flex", gap: "5px"}} key={index}>
                    {value.map((item: any, index: number) => (
                      <p
                        style={
                          index === 0 && item !== "" ? {marginRight: "5px"} : {}
                        }
                      >
                        {index === value.length - 1 ? `${item}` : item}
                      </p>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div>
          <h1>Not Supported</h1>
        </div>
      );
  }
}
