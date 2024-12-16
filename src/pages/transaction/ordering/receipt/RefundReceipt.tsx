import moment from "moment";
import {useAppSelector} from "../../../../store/store";
import {formatNumberWithCommasAndDecimals} from "../../../../helper/NumberFormat";
import {useEffect, useState} from "react";
import {PosfileModel} from "../../../../models/posfile";
import { receiptDefiner } from "../../../../helper/ReceiptNumberFormatter";

interface RefundReceiptProps {
  voidPosfile: any;
  isReprint?: boolean;
  modeOfRefund?: string;
}

export function RefundReceipt({isReprint, modeOfRefund}: RefundReceiptProps) {
  const {header, dineType, footer, syspar} = useAppSelector(
    (state) => state.masterfile
  );

  // const {account} = useAppSelector(state => state.account);
  const {
    transaction,
    previousPosfile,
    previousPosfiles,
    // selectedRefundOrdercde,
    previousPayment,
    orderDiscountByCode,
  } = useAppSelector((state) => state.order);

  // const {payment, change} = useAppSelector((state) => state.payment);
  const {
    toRefund,
    refundReason,
    // refundItemList
  } = useAppSelector((state) => state.refund);
  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;

  const [dineInDTypePosfiles, setDineInDTypePosfiles] = useState<{
    [index: string]: PosfileModel[];
  }>({});
  const [takeoutDTypePosfiles, setTakeoutDTypePosfiles] = useState<{
    [index: string]: PosfileModel[];
  }>({});

  const findActiveDineType = dineType.data.find(
    (dt) => dt.postypcde == transaction.data?.postypcde
  );

  useEffect(() => {
    const posfilesMapped = toRefund.data
      .filter((item) => (isReprint ? item.refund === 1 : item.refund === 0))
      .map((pf) => {
        const entry = orderDiscountByCode.data.find(
          (od) => pf.orderitmid == od.orderitmid
        );
        return {
          ...pf,
          discount: entry,
        };
      })
      .reduce((acc: any, curr: any) => {
        const key = curr.isaddon ? curr.mainitmid : curr.orderitmid;
        const prev = acc.recid ? ({} as any) : ({...acc} as any);

        if (!prev[key]) {
          prev[key] = [];
        }

        prev[key].push(curr);
        return prev;
      }, {}) as unknown as {[index: string]: PosfileModel[]};

    let dtypeposfiles = {};
    let ttypeposfiles = {};

    Object.keys(posfilesMapped).map((key) => {
      if (posfilesMapped[key][0].ordertyp === "DINEIN") {
        dtypeposfiles = {
          ...dtypeposfiles,
          [key]: posfilesMapped[key],
        };
      } else {
        ttypeposfiles = {
          ...ttypeposfiles,
          [key]: posfilesMapped[key],
        };
      }
    });

    setDineInDTypePosfiles(dtypeposfiles);
    setTakeoutDTypePosfiles(ttypeposfiles);
  }, [previousPosfiles]);

  console.log('xxxREF', syspar.data[0].refnum);
  console.log("watdafak", toRefund);
  console.log("xxx", dineInDTypePosfiles);
  console.log("luma", previousPosfile);

  // const computeSalesWOVat = () => {
  //   return formatNumberWithCommasAndDecimals(
  //     (previousPosfile?.data?.groext as number) / 1.12,
  //     2
  //   );
  // };

  const computeSubTotal = () => {
    const subTotal = toRefund.data.reduce((total, current: PosfileModel) => {
      if (!current.extprc || !current.itmqty || !current.refundqty) return total + 0;

      return (
        total + current.extprc / ((current.itmqty*1) - (current.refundqty - 1)) //parseFloat(current.untprc as any) * (current.refundqty as any)
      );
    }, 0);
    return subTotal;
  };

  const computeTotal = () => {
    return computeSubTotal();
  };

  return (
    <>
      <div
        id="refundreceipt"
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
          <p className="pt-5"></p>

          <p>{syspar.data[0].refnum}</p>
          <p>{receiptDefiner(syspar.data[0].receipt_title || 0,previousPosfile.data?.ordocnum|| "")}</p>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className="font-black mb-2">
            <p className=" text-center">** REFUND **</p>
          </div>

          <div className="font-black mb-2">
            <p className=" text-center">{findActiveDineType?.postypdsc}</p>
            <p className=" text-center">({findActiveDineType?.ordertyp})</p>
          </div>
          {/* POSFILES */}

          {/* DINE IN */}
          {Object.keys(dineInDTypePosfiles).map((key) => {
            return dineInDTypePosfiles[key].map((item) => (
              <>
                <div className="flex justify-between">
                  {item.discount ? (
                    <>
                      {/* not combo meal with discount*/}
                      {item.itmcomtyp === null ? (
                        <>
                          <div className="flex-col">
                            <div className="flex mx-1">
                              <p className="px-1">
                                {formatNumberWithCommasAndDecimals(
                                  item.refundqty as number
                                )}x
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>

                            <div className="mx-[70px] text-[12px]">
                              * {item.discount.discde} @ {item.discount.disper}
                            </div>
                          </div>

                          <p>
                            {/* {formatNumberWithCommasAndDecimals(
                              (item.refundqty as any) &&
                                (item?.refundqty as any) *
                                  parseFloat(item.untprc as any),
                              2
                            )} */}
                            {formatNumberWithCommasAndDecimals(
                              (item.extprc && item.itmqty && item.refundqty) ?
                              item.extprc / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                              2
                            )}
                          </p>
                        </>
                      ) : (
                        <>
                          {/* combo meal with discount */}
                          <div className="flex flex-col justify-between w-full text-[12px]">
                            {item.itmcomtyp === "UPGRADE" ? (
                              <>
                                <div className="flex mx-7">
                                  <p className="px-1">
                                    {formatNumberWithCommasAndDecimals(
                                      item.refundqty as number
                                    )}x
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>

                                <div className="flex w-full justify-between">
                                  <p className="mx-[70px]">* UPGRADE</p>
                                  <p>
                                    {formatNumberWithCommasAndDecimals(
                                      item.extprc as number,
                                      2
                                    )}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex  mx-7">
                                  <p className="px-1">
                                    {formatNumberWithCommasAndDecimals(
                                      item.refundqty as number
                                    )}x
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* check if base item  */}
                      {item.chkcombo === 1 ? (
                        <>
                          <div className="flex justify-between w-full">
                            {isItemNumEnabled === 1 && <p>{item.itmnum}</p>}
                            <div className="flex mx-1">
                              <p className="px-1">
                                {formatNumberWithCommasAndDecimals(
                                  item.refundqty as number
                                )}x
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>
                          </div>

                          <div className="flex">
                            <p>
                              {formatNumberWithCommasAndDecimals(
                                (item.extprc && item.itmqty && item.refundqty) ?
                                item.extprc / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                                2
                              )}
                              {/* {formatNumberWithCommasAndDecimals(
                                (item.refundqty as any) &&
                                  (item?.refundqty as any) *
                                    parseFloat(item.untprc as any),
                                2
                              )} */}
                              {/* {formatNumberWithCommasAndDecimals(
                                item.untprc as number,
                                2
                              )} */}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* if a combo meal */}
                          {item.itmcomtyp !== null ? (
                            <div className="flex flex-col justify-between w-full text-[12px]">
                              {item.itmcomtyp === "UPGRADE" ? (
                                <>
                                  <div className="flex mx-7">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.refundqty as number
                                      )}x
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>

                                  <div className="flex w-full justify-between">
                                    <p className="mx-[70px]">* UPGRADE</p>
                                    <p>
                                      {formatNumberWithCommasAndDecimals(
                                        item.extprc as number,
                                        2
                                      )}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex  mx-7">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.itmqty as number
                                      )}
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            // regular item
                            <>
                              <div className="flex flex-col mx-1 ">
                                {isItemNumEnabled === 1 && <p>{item.itmnum}</p>}
                                <div className="flex ">
                                  <p className="px-1">
                                    {formatNumberWithCommasAndDecimals(
                                      item.refundqty as number
                                    )}x
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <p>
                                  {/* {formatNumberWithCommasAndDecimals(
                                    (item.refundqty as any) &&
                                      (item?.refundqty as any) *
                                        parseFloat(item.untprc as any),
                                    2
                                  )} */}
                                  {formatNumberWithCommasAndDecimals(
                                    (item.extprc && item.itmqty && item.refundqty) ?
                                    item.extprc / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                                    2
                                  )}
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

                {item.isaddon === 1 && (
                  <div className="flex justify-between text-[12px]">
                    <p className="mx-[50px]">* Addon: {item.itmdsc}</p>
                    <p className="pl-7">
                      {" "}
                      {formatNumberWithCommasAndDecimals(
                        item.extprc as number,
                        2
                      )}
                    </p>
                  </div>
                )}
              </>
            ));
          })}
          {Object.keys(takeoutDTypePosfiles).length > 0 && isDineType === 0 && (
            <div className="border-t border-dashed border-gray-400 mt-4"></div>
          )}

          {/* TAKE OUT */}
          {Object.keys(takeoutDTypePosfiles).length > 0 && isDineType === 0 && (
            <p className="text-center font-bold">(TAKE OUT)</p>
          )}
          {Object.keys(takeoutDTypePosfiles).map((key) => {
            return takeoutDTypePosfiles[key].map((item) => (
              <>
                <div className="flex justify-between">
                  {item.discount ? (
                    <>
                      {/* not combo meal with discount*/}
                      {item.itmcomtyp === null ? (
                        <>
                          <div className="flex-col">
                            <div className="flex mx-1">
                              <p className="px-1">
                                {formatNumberWithCommasAndDecimals(
                                  item.refundqty as number
                                )}x
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>

                            <div className="mx-[70px] text-[12px]">
                              * {item.discount.discde} @ {item.discount.disper}
                            </div>
                          </div>

                          <p>
                            {/* {formatNumberWithCommasAndDecimals(
                              (item.refundqty as any) &&
                                (item?.refundqty as any) *
                                  parseFloat(item.untprc as any),
                              2
                            )} */}
                            {formatNumberWithCommasAndDecimals(
                              (item.extprc && item.itmqty && item.refundqty) ?
                              item.extprc / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                              2
                            )}
                          </p>
                        </>
                      ) : (
                        <>
                          {/* combo meal with discount */}
                          <div className="flex flex-col justify-between w-full text-[12px]">
                            {item.itmcomtyp === "UPGRADE" ? (
                              <>
                                <div className="flex mx-7">
                                  <p className="px-1">
                                    {formatNumberWithCommasAndDecimals(
                                      item.refundqty as number
                                    )}x
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>

                                <div className="flex w-full justify-between">
                                  <p className="mx-[70px]">* UPGRADE</p>
                                  <p>
                                    {formatNumberWithCommasAndDecimals(
                                      item.extprc as number,
                                      2
                                    )}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex  mx-7">
                                  <p className="px-1">
                                    {formatNumberWithCommasAndDecimals(
                                      item.refundqty as number
                                    )}x
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* check if base item  */}
                      {item.chkcombo === 1 ? (
                        <>
                          <div className="flex justify-between w-full">
                            {isItemNumEnabled === 1 && <p>{item.itmnum}</p>}
                            <div className="flex mx-1">
                              <p className="px-1">
                                {formatNumberWithCommasAndDecimals(
                                  item.refundqty as number
                                )}x
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>
                          </div>

                          <div className="flex">
                            <p>
                              {formatNumberWithCommasAndDecimals(
                                (item.extprc && item.itmqty && item.refundqty) ?
                                item.extprc / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                                2
                              )}
                              {/* {formatNumberWithCommasAndDecimals(
                                (item.refundqty as any) &&
                                  (item?.refundqty as any) *
                                    parseFloat(item.untprc as any),
                                2
                              )} */}
                              {/* {formatNumberWithCommasAndDecimals(
                                item.untprc as number,
                                2
                              )} */}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* if a combo meal */}
                          {item.itmcomtyp !== null ? (
                            <div className="flex flex-col justify-between w-full text-[12px]">
                              {item.itmcomtyp === "UPGRADE" ? (
                                <>
                                  <div className="flex mx-7">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.refundqty as number
                                      )}x
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>

                                  <div className="flex w-full justify-between">
                                    <p className="mx-[70px]">* UPGRADE</p>
                                    <p>
                                      {formatNumberWithCommasAndDecimals(
                                        item.extprc as number,
                                        2
                                      )}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex  mx-7">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.itmqty as number
                                      )}
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            // regular item
                            <>
                              <div className="flex flex-col mx-1 ">
                                {isItemNumEnabled === 1 && <p>{item.itmnum}</p>}
                                <div className="flex ">
                                  <p className="px-1">
                                    {formatNumberWithCommasAndDecimals(
                                      item.refundqty as number
                                    )}x
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <p>
                                  {/* {formatNumberWithCommasAndDecimals(
                                    (item.refundqty as any) &&
                                      (item?.refundqty as any) *
                                        parseFloat(item.untprc as any),
                                    2
                                  )} */}
                                  {formatNumberWithCommasAndDecimals(
                                    (item.extprc && item.itmqty && item.refundqty) ?
                                    item.extprc / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                                    2
                                  )}
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

                {item.isaddon === 1 && (
                  <div className="flex justify-between text-[12px]">
                    <p className="mx-[50px]">* Addon: {item.itmdsc}</p>
                    <p className="pl-7">
                      {" "}
                      {formatNumberWithCommasAndDecimals(
                        item.extprc as number,
                        2
                      )}
                    </p>
                  </div>
                )}
              </>
            ));
          })}

          {Object.keys(takeoutDTypePosfiles).length > 0 && (
            <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          )}

          {/* SUBTOTALS */}
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className=" flex justify-between">
            <p className=" ">SUBTOTAL</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(computeSubTotal(), 2)}
            </p>
          </div>
          {/* <div className=" flex justify-between">
            <p className=" ">Less VAT (SC/PWD)</p>
            <p className=" ">{computeSalesWOVat()}</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">Sales without VAT</p>
            <p className=" ">0.00</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">Sales without VAT</p>
            <p className=" ">0.00</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">Person with Disablity 20%</p>
            <p className=" ">0.00</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">SERVICE CHARGE</p>
            <p className=" ">0.00</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">AMOUNT DUE</p>
            <p className=" ">{props.voidPosfile?.groext}</p>
          </div> */}
          <div className=" flex justify-between">
            <p className=" ">Refund Reason</p>
            <p className=" ">{refundReason.data}</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">Mode of Refund</p>
          </div>
          <div className=" flex justify-between">
            <p className="">
              {isReprint ? previousPayment.data?.itmcde : modeOfRefund}
            </p>
            <p className=" ">
              {isReprint
                ? formatNumberWithCommasAndDecimals(
                    previousPayment?.data?.extprc || 0,
                    2
                  )
                : formatNumberWithCommasAndDecimals(computeTotal(), 2)}
            </p>
          </div>
          {/* <div className=" flex justify-between">
            <p className=" ">CHANGE</p>
            <p className=" ">{change.data?.balance || 0}</p>
          </div> */}
          <div className="">
            <p className="text-center">
              **{" "}
              {
                previousPosfiles.data.filter((item) =>
                  isReprint ? item.refund === 1 : item.refund === 0
                ).length
              }{" "}
              PRODUCT(S) REFUNDED **
            </p>
          </div>
          {/* <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div> */}
          {/* <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div> */}

          {/* VAT ANALYSIS */}
          {/* <p className=" text-center">VAT ANALYSIS</p>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className=" flex justify-between">
            <p className=" ">VATable Sales</p>
            <p className=" ">{previousPosfile.data?.vatrte}</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">VAT Amount</p>
            <p className=" ">{previousPosfile.data?.vatamt}</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">VAT Exempted Sales</p>
            <p className=" ">{0}</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">Zero-Rated Sales</p>
            <p className=" ">{0}</p>
          </div> */}
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          <p className=" ">Customer's Name: </p>
          <p className=" ">Address: </p>
          <p className=" ">Contact No.:</p>
          <p className=" ">TIN:</p>
          {/* ENDER */}
          <p className="text-center">Official Receipt</p>
          <p className="text-center">
            {moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
              "MM/DD/YYYY h:mm:ss A"
            )}
          </p>
          <p className="text-center">Thank you. Come again!</p>
          <div className="font-black mb-2">
            <p className=" text-center">** REFUND **</p>
          </div>
          <p className=" ">POS PROVIDER {footer.data[0].supname}</p>
          <p className=" ">{footer.data[0].supaddress}</p>
          {/* <p className=" ">46 Col Espiritu Tinajeros Malabon City</p> */}
          <p className=" ">{footer.data[0].supvarregtin}</p>
          <p className=" ">{footer.data[0].accrenum}</p>
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

          {isReprint && (
            <p className="font-black mb-2 text-center">
              [ THIS IS A REPRINTED RECEIPT ]
            </p>
          )}
          <div className="h-[20px]"></div>
        </div>
      </div>
    </>
  );
}
