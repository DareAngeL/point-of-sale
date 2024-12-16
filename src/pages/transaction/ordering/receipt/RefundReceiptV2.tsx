/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment from "moment";
import {useAppSelector} from "../../../../store/store";
import {formatNumberWithCommasAndDecimals} from "../../../../helper/NumberFormat";
import {useEffect, useState} from "react";
import {PosfileModel} from "../../../../models/posfile";
import _ from "lodash";
import { receiptDefiner } from "../../../../helper/ReceiptNumberFormatter";
import { CardDetails } from "../../../../reducer/paymentSlice";

interface RefundReceiptProps {
  voidPosfile: any;
  isReprint?: boolean;
  modeOfRefund?: string;
  cardDetails?: CardDetails;
}

export function RefundReceiptV2({isReprint, modeOfRefund, cardDetails}: RefundReceiptProps) {
  const {header, dineType, footer, syspar} = useAppSelector(
    (state) => state.masterfile
  );

  // const {account} = useAppSelector(state => state.account);
  const {
    previousPosfile,
    previousPosfiles,
    // selectedRefundOrdercde,
    previousPayment,
    prevTranPayment: previousTrnsactionPayment,
    orderDiscountByCode,
    specialRequest,
  } = useAppSelector((state) => state.order);

  const isEnabledSpecRequest = syspar.data[0].enable_spcl_req_receipt;

  const {
    toRefund,
    refundReason,
    // refundItemList
  } = useAppSelector((state) => state.refund);
  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;

  const refundedData = isReprint ? previousPosfiles.data.filter((a: PosfileModel) => a.refund === 1) : toRefund.data;

  const [dineInDTypePosfiles, setDineInDTypePosfiles] = useState<{
    [index: string]: PosfileModel[];
  }>({});
  const [takeoutDTypePosfiles, setTakeoutDTypePosfiles] = useState<{
    [index: string]: PosfileModel[];
  }>({});

  const findActiveDineType = dineType.data.find(
    (dt) => dt.postypcde == previousPosfiles.data?.[0]?.postypcde
  );

  useEffect(() => {
    const posfilesMapped = refundedData
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

  const handleGroupingDiscounts = () => {
    const mergedPosfiles = {
      ...dineInDTypePosfiles,
      ...takeoutDTypePosfiles,
    };

    const groupedByDiscount = _.groupBy(
      _.flatMap(Object.values(mergedPosfiles)),
      (item: PosfileModel) => item.discount && item.discount.discde
    );

    return Object.keys(groupedByDiscount).map((discde) => {
      if (discde != "undefined") {
        const items = groupedByDiscount[discde];
        console.log("ayo", items);
        const totalDisamt: number = items.reduce(
          (total: number, item: any) => 
            total + ((parseFloat(item.disamt as any) || 0) / (item.itmqty!*1)) * (item.refundqty!*1),
          0
        );

        return (
          <div key={discde} className="flex justify-between   ">
            <p className="">{discde}</p>
            <p className="">{`-${formatNumberWithCommasAndDecimals(
              totalDisamt,
              2
            )}`}</p>
          </div>
        );
      }
    });
  };

  const handleGroupingDiscountHolders = () => {
    const cards = refundedData.reduce((acc: {[cardno: string]: {itmcde: string, cardholder: string, cardno: string, tin: string}}, curr: PosfileModel) => {
      if (curr.posDiscount) {
        curr.posDiscount.forEach((d) => {
          if (!d.cardno) return;

          if (!acc[d.cardno]) {
            acc[d.cardno] = {
              itmcde: d.itmcde,
              cardholder: d.cardholder,
              tin: d.tin,
              cardno: d.cardno
            }
          }
        })
      }
      return acc;
    }, {} as {[cardno: string]: {itmcde: string, cardholder: string, cardno: string, tin: string}})

    return Object.values(cards).flat().map((item: any) => {
      return  (
        <div>
          <p className=" ">Discount: {item.itmcde}</p>
          <p className="ms-5">Card No.: {item.cardno}</p>
          <p className="ms-5">Card Holder: {item.cardholder}</p>
          <p className="ms-5">TIN: {item.tin}</p>
          <p className="ms-5">Signature: _________________</p>
        </div>
      )
    })
  }

  const computeSubTotal = () => {
    const subTotal = refundedData.reduce((total, current: PosfileModel) => {
      if (!current.groext || !current.itmqty || !current.refundqty) return total + 0;

      return (
        total + current.groext / ((current.itmqty*1) - (current.refundqty - 1)) //parseFloat(current.untprc as any) * (current.refundqty as any)
      );
    }, 0);
    return subTotal;
  };

  const computeLessVat = () => {
    const lessvat = refundedData.reduce((lessvat, current: PosfileModel) => {
      return current.lessvat!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + lessvat;
    }, 0);

    return lessvat;
  }

  const computeSalesWOVat = () => {
    const salesWOVat = refundedData.reduce((salesWOVat, current: PosfileModel) => {
      return current.vatexempt!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + salesWOVat;
    }, 0);

    return salesWOVat;
  }

  const computeSCharge = () => {
    const sCharge = refundedData.reduce((sCharge, current: PosfileModel) => {
      return current.scharge!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + sCharge;
    }, 0);

    return sCharge;
  }

  const computeSchargeDisc = () => {
    const sChargeDisc = refundedData.reduce((sChargeDisc, current: PosfileModel) => {
      return current.scharge_disc!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + sChargeDisc;
    }, 0);

    return sChargeDisc;
  }

  const computeAmtDue = () => {
    const amtDue = refundedData.reduce((amtDue, current: PosfileModel) => {
      return (current.extprc!*1 + current.scharge!*1 - current.scharge_disc!*1) / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + amtDue;
    }, 0);

    return amtDue;
  }

  const paymentDisplayer = (payment: PosfileModel) => {
    const isCard = isReprint ? payment.itmcde === "CARD" : modeOfRefund === "CARD";

    if (isCard) {
      return (
        <>
          <div className="flex justify-between">
            <p className=" ">{isReprint ? payment?.cardclass : cardDetails?.cardclass}</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(isReprint ? payment.extprc as number : computeAmtDue(), 2)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className=" ">CARD NUMBER:</p>
            <p className=" ">
              ***{(isReprint ? payment!.cardno! : cardDetails?.cardno)?.substring((isReprint ? payment!.cardno! : cardDetails!.cardno).length - Math.min(4, (isReprint ? payment!.cardno! : cardDetails!.cardno).length))}
            </p>
          </div>
          <div className="flex justify-between">
            <p className=" ">CARD HOLDER NAME:</p>
            <p className=" ">
              {(isReprint ? payment!.cardholder : cardDetails?.cardholder)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className=" ">APPROVAL CODE:</p>
            <p className=" ">
              {(isReprint ? payment!.approvalcode! : cardDetails?.approvalcode)}
            </p>
          </div>
        </>
      )
    } else {
      return (
        <div className="flex justify-between">
          <p className="">
              {isReprint ? payment.itmcde : modeOfRefund}
          </p>
          <p className=" ">
            {formatNumberWithCommasAndDecimals(computeAmtDue(), 2)}
          </p>
        </div>
      )
    }
  }

  const receiptItemsUI = (item: PosfileModel) => {
    return (
      <>
        <div className="flex justify-between">
          {/* REGION: ITEMS THAT HAS DISCOUNTS */}
          {item.discount ? (
            <>
              {/* not combo meal with discount*/}
              {item.itmcomtyp === null && item.isaddon === 0 ? (
                <div className="flex flex-col w-full">
                  {isItemNumEnabled === 1 && <p className="px-2">{item.itmnum}</p>}
                  <div className="flex w-full">
                    <div className="flex mx-1">
                      <p className="px-2">
                        {formatNumberWithCommasAndDecimals(
                          item.refundqty as number
                        )}x
                      </p>
                      <p>{item.itmdsc}</p>
                    </div>

                    <p className="ms-auto">
                      {/* {formatNumberWithCommasAndDecimals(
                        ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.refundqty as number),
                        2
                      )} */}
                      {formatNumberWithCommasAndDecimals(
                        (item.extprc && item.itmqty && item.refundqty) ?
                        (item.untprc as number) * (item.itmqty as number) / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                        2
                      )}
                      {item.taxcde === "VATABLE" ? "V" : "N"}
                    </p>

                  </div>

                  {item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '' && (
                    <div className="ps-8">
                      <p>{item.itemfile?.itmdscforeign}</p>
                    </div>
                  )}

                  {isEnabledSpecRequest ? specialRequest.data
                    .filter(f => f.orderitmid === item.orderitmid)
                    .map((sr) => (
                      <div className="flex w-full ps-7 text-[12px]">
                        <span>* Special Request/Remarks: {sr.modcde}</span>
                      </div>
                    ))
                  : null
                  }

                  {item.discount.distyp === "Percent" ? (
                    <div className="flex w-full ps-7 text-[12px]">
                      <span>* {item.discount.discde} @ {item.discount.disper}%</span>
                      <span className="ms-auto font-bold">(-{formatNumberWithCommasAndDecimals((item.disamt as number) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})</span>
                    </div>
                  ) : (
                    <div className="flex w-full ps-7 text-[12px]">
                      <span>* {item.discount.discde} @ {item.discount.disamt}</span>
                      <span className="ms-auto font-bold">(-{formatNumberWithCommasAndDecimals(item.disamt as number / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})</span>
                    </div>
                  )}

                </div>
              ) : (
                <>
                  {/* combo meal with discount */}
                  <div className="flex flex-col justify-between w-full text-[12px]">
                    {isItemNumEnabled === 1 && <p className="px-2">{item.itmnum}</p>}
                    {item.itmcomtyp === "UPGRADE" ? (
                      <>
                        <div className="flex mx-7">
                          <p className="px-2">
                            {formatNumberWithCommasAndDecimals(
                              item.itmqty as number
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
                            {item.taxcde === "VATABLE" ? "V" : "N"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {item.isaddon === 0 && (
                          <div className="flex flex-col">
                            {isItemNumEnabled === 1 && <p className="px-2">{item.itmnum}</p>}
                            <div className="flex mx-7">
                              <p className="px-2">
                                {formatNumberWithCommasAndDecimals(
                                  item.refundqty as number
                                )}x
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          ) 
          /* END-REGION: ITEMS THAT HAS DISCOUNTS */
          : (
            // REGION: NO DISCOUNT ITEMS
            <>
              {/* check if base item  */}
              {item.chkcombo === 1 ? (
                <div className="flex flex-col w-full">
                  {isItemNumEnabled === 1 && <p className="px-2">{item.itmnum}</p>}
                  <div className="flex justify-between w-full">
                    <div className="flex mx-1">
                      <p className="px-2">
                        {formatNumberWithCommasAndDecimals(
                          item.refundqty as number
                        )}x
                      </p>
                      <p>{item.itmdsc}</p>
                    </div>

                    <p className="ms-auto">
                      {formatNumberWithCommasAndDecimals(
                        ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.refundqty as number),
                        2
                      )}
                      <span className="ms-1">{item.taxcde === "VATABLE" ? "V" : " N"}</span>
                    </p>
                  </div>

                  {item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '' && (
                    <div className="ps-8">
                      <p>{item.itemfile?.itmdscforeign}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* if a combo meal */}
                  {item.itmcomtyp !== null ? (
                    <div className="flex flex-col justify-between w-full text-[12px]">
                      {item.itmcomtyp === "UPGRADE" ? (
                        <>
                          {isEnabledSpecRequest ? specialRequest.data
                            .filter(f => f.orderitmid === item.orderitmid)
                            .map((sr) => (
                              <div className="flex w-full ps-7 text-[12px]">
                                <span>* Special Request/Remarks: {sr.modcde}</span>
                              </div>
                            ))
                            : null
                          }

                          <div className="flex mx-7">
                            <p className="px-2">
                              {formatNumberWithCommasAndDecimals(
                                item.itmqty as number
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
                              {item.taxcde === "VATABLE" ? "V" : "N"}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {isEnabledSpecRequest ? specialRequest.data
                            .filter(f => f.orderitmid === item.orderitmid)
                            .map((sr) => (
                              <div className="flex w-full ps-7 text-[12px]">
                                <span>* Special Request/Remarks: {sr.modcde}</span>
                              </div>
                            ))
                            : null
                          }

                          <div className="flex  mx-7">
                            <p className="px-2">
                              {formatNumberWithCommasAndDecimals(
                                item.itmqty as number
                              )}x
                            </p>
                            <p>{item.itmdsc}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    item.isaddon === 0 && (
                      <>
                        <div className="flex flex-col w-full">
                          {isItemNumEnabled === 1 && <p className="px-2">{item.itmnum}</p>}
                          <div className="flex w-full">
                            <div className="flex mx-1">
                              <p className="px-2">
                                {formatNumberWithCommasAndDecimals(
                                  item.refundqty as number
                                )}x
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>
                            
                            <p className="ms-auto">
                              {/* {formatNumberWithCommasAndDecimals(
                                ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                                2
                              )} */}
                              {formatNumberWithCommasAndDecimals(
                                (item.extprc && item.itmqty && item.refundqty) ?
                                (item.untprc as number) * (item.itmqty as number) / ((item.itmqty*1) - (item.refundqty - 1)) : 0,
                                2
                              )}
                              {item.taxcde === "VATABLE" ? "V" : "N"}
                            </p>
                          </div>

                          {item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '' && (
                            <div className="ps-8">
                              <p>{item.itemfile?.itmdscforeign}</p>
                            </div>
                          )}

                          {isEnabledSpecRequest ? specialRequest.data
                            .filter(f => f.orderitmid === item.orderitmid)
                            .map((sr) => (
                              <div className="flex w-full ps-7 text-[12px]">
                                <span>* Special Request/Remarks: {sr.modcde}</span>
                              </div>
                            ))
                            : null
                          }
                        </div>
                      </>
                    )
                  )}
                </>
              )}
            </>
            // END-REGION: NO DISCOUNT ITEMS
          )}
        </div>

        {item.isaddon === 1 && (
          <>
            <div className="flex justify-between text-[12px]">
              <p className="mx-7">* Addon: {item.itmdsc}</p>
              <p className="pl-7">
                {formatNumberWithCommasAndDecimals((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number, 2)}
                {item.taxcde === "VATABLE" ? "V" : "N"}
              </p>
            </div>
            {item.discount && 
              (item.discount.distyp === "Percent" ? (
                <div className="flex w-full ps-10 text-[12px]">
                  <span>* {item.discount.discde} @ {item.discount.disper}%</span>
                  <span className="ms-auto font-bold">(-{formatNumberWithCommasAndDecimals(item.disamt as number, 2)})</span>
                </div>
              ) : (
                <div className="flex w-full ms-7 text-[12px]">
                  <span>* {item.discount.discde} @ {item.discount.disamt}</span>
                  <span className="ms-auto font-bold">(-{formatNumberWithCommasAndDecimals(item.disamt as number, 2)})</span>
                </div>
              ))
            }
          </>
        )}
      </>
    );
  }

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

          <p>{isReprint ? refundedData[0]?.refnum : syspar.data[0].refnum}</p>
          <p>{receiptDefiner(syspar.data[0].receipt_title || 0,previousPosfile.data?.ordocnum|| "")}</p>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className="font-black mb-2">
            <p className=" text-center">** REFUND **</p>
          </div>

          <div className="font-black mb-2">
            <p className=" text-center">{findActiveDineType?.postypdsc}</p>
            {findActiveDineType?.ordertyp === 'DINEIN' && (
              <p className=" text-center">({findActiveDineType?.ordertyp})</p>
            )}
          </div>
          {/* POSFILES */}

          {/* DINE IN */}
          {Object.keys(dineInDTypePosfiles).map((key) => {
            return dineInDTypePosfiles[key].map((item) => (
              receiptItemsUI(item)
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
              receiptItemsUI(item)
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

          <div className=" flex justify-between">
            <p className=" ">Less VAT (SC/PWD)</p>
            <p className=" ">
              -
              {formatNumberWithCommasAndDecimals(computeLessVat(), 2)}
            </p>
          </div>
          
          <div className=" flex justify-between">
            <p className=" ">Sales without VAT</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                computeSalesWOVat(),
                2
              )}
              {/* {computeSalesWOVat()} */}
            </p>
          </div>

          {handleGroupingDiscounts()}

          <div className=" flex justify-between">
            <p className=" ">SERVICE CHARGE</p>
            <p className=" ">
              {" "}
              {formatNumberWithCommasAndDecimals(
                computeSCharge(),
                2
              )}
            </p>
          </div>
          
          <div className=" flex justify-between pl-7">
            <p className=" ">Service Charge Discount</p>
            {/* <p className=" ">{formatNumberWithCommasAndDecimals(0.0, 2)}</p> */}
            <p>
              -
              {formatNumberWithCommasAndDecimals(
                computeSchargeDisc(),
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">AMOUNT DUE</p>
            <p className=" ">
                {formatNumberWithCommasAndDecimals(computeAmtDue(), 2)}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">Refund Reason</p>
            <p className=" ">{refundReason.data}</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">Mode of Refund</p>
          </div>
          
          {paymentDisplayer(previousPayment.data || {})}

          {/* <div className=" flex justify-between">
            <p className=" ">CHANGE</p>
            <p className=" ">{change.data?.balance || 0}</p>
          </div> */}
          <div className="">
            <p className="text-center">
              **{" "}
              {
                // previousPosfiles.data.filter((item) =>
                //   isReprint ? item.refund === 1 : item.refund === 0
                // ).length
                refundedData.length
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

          {previousPosfile?.data?.disamt as number > 0 && handleGroupingDiscountHolders()}

          <p className=" ">Customer's Name: {previousTrnsactionPayment.data?.customername}</p>
          <p className=" ">Address: {previousTrnsactionPayment.data?.address}</p>
          <p className=" ">Contact No.: {previousTrnsactionPayment.data?.contactno}</p>
          <p className=" ">TIN: {previousTrnsactionPayment.data?.tin}</p>
          {/* ENDER */}
          {/* <p className="text-center">Official Receipt</p> */}

          {syspar.data[0].receipt_title == 0 && footer.data[0].officialreceipt == 1 && <p className="text-center">Official Receipt</p>}

          {syspar.data[0].receipt_title == 0 && footer.data[0].officialreceipt == 0 && <>
            <p className="text-center">This is not an official receipt,</p>
            <p className="text-center">please ask for your manual OR</p>
          </>}

          {syspar.data[0].receipt_title == 1 && footer.data[0].officialreceipt == 1 && <p className="text-center">Recceipt Invoice</p>}


          {syspar.data[0].receipt_title == 1 && footer.data[0].officialreceipt == 0 && <>
            <p className="text-center">Not valid as Invoice, </p>
            <p className="text-center">please ask for manual invoice</p>
          </>}

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
