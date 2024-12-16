import {useAppSelector} from "../../../../store/store";
import {dateNowFormatted} from "../../../../helper/Date";
import {formatNumberWithCommasAndDecimals} from "../../../../helper/NumberFormat";
const XReadPrintCSV = () => {
  const {header} = useAppSelector((state) => state.masterfile);
  const {account} = useAppSelector((state) => state.account);
  const {xReading} = useAppSelector((state) => state.report);

  const _xreading = xReading.data[0];


  if (xReading.data.length === 0) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    );
  }

  return (
    <>
      <div
        id="xread-reciept-csv"
        className="w-full flex justify-center items-center font-montserrat"
      >
        <div className="content">
          {header &&
            header.data &&
            header.data[0] &&
            header.data[0].business1 &&
            header.data[0].business1.length > 0 && (
              <p className="text-lg font-black">{header.data[0].business1},</p>
            )}
          {/* {header &&
            header.data &&
            header.data[0] &&
            header.data[0].business2 &&
            header.data[0].business2.length > 0 && (
              <p className="text-lg font-black">{header.data[0].business2},</p>
            )} */}
          {header &&
            header.data &&
            header.data[0] &&
            header.data[0].business3 &&
            header.data[0].business3.length > 0 && (
              <p className="text-lg font-black">{header.data[0].business3},</p>
            )}

          <p className="font-black">{(header.data[0].chknonvat ? "NON-VAT Reg." : "VAT Reg.") + ` TIN- ${header.data[0].tin}`},</p>
          <p className="font-black">{header.data[0].address1},</p>
          <p className="font-black">{header.data[0].address2},</p>
          <p className="font-black">{header.data[0].address3},</p>
          <p className="font-black">
            MIN#{header.data[0].machineno} SN#{header.data[0].serialno},
          </p>

          <div className="flex flex-col">
            <p className="bold-text font-black">X-READING,</p>
            <p className="font-black text-lg">{dateNowFormatted()},</p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">
              CASHIER: {account.data?.usrname},
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Gross Sales,</p>
            <p className="font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading?.sales_summ?.gross_sales,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Less Paid Void,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.less_post_void,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Less Paid Refund,</p>
            <p className="font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.less_post_refund,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Less Discount,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.less_disc,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Less Service Charge,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.less_serv_charge,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Less VAT Adj,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.less_vat_adj,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Net Sales WVAT,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.net_sales,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Net Sales W/O VAT,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.vat_exempt_net,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Total VAT Sales,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.total_vat_sales,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Total VAT ,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.vat_amount,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Local Tax 0%,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.localtax,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Local VAT Exempt,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.total_vat_exempt,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Total # of Transaction,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.total_numtrans,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Total # of Pax,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.total_numpax,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Total Quantity,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.sales_summ.total_quantity,
                2
              )}
              ,
            </p>
          </div>

          <p className="font-black text-lg">DISCOUNT,</p>

          <div>
            {_xreading.discounts.map(
              (disc: {discde: any; qty: any; amtdis: number}) => {
                return (
                  <>
                    <p className="font-black text-lg">{disc.discde},</p>
                    <div className="flex justify-between">
                      <p className=" font-black text-lg">{disc.qty}</p>
                      <p className="font-black text-lg">
                        {formatNumberWithCommasAndDecimals(disc.amtdis, 2)}
                      </p>
                    </div>
                  </>
                );
              }
            )}
          </div>

          <div>
            <p className="font-black text-lg">CASH,</p>
            <div className="flex justify-between">
              <p className=" font-black text-lg">
                {_xreading.cash_tran_summ.cash.qty},
              </p>
              <p className=" font-black text-lg">
                {formatNumberWithCommasAndDecimals(
                  _xreading.cash_tran_summ.cash.cashsales,
                  2
                )}
                ,
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">CASH FUND,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.cashfund,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">CASH IN,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.cash_in,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">CASH OUT,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.cash_out,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">CASH DRAWER,</p>
            <p className="text-right font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.end_cash,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">POS CASH,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.pos_cash,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">DECLARATION,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.exp_cash,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">SHORT/OVER,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.shortover,
                2
              )}
              ,
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">EXCESS,</p>
            <p className=" font-black text-lg">
              {formatNumberWithCommasAndDecimals(
                _xreading.cash_tran_summ.excess,
                2
              )}
              ,
            </p>
          </div>

          <p className="font-black text-lg ">CARD SALES,</p>

          <div>
            {_xreading.card_sales.map(
              (card: {
                cardtype: string;
                cardList: {
                  amount: number;
                  cardclass: string;
                  qty: number;
                }[];
              }) => {
                return (
                  <>
                    <p className="font-black text-lg">{card.cardtype}</p>
                    <div className="flex justify-between">
                      {card.cardList.map((item) => {
                        return (
                          <>
                            <p></p>
                            <p className="font-black text-lg">
                              {item.cardclass},
                            </p>
                            <p className="font-black text-lg">{item.qty},</p>
                            <p className="font-black text-lg">
                              {formatNumberWithCommasAndDecimals(
                                item.amount,
                                2
                              )}
                              ,
                            </p>
                          </>
                        );
                      })}
                    </div>
                  </>
                );
              }
            )}
          </div>

          <p className="font-black text-lg">OTHER MOP SALES,</p>

          <div>
            {_xreading.othermop.map(
              (mop: {paymenttype: any; qty: any; amount: any; excess: any}) => {
                return (
                  <div className="flex justify-between">
                    <p className="font-black text-lg">{mop.paymenttype},</p>
                    <p className="font-black text-lg">{parseInt(mop.qty)},</p>
                    <p className="font-black text-lg">
                      {formatNumberWithCommasAndDecimals(mop.amount, 2)},
                    </p>
                  </div>
                );
              }
            )}
          </div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Beginning OR,</p>
            <p className="text-right font-black text-lg">
              {_xreading.docnum_summ.beg_or || ""},
            </p>
          </div>
          <div className="h-[50px]"></div>
          {header &&
            header.data &&
            header.data[0] &&
            header.data[0].business1 &&
            header.data[0].business1.length > 0 && (
              <p className="text-lg font-black">{header.data[0].business1},</p>
            )}
          {header &&
            header.data &&
            header.data[0] &&
            header.data[0].business2 &&
            header.data[0].business2.length > 0 && (
              <p className="text-lg font-black">{header.data[0].business2},</p>
            )}
          {header &&
            header.data &&
            header.data[0] &&
            header.data[0].business3 &&
            header.data[0].business3.length > 0 && (
              <p className="text-lg font-black">{header.data[0].business3},</p>
            )}

          <p className="  text-lg font-black">{(header.data[0].chknonvat ? "NON-VAT Reg." : "VAT Reg.") + ` TIN- ${header.data[0].tin}`},</p>
          <p className="  text-lg font-black">{header.data[0].address1},</p>
          <p className="  text-lg font-black">{header.data[0].address2},</p>
          <p className="  text-lg font-black">{header.data[0].address3},</p>
          <p className=" text-center text-lg font-black">
            MIN#{header.data[0].machineno} SN#{header.data[0].serialno},
          </p>

          <div className="flex flex-col">
            <p className="bold-text text-lg font-black ">X-READING,</p>
          </div>

          <div className="h-[50px]"></div>

          <div className="flex justify-between">
            <p className="font-black text-lg">Ending OR,</p>
            <p className="text-right font-black text-lg">
              {_xreading.docnum_summ.end_or || ""},
            </p>
          </div>
          <div className="flex flex-col">
            <p className="font-black text-lg">{dateNowFormatted()},</p>
            <p
              style={{fontSize: "22px"}}
              className="font-black text-lg  !important"
            >
              End of Cashier's Report,
            </p>
          </div>
          <div className=" pb-4 mt-4"></div>
        </div>
      </div>
    </>
  );
};

export default XReadPrintCSV;
