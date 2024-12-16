/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useState} from "react";
import {formatNumberWithCommasAndDecimals} from "../../../../helper/NumberFormat";
import {useAppSelector} from "../../../../store/store";
import {PosfileModel} from "../../../../models/posfile";
import _ from "lodash";

export function PreviewReceipt() {
  const {header, dineType, syspar} = useAppSelector(
    (state) => state.masterfile
  );
  const {account} = useAppSelector((state) => state.account);
  const {
    posfileTOTAL: posfile,
    posfiles,
    transaction,
    lessVatAdj,
    orderDiscount,
    serviceCharge,
    serviceChargeDiscount,
    specialRequest,
  } = useAppSelector((state) => state.order);
  
  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;
  const isEnabledSpecRequest = syspar.data[0].enable_spcl_req_receipt;

  
  // const defineReceiptNumber = useMemo(() => receiptDefiner(syspar.data[0].receipt_title || 0, posfile.data?.ordocnum || ""), [syspar]);



  const [noDineTypePosfiles, setNoDineTypePosfiles] = useState<{
    [index: string]: PosfileModel[];
  }>({});
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
    const posfilesMapped = posfiles.data
      .map((pf) => {
        const entry = orderDiscount.data.find(
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

    setNoDineTypePosfiles(posfilesMapped);
    setDineInDTypePosfiles(dtypeposfiles);
    setTakeoutDTypePosfiles(ttypeposfiles);
  }, []);

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
                          item.itmqty as number
                        )}x
                      </p>
                      <p>{item.itmdsc}</p>
                    </div>

                    {item.freereason ? (
                       <p className="ms-auto">
                        {formatNumberWithCommasAndDecimals(0, 2)}
                        {item.taxcde === "VATABLE" ? "V" : "N"}
                      </p>
                    ) : (
                      <p className="ms-auto">
                        {formatNumberWithCommasAndDecimals(
                          (item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                          2
                        )}
                        {item.taxcde === "VATABLE" ? "V" : "N"}
                      </p>
                    )}

                  </div>

                  {item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '' && (
                    <div className="ps-8">
                      <p>{item.itemfile?.itmdscforeign}</p>
                    </div>
                  )}

                  {item.freereason && (
                    <div className="flex w-full ps-7 text-[12px]">
                      <span>Free Item: {item.freereason}</span>
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
                      <span className="ms-auto font-bold">(-{formatNumberWithCommasAndDecimals(item.disamt as number, 2)})</span>
                    </div>
                  ) : (
                    <div className="flex w-full ps-7 text-[12px]">
                      <span>* {item.discount.discde} @ {item.discount.disamt}</span>
                      <span className="ms-auto font-bold">(-{formatNumberWithCommasAndDecimals(item.disamt as number, 2)})</span>
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
                                  item.itmqty as number
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
                          item.itmqty as number
                        )}x
                      </p>
                      <p>{item.itmdsc}</p>
                    </div>

                    <p className="ms-auto">
                      {formatNumberWithCommasAndDecimals(
                        ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
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
                                  item.itmqty as number
                                )}x
                              </p>
                              <p>{item.itmdsc}</p>
                            </div>
                            
                            {item.freereason ? (
                              <p className="ms-auto">
                                {formatNumberWithCommasAndDecimals(0, 2)}
                                {item.taxcde === "VATABLE" ? "V" : "N"}
                              </p>
                            ) : (
                              <p className="ms-auto">
                                {formatNumberWithCommasAndDecimals(
                                  (item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                                  2
                                )}
                                {item.taxcde === "VATABLE" ? "V" : "N"}
                              </p>
                            )}
                          </div>

                          {item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '' && (
                            <div className="ps-8">
                              <p>{item.itemfile?.itmdscforeign}</p>
                            </div>
                          )}

                          {item.freereason && (
                            <div className="flex w-full ps-7 text-[12px]">
                              <span>Free Item: {item.freereason}</span>
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

  const listOfItemsViewWithEnabledDineType = () => (
    <>
      <div className="font-black mb-2">
        <p className=" text-center">{findActiveDineType?.postypdsc}</p>
        <div className="border-t border-dashed border-gray-400 mt-4"></div>
        {Object.keys(dineInDTypePosfiles).length > 0 && isDineType === 0 && (
          <p className="text-center">(DINE IN)</p>
        )}
      </div>
      {/* DINEIN */}
      {Object.keys(dineInDTypePosfiles).map((key) => {
        return dineInDTypePosfiles[key].map((item) => (
          receiptItemsUI(item)
        ));
      })}
      {Object.keys(dineInDTypePosfiles).length > 0 && (
        <div className="border-t border-dashed border-gray-400 mt-4"></div>
      )}

      {/* TAKE OUT */}
      {Object.keys(takeoutDTypePosfiles).length > 0 && (
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
    </>
  );

  const listOfItemsViewWithDisabledDineType = () => (
    <>
      <div className="font-black">
        <p className=" text-center">TRANSACTION</p>
        <div className="border-t border-dashed border-gray-400 mt-4"></div>
      </div>
      {Object.keys(noDineTypePosfiles).map((key) => {
        return noDineTypePosfiles[key].map((item) => (
          receiptItemsUI(item)
        ));
      })}
      <div className="border-t border-dashed border-gray-400 mt-4"></div>
    </>
  );

  const handleGroupingDiscounts = () => {
    if ((posfile?.data?.disamt as number) > 0) {
      const mergedPosfiles = {
        ...dineInDTypePosfiles,
        ...takeoutDTypePosfiles,
      };

      const groupedByDiscount = _.groupBy(
        _.flatMap(Object.values(mergedPosfiles)),
        (item: PosfileModel) => item.discount && item.discount.discde
      );

      console.log("wat", mergedPosfiles);

      console.log("sana gumana", groupedByDiscount);

      return Object.keys(groupedByDiscount).map((discde) => {
        if (discde != "undefined") {
          const items = groupedByDiscount[discde];
          console.log("ayo", items);
          const totalDisamt: number = items.reduce(
            (total: number, item: any) =>
              total + (parseFloat(item.disamt as any) || 0),
            0
          );

          return (
            <div key={discde} className="flex justify-between pl-7">
              <p className="">{discde}</p>
              <p className="">{`-${formatNumberWithCommasAndDecimals(
                totalDisamt,
                2
              )}`}</p>
            </div>
          );
        }
      });
    }
  };

  return (
    <>
      <div
        id="preview-receipt"
        className="w-full flex justify-center items-center font-montserrat"
      >
        <div id="content" className="w-[400px] h-full">
          <p className=" text-center font-black">{header.data[0].business1}</p>
          {/* <p className=" text-center font-black">{header.data[0].business2}</p> */}
          <p className=" text-center font-black">{header.data[0].business3}</p>
          <p className=" text-center font-black">{(header.data[0].chknonvat ? "NON-VAT Reg." : "VAT Reg.") + ` TIN- ${header.data[0].tin}`}</p>
          <p className=" text-center font-black">{header.data[0].address1}</p>
          <p className=" text-center font-black">{header.data[0].address2}</p>
          <p className=" text-center font-black">{header.data[0].address3}</p>
          <div className="flex justify-center">
            <p className=" text-center font-black">
              MIN#{header.data[0].machineno} SN#{header.data[0].serialno}
            </p>
          </div>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          <div className="flex justify-between">
            <p className="">CASHIER: {account.data?.usrname}</p>
            <p className="">SERVER: {account.data?.usrname}</p>
          </div>

          {isDineType === 0 && listOfItemsViewWithEnabledDineType()}
          {isDineType === 1 && listOfItemsViewWithDisabledDineType()}

          <div className="mt-5 flex justify-between">
            <p className=" ">SUBTOTAL</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                posfile?.data?.groext as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between pl-7">
            <p className=" ">Less VAT Adj.</p>
            <p className=" ">
              -
              {formatNumberWithCommasAndDecimals(
                lessVatAdj.data?.extprc as number,
                2
              )}
            </p>
          </div>

          {posfile.data?.vatexempt as number > 0 && (
            <div className=" flex justify-between pl-7">
              <p className=" ">Sales without VAT</p>
              <p className=" ">
                {formatNumberWithCommasAndDecimals(
                  posfile.data?.vatexempt as number,
                  2
                )}
                {/* {computeSalesWOVat()} */}
              </p>
            </div>
          )}

          {handleGroupingDiscounts()}

          <div className=" flex justify-between pl-7">
            <p className=" ">Service Charge</p>
            {/* <p className=" ">{formatNumberWithCommasAndDecimals(0.0, 2)}</p> */}
            <p>
              {formatNumberWithCommasAndDecimals(
                serviceCharge?.data?.extprc || 0,
                2
              )}
            </p>
          </div>

          {serviceChargeDiscount.data > 0 && (
            <div className=" flex justify-between pl-7">
              <p className=" ">Service Charge Discount</p>
              {/* <p className=" ">{formatNumberWithCommasAndDecimals(0.0, 2)}</p> */}
              <p>
                -
                {formatNumberWithCommasAndDecimals(
                  serviceChargeDiscount.data || 0,
                  2
                )}
              </p>
            </div>
          )}

          <div className=" flex justify-between pl-7">
            <p className=" ">Local Tax</p>
            <p className=" ">{formatNumberWithCommasAndDecimals(0.0, 2)}</p>
          </div>
          <div className=" flex justify-between">
            <p className=" ">TOTAL</p>
            <p className=" ">
              {/* {formatNumberWithCommasAndDecimals(posfile?.data?.extprc || 0, 2)} */}
              {posfile.data?.extprc &&
                formatNumberWithCommasAndDecimals(
                  parseFloat(posfile.data.extprc + ""),
                  2
                )}
              {/* {formatNumberWithCommasAndDecimals(
                (posfile?.data?.untprc || 0) -
                  (lessVatAdj.data?.untprc || 0) -
                  (posfile.data?.disamt || 0),
                2
              )} */}
            </p>
          </div>

          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          {/* VAT ANALYSIS */}

          <p className=" text-center font-black">VAT ANALYSIS</p>
          <div className="border-t border-dashed border-gray-400 pb-4 mt-4"></div>

          <div className=" flex justify-between">
            <p className=" ">VATable Sales</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                posfile.data?.netvatamt as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">VAT Amount</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                posfile.data?.vatamt as number,
                2
              )}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">VAT Exempted Sales</p>
            <p className=" ">
              {formatNumberWithCommasAndDecimals(
                parseFloat(posfile.data?.vatexempt as unknown as string) + parseFloat(serviceCharge.data?.extprc as unknown as string) - parseFloat(serviceChargeDiscount.data as unknown as string),
                2
              )}
              {/* {(posfile?.data?.disamt as number) > 0
                ? formatNumberWithCommasAndDecimals(
                    (posfile?.data?.untprc || 0) -
                      (lessVatAdj.data?.untprc || 0),
                    2
                  )
                : 0} */}
            </p>
          </div>

          <div className=" flex justify-between">
            <p className=" ">Zero-Rated Sales</p>
            <p className=" ">{formatNumberWithCommasAndDecimals(0.0, 2)}</p>
          </div>

          <div className="h-[20px]"></div>
        </div>
      </div>
    </>
  );
}
