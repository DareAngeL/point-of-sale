/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment from "moment";
import {useEffect, useState} from "react";
import {useAppSelector} from "../../../../store/store";
import {formatNumberWithCommasAndDecimals} from "../../../../helper/NumberFormat";
import {PosfileModel} from "../../../../models/posfile";
import { receiptDefiner } from "../../../../helper/ReceiptNumberFormatter";

interface VoidReceiptProps {
  voidPosfile: any;
  isReprint?: boolean;
}

export function VoidReceipt({ isReprint }: VoidReceiptProps) {
  const {header, dineType, footer, syspar} = useAppSelector(
    (state) => state.masterfile
  );
  const {orderDiscountByCode} = useAppSelector(
    (state) => state.order
  );

  const [findActiveDineType, setFindActiveDineType] = useState<any>();

  const {allPOSVoid} = useAppSelector((state) => state.void);
  const {voidChange, voidPayment, voidSCharge, voidTotal, voidPosfiles} =
    allPOSVoid.data;

  useEffect(() => {

    if(voidPosfiles){
      const findActive = dineType?.data?.find(
        (dt) => dt.postypcde == voidPosfiles[0].postypcde
      ) || {};

      setFindActiveDineType(findActive);
    }

  }, [dineType]);

  
  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;

  const [dineInDTypePosfiles, setDineInDTypePosfiles] = useState<{
    [index: string]: PosfileModel[];
  }>({});
  const [takeoutDTypePosfiles, setTakeoutDTypePosfiles] = useState<{
    [index: string]: PosfileModel[];
  }>({});

  const [lessVat, setLessVatAdj] = useState<number>(0);

  const computeLessVat = () => {
    const totalLessVat = voidPosfiles.reduce(
      (acc: number, posfile: PosfileModel) => {
        if (posfile && posfile.lessvat) {
          return acc + parseFloat(posfile?.lessvat as any);
        }
      },
      0
    );
    setLessVatAdj(totalLessVat);
  };

  useEffect(() => {
    if (voidPosfiles) {
      const posfilesMapped = voidPosfiles
        .map((pf: any) => {
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
      computeLessVat();
    }
  }, [allPOSVoid, orderDiscountByCode]);

  const computeSalesWOVat = () => {
    return formatNumberWithCommasAndDecimals(
      (voidTotal?.groext as number) / 1.12,
      2
    );
  };

  const handleGroupingDiscountHolders = () => {
    const cards = voidPosfiles.reduce((acc: {[cardno: string]: {itmcde: string, cardholder: string, cardno: string}}, curr: PosfileModel) => {
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

    return Object.values(cards).flat().map((item: any) => {
      return  (
        <div>
          <p className=" ">Discount: {item.itmcde}</p>
          <p className="ms-5">Card No.: {item.cardno}</p>
          <p className="ms-5">Card Holder: {item.cardholder}</p>
        </div>
      )
    })
  }

  // const paymentDisplayer = (payment: PosfileModel) => {
  //   if (payment.itmcde === "CARD") {
  //     tableInput(payment.cardclass!, formatNumberWithCommasAndDecimals(payment.extprc as number, 2));
  //     tableInput("CARD NUMBER:", `***${payment.cardno!.substring(payment.cardno!.length - Math.min(4, payment.cardno!.length))}`);
  //     tableInput("CARD HOLDER NAME:", payment.cardholder!);
  //     tableInput("APPROVAL CODE:", payment.approvalcode!);
  //   } else {
  //     tableInput(payment.itmcde!, formatNumberWithCommasAndDecimals(payment.amount as number, 2));
  //   }
  // }

  // useEffect(() => {}, [previousPosfile, previousPosfiles]);

  return (
    <>
      <div
        id="voidreceipt"
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
          <p>{receiptDefiner(syspar.data[0].receipt_title || 0,voidTotal?.ordocnum || "") }</p>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          <div className="flex justify-between">
            <p className="">CASHIER: {voidTotal?.cashier}</p>
            <p className="">SERVER: {voidTotal?.cashier}</p>
          </div>
          <p className="pt-5"></p>

          <div className="font-black mb-2">
            <p className=" text-center">** VOID **</p>
          </div>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className="font-black mb-2">
            <p className=" text-center">{findActiveDineType?.postypdsc}</p>
            {findActiveDineType?.ordertyp === 'DINEIN' && (
              <p className=" text-center">({findActiveDineType?.ordertyp})</p>
            )}
          </div>

          {/* POSFILES */}

          {/* DINEIN */}
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
                                  item.itmqty as number
                                )}
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>

                            {item.discount.distyp === "Percent" ? (
                              <div className="mx-7 text-[12px]">
                                * {item.discount.discde} @{" "}
                                {item.discount.disper}%
                              </div>
                            ) : (
                              <div className="mx-7 text-[12px]">
                                * {item.discount.discde} @{" "}
                                {item.discount.disamt}
                              </div>
                            )}
                          </div>

                          <p>
                            {formatNumberWithCommasAndDecimals(
                              item.untprc as number,
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
                                      item.itmqty as number
                                    )}
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>

                                <div className="flex w-full justify-between">
                                  <p className="mx-[70px]">* UPGRADE</p>
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
                                  item.itmqty as number
                                )}
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>
                          </div>

                          <div className="flex">
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
                          {/* if a combo meal */}
                          {item.itmcomtyp !== null ? (
                            <div className="flex flex-col justify-between w-full text-[12px]">
                              {item.itmcomtyp === "UPGRADE" ? (
                                <>
                                  <div className="flex mx-7">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.itmqty as number
                                      )}
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>

                                  <div className="flex w-full justify-between">
                                    <p className="mx-[70px]">* UPGRADE</p>
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
                            item.isaddon === 0 && (
                              <>
                                <div className="flex flex-col mx-1 ">
                                  {isItemNumEnabled === 1 && (
                                    <p>{item.itmnum}</p>
                                  )}
                                  <div className="flex ">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.itmqty as number
                                      )}
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <p>
                                    {formatNumberWithCommasAndDecimals(
                                      item.untprc as number,
                                      2
                                    )}
                                  </p>
                                </div>
                              </>
                            )
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
                      {formatNumberWithCommasAndDecimals(
                        item.untprc as number,
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
                          <div className=" flex-col">
                            <div className="flex mx-1">
                              <p className="px-1">
                                {formatNumberWithCommasAndDecimals(
                                  item.itmqty as number
                                )}
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>

                            {item.discount.distyp === "Percent" ? (
                              <div className="mx-7 text-[12px]">
                                * {item.discount.discde} @{" "}
                                {item.discount.disper}%
                              </div>
                            ) : (
                              <div className="mx-7 text-[12px]">
                                * {item.discount.discde} @{" "}
                                {item.discount.disamt}
                              </div>
                            )}
                          </div>

                          <p>
                            {formatNumberWithCommasAndDecimals(
                              item.untprc as number,
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
                                      item.itmqty as number
                                    )}
                                  </p>
                                  <p>{item.itmdsc}</p>
                                </div>

                                <div className="flex w-full justify-between">
                                  <p className="mx-[70px]">* UPGRADE</p>
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
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* no discount */}
                      {/* check if base item  */}
                      {item.chkcombo === 1 ? (
                        <>
                          <div className="flex justify-between w-full">
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

                          <div className="flex">
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
                          {/* if a combo meal */}
                          {item.itmcomtyp !== null ? (
                            <div className="flex flex-col justify-between w-full text-[12px]">
                              {item.itmcomtyp === "UPGRADE" ? (
                                <>
                                  <div className="flex mx-7">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.itmqty as number
                                      )}
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>

                                  <div className="flex w-full justify-between">
                                    <p className="mx-[70px]">* UPGRADE</p>
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
                            item.isaddon === 0 && (
                              <>
                                <div className="flex flex-col mx-1">
                                  {isItemNumEnabled === 1 && (
                                    <p>{item.itmnum}</p>
                                  )}
                                  <div className="flex ">
                                    <p className="px-1">
                                      {formatNumberWithCommasAndDecimals(
                                        item.itmqty as number
                                      )}
                                    </p>
                                    <p>{item.itmdsc}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <p>
                                    {formatNumberWithCommasAndDecimals(
                                      item.untprc as number,
                                      2
                                    )}
                                  </p>
                                </div>
                              </>
                            )
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
                        item.untprc as number,
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

          {/* <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div> */}

          {/* SUBTOTALS */}

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          <div className=" flex justify-between">
            <p className=" ">SUBTOTAL</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                voidTotal?.groext as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">Less VAT (SC/PWD)</p>
            <p className=" ">
              -{formatNumberWithCommasAndDecimals(lessVat || 0, 2)}
            </p>
          </div>

          {voidTotal?.vatexempt as number > 0 && (
            <div className=" flex justify-between">
              <p className=" ">Sales without VAT</p>
              <p className=" ">{computeSalesWOVat()}</p>
            </div>
          )}

          {(voidTotal?.disamt as number) > 0 &&
            Object.keys(dineInDTypePosfiles).map((key) => {
              return dineInDTypePosfiles[key].map((item) => {
                if (item.discount && item.itmcomtyp === null) {
                  return (
                    <div className=" flex justify-between">
                      <p className=" ">{item?.discount?.discde as any}</p>
                      <p className=" ">
                        -
                        {formatNumberWithCommasAndDecimals(
                          item?.discount?.amtdis as any,
                          2
                        )}
                      </p>
                    </div>
                  );
                }
              });
            })}

          {(voidTotal?.disamt as number) > 0 &&
            Object.keys(takeoutDTypePosfiles).map((key) => {
              return takeoutDTypePosfiles[key].map((item) => {
                if (item.discount && item.itmcomtyp === null) {
                  return (
                    <div className=" flex justify-between">
                      <p className=" ">{item?.discount?.discde as any}</p>
                      <p className=" ">
                        -
                        {formatNumberWithCommasAndDecimals(
                          item?.discount?.amtdis as any,
                          2
                        )}
                      </p>
                    </div>
                  );
                }
              });
            })}

          <div className=" flex justify-between">
            <p className=" ">SERVICE CHARGE</p>
            <p>
              {formatNumberWithCommasAndDecimals(voidSCharge?.scharge || 0, 2)}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">AMOUNT DUE</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                parseFloat(voidTotal?.extprc + "") +
                  parseFloat(voidSCharge?.scharge || 0 + ""),
                2
              )}
            </p>
          </div>

          {/* <div className=" flex flex-col justify-between">
            {voidPayment &&
              voidPayment.map((d: PosfileModel) => (
                // paymentDisplayer(d)
              ))}
          </div> */}

          <div className=" flex justify-between">
            <p className=" ">CHANGE</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(voidChange?.extprc || 0, 2)}
            </p>
          </div>

          <div className="">
            <p className="text-center">
              **{" "}
              {voidPosfiles &&
                voidPosfiles.filter(
                  (item: PosfileModel) => item.itmcomtyp === null
                ).length}{" "}
              PRODUCT(S) PURCHASED **
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
                voidTotal?.netvatamt as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">VAT Amount</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                voidTotal?.vatamt as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">VAT Exempted Sales</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                voidTotal?.vatexempt as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">Zero-Rated Sales</p>
            <p className=" ">{formatNumberWithCommasAndDecimals(0.0, 2)}</p>
          </div>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          {voidTotal?.disamt as number > 0 && handleGroupingDiscountHolders()}

          <p className=" ">Customer's Name: {voidPayment?.[0].customername}</p>
          <p className=" ">Address: {voidPayment?.[0].address}</p>
          <p className=" ">Contact No.: {voidPayment?.[0].contactno}</p>
          <p className=" ">TIN: {voidPayment?.[0].tin}</p>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          {/* ENDER */}
          <p className="text-center">Official Receipt</p>
          <p className="text-center">
            {moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
              "MM/DD/YYYY h:mm:ss A"
            )}
          </p>
          <p className="text-center">Thank you. Come again!</p>

          <div className="font-black mb-2">
            <p className=" text-center">** VOID **</p>
          </div>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

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
          <div className="h-[20px]"></div>
          {isReprint && (
            <p className="font-black mb-2 text-center">[ THIS IS A REPRINTED RECEIPT ]</p>
          )}
        </div>
      </div>
    </>
  );
}
