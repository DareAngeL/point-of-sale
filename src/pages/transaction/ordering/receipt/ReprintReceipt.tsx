import moment from "moment";
import {useAppSelector} from "../../../../store/store";
import {formatNumberWithCommasAndDecimals} from "../../../../helper/NumberFormat";
import { receiptDefiner } from "../../../../helper/ReceiptNumberFormatter";
import { PosfileModel } from "../../../../models/posfile";

export function ReprintReceipt() {
  const {
    previousPosfile,
    previousPosfiles,
    transaction,
    previousVat,
    orderDiscountByCode,
    changeByCode,
    paymentByCode,
  } = useAppSelector((state) => state.order);

  const defineReceiptNumber = () =>  receiptDefiner(syspar.data[0].receipt_title || 0, previousPosfile.data?.ordocnum || "");
  

  const {header, dineType, footer} = useAppSelector(
    (state) => state.masterfile
  );
  const {syspar} = useAppSelector((state) => state.masterfile);
  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const {account} = useAppSelector((state) => state.account);

  const findActiveDineType = dineType.data.find(
    (dt) => dt.postypcde == transaction.data?.postypcde
  );

  const orderingEntry = previousPosfiles.data.map((pf) => {
    const entry = orderDiscountByCode.data.find(
      (od) => pf.orderitmid == od.orderitmid
    );
    return {...pf, discount: entry};
  });

  const handleGroupingDiscountHolders = () => {
    const cards = previousPosfiles.data.reduce((acc: {[cardno: string]: {itmcde: string, cardholder: string, cardno: string}}, curr: PosfileModel) => {
      if (curr.posDiscount) {
        curr.posDiscount.forEach((d) => {
          if (!d.cardno) return;

          if (!acc[d.cardno]) {
            acc[d.cardno] = {
              itmcde: d.itmcde,
              cardholder: d.cardholder,
              cardno: d.cardno
            }
          }
        })
      }
      return acc;
    }, {} as {[cardno: string]: {itmcde: string, cardholder: string, cardno: string}})

    return Object.values(cards).flat().map((item) => {
      return  (
        <div>
          <p className=" ">Discount: {item.itmcde}</p>
          <p className="ms-5">Card No.: {item.cardno}</p>
          <p className="ms-5">Card Holder: {item.cardholder}</p>
        </div>
      )
    })
  }

  return (
    <>
      <div
        id="reprint-receipt"
        className="w-full flex justify-center items-center font-montserrat"
      >
        <div id="content" className=" w-[400px] h-full">
          <p className=" text-center font-black">{header.data[0].business1}</p>
          {/* <p className=" text-center font-black">{header.data[0].business2}</p> */}
          <p className=" text-center font-black">{header.data[0].business3}</p>
          <p className=" text-center font-black">{(header.data[0].chknonvat ? "NON-VAT Reg." : "VAT Reg.") + ` TIN- ${header.data[0].tin}`}</p>
          <p className=" text-center font-black">{header.data[0].address1}</p>
          <p className=" text-center font-black">{header.data[0].address2}</p>
          <p className=" text-center font-black">{header.data[0].address3}</p>
          <p className=" text-center font-black">
            MIN#{header.data[0].machineno} SN#{header.data[0].serialno}
          </p>

          <p className="pt-5">CUSTOMER: {previousPosfile.data?.customername}</p>
          <p>{defineReceiptNumber()}</p>
          <p>PAX: {transaction?.data?.paxcount}</p>

          <div className="flex justify-between">
            <p className="">CASHIER: {account.data?.usrname}</p>
            <p className="">SERVER: {account.data?.usrname}</p>
          </div>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          <div className="font-black mb-2">
            <p className=" text-center">{findActiveDineType?.postypdsc}</p>
            <p className=" text-center">({findActiveDineType?.ordertyp})</p>
          </div>

          {/* POSFILES */}

          {orderingEntry.map((item) => (
            <div className="flex justify-between">
              {item.discount ? (
                <>
                  <div className=" flex-col">
                    {isItemNumEnabled === 1 && <p>{item.itmnum}</p>}
                    <div className="flex mx-1">
                      <p>{item.itmdsc}</p>
                    </div>
                    <div className="pl-6">
                      {item.discount.discde} @ {item.discount.disper}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    {item.itmnum && item.itmnum?.length > 0 && <br />}
                    <p>
                      {formatNumberWithCommasAndDecimals(
                        item.untprc as number,
                        2
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col">
                    {isItemNumEnabled === 1 && <p>{item.itmnum}</p>}
                    <div className="flex mx-1">
                      <p className="px-1">
                        {formatNumberWithCommasAndDecimals(
                          item.itmqty as number
                        )}
                      </p>
                      <p>{item.itmdsc}</p>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    {item.itmnum && item.itmnum?.length > 0 && <br />}
                    <p>
                      {formatNumberWithCommasAndDecimals(
                        item.untprc as number,
                        2
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          {/* SUBTOTALS */}

          <div className=" flex justify-between">
            <p className=" ">SUBTOTAL</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                previousPosfile?.data?.untprc as number
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">Less VAT (SC/PWD)</p>
            <p className=" ">
              -
              {formatNumberWithCommasAndDecimals(
                previousVat.data?.untprc as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">Sales without VAT</p>
            <p className=" ">
              {(previousPosfile?.data?.disamt as number) > 0
                ? formatNumberWithCommasAndDecimals(
                    (previousPosfile?.data?.untprc || 0) -
                      (previousVat.data?.untprc || 0),
                    2
                  )
                : 0}
            </p>
          </div>

          {(previousPosfile?.data?.disamt as number) > 0 && (
            <>
              <div className=" flex justify-between ">
                <p className=" ">Discount</p>
                <p className=" ">
                  -
                  {formatNumberWithCommasAndDecimals(
                    previousPosfile?.data?.disamt as number,
                    2
                  )}
                </p>
              </div>
            </>
          )}

          <div className=" flex justify-between">
            <p className=" ">SERVICE CHARGE</p>
            <p className=" ">0.00</p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">AMOUNT DUE</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                (previousPosfile?.data?.untprc || 0) -
                  (previousVat.data?.untprc || 0) -
                  (previousPosfile.data?.disamt || 0),
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">{paymentByCode.data?.itmcde}</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                paymentByCode.data?.extprc as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">CHANGE</p>
            <p className=" ">{changeByCode.data?.extprc || 0}</p>
          </div>

          <div className="">
            <p className="text-center">
              ** {previousPosfiles.data.length} PRODUCT(S) PURCHASED **
            </p>
          </div>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          {/* VAT ANALYSIS */}

          <p className=" text-center">VAT ANALYSIS</p>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          <div className=" flex justify-between">
            <p className=" ">VATable Sales</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                previousPosfile.data?.netvatamt as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">VAT Amount</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                previousPosfile.data?.vatamt as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">VAT Exempted Sales</p>
            <p className=" ">
              {(previousPosfile?.data?.disamt as number) > 0
                ? formatNumberWithCommasAndDecimals(
                    (previousPosfile?.data?.untprc || 0) -
                      (previousVat.data?.untprc || 0),
                    2
                  )
                : 0}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">Zero-Rated Sales</p>
            <p className=" ">{formatNumberWithCommasAndDecimals(0.0, 2)}</p>
          </div>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          {previousPosfile?.data?.disamt as number > 0 && handleGroupingDiscountHolders()}

          <p className=" ">
            Customer's Name: {paymentByCode?.data?.customername}
          </p>
          <p className=" ">Address: {paymentByCode?.data?.address}</p>
          <p className=" ">Contact No.: {paymentByCode?.data?.cuscde}</p>
          <p className=" ">TIN: {paymentByCode?.data?.tin}</p>

          {/* ENDER */}
          <p className="text-center">Official Receipt</p>
          <p className="text-center">
            {moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
              "MM/DD/YYYY h:mm:ss A"
            )}
          </p>
          <p className="text-center">Thank you. Come again!</p>

          <p className=" ">POS PROVIDER</p>
          <p>{footer.data[0].supname}</p>
          <p className=" ">{footer.data[0].supaddress}</p>
          {/* <p className=" ">46 Col Espiritu Tinajeros Malabon City</p> */}
          <p className=" ">TIN: {footer.data[0].supvarregtin}</p>
          <p className=" ">Accre: #{footer.data[0].accrenum}</p>
          <p className=" ">
            Issued: {moment(footer.data[0].accredate).format("MM/DD/YYYY")}
          </p>
          <p className=" ">
            Valid Until:{" "}
            {moment(footer.data[0].accredate)
              .add(footer.data[0].validyr, "years")
              .format("MM/DD/YYYY")}
          </p>
          <p className=" ">Permit# {footer.data[0].permitnum}</p>
          <p className=" ">Date Issued: {footer.data[0].dateissued}</p>
        </div>
      </div>
    </>
  );
}
