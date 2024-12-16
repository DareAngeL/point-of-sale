import {useEffect, useState} from "react";
import {formatNumberWithCommasAndDecimals} from "../../../helper/NumberFormat";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import {setServiceChargeDiscount} from "../../../reducer/orderingSlice";

export function OrderScreen() {
  const {posfileTOTAL: posfile, posfiles, lessVatAdj, serviceCharge, serviceChargeDiscount} =
    useAppSelector((state) => state.order);
  const [discAmt, setDiscAmt] = useState(0);
  const appDispatch = useAppDispatch();

  // console.log(posfile?.data?.untprc);
  // console.log("DISCOUNT:", posfile.data);

  useEffect(() => {
    console.log("posfile.data.extprc:", typeof posfile?.data?.extprc);
    console.log(
      "serviceCharge.data.extprc:",
      typeof serviceCharge?.data?.extprc
    );
  }, [posfile?.data?.extprc, serviceCharge?.data?.extprc]);

  useEffect(() => {
    const discounts = posfiles.data.map((d) => ({
      disamt: d.disamt,
      scharge_disc: d.scharge_disc,
    }));

    const disc = discounts.reduce(
      (a: any, b: any) => ({
        disamt: (Number(a.disamt) || 0) + (Number(b.disamt) || 0),
      }),
      0
    );
    const scharge_disc = discounts.reduce(
      (a: any, b: any) => ({
        scharge_disc:
          (Number(a.scharge_disc) || 0) + (Number(b.scharge_disc) || 0),
      }),
      0
    );

    setDiscAmt(disc.disamt || 0);
    appDispatch(setServiceChargeDiscount(scharge_disc.scharge_disc || 0));
  }, [posfiles]);

  return (
    <>
      <div className=" bg-black text-white p-2 rounded-lg">
        <div
          className="flex justify-between font-montserrat"
          onClick={() => console.log(posfile)}
        >
          <p>Subtotal</p>
          {/* <p>{posfile.data && posfile.data?.groext ? posfile.data.groext.toFixed() : 0}</p> */}
          <p>
            {formatNumberWithCommasAndDecimals(
              posfile?.data?.groext as number,
              2
            )}
          </p>
        </div>
        <div className="flex justify-between font-montserrat">
          <p>Discount</p>
          <p>{formatNumberWithCommasAndDecimals(discAmt, 2)}</p>
        </div>
        <div className="flex justify-between font-montserrat">
          <p>Less VAT Adj.</p>
          <p>
            {formatNumberWithCommasAndDecimals(
              (lessVatAdj.data?.extprc as number) || 0,
              2
            )}
          </p>
        </div>
        <div className="flex justify-between font-montserrat">
          <p>Service Charge</p>
          <p>
            {formatNumberWithCommasAndDecimals(
              serviceCharge?.data?.extprc || 0,
              2
            )}
          </p>
        </div>
        {serviceChargeDiscount.data > 0 && (
          <div className="flex justify-between font-montserrat">
            <p>SCharge Discount</p>
            <p>
              {formatNumberWithCommasAndDecimals(serviceChargeDiscount.data, 2)}
            </p>
          </div>
        )}
        <div className="flex justify-between font-montserrat font-extrabold text-[1.5rem]">
          <p>Grand Total</p>
          <p>
            {(posfile?.data?.extprc &&
              serviceCharge?.data?.extprc &&
              formatNumberWithCommasAndDecimals(
                parseFloat(posfile.data.extprc + ""),
                2
              )) ||
              formatNumberWithCommasAndDecimals(0, 2)}
          </p>
        </div>
      </div>
    </>
  );
}
