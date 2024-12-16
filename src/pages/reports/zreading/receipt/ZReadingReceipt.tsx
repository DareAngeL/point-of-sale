import { formatNumberWithCommasAndDecimals } from "../../../../helper/NumberFormat";
import { useAppSelector } from "../../../../store/store";
import { XZReportData } from "../zreadingreport/xzreportBuilder";

export function ZReadingReceipt() {
  const { zReadingReportData } = useAppSelector((state) => state.report);
  const { data } = zReadingReportData;

  console.log("zreading data", data);

  const separator = () => (
    <div className="w-full border-t border-dashed border-gray-400 my-2"></div>
  );

  const salesData = (data: XZReportData[]) => (
    <div id="sales_data">
      {data &&
        data.map((data: XZReportData) => (
          <div className="flex">
            <span>{data.label}</span>
            <span className="ms-auto">{data.value}</span>
          </div>
        ))}
    </div>
  );

  const discount = () => (
    <>
      {separator()}
      <p className="text-center font-bold">Discounts</p>
      {separator()}
      <div id="discounts">
        {data.discounts_data &&
          data.discounts_data.map((data: XZReportData) => (
            <div className="flex flex-col">
              <p>{data.label}</p>
              <div className="flex">
                <span>{data.qty}</span>
                <span className="ms-auto">{data.value}</span>
              </div>
            </div>
          ))}
      </div>
      {separator()}
    </>
  );

  const cash = () => (
    <div id="cash">
      <div className="flex flex-col">
        <p>{data.cash_data && data.cash_data[0] && data.cash_data[0].label}</p>
        <div className="flex">
          <span>
            {data.cash_data && data.cash_data[0] && data.cash_data[0].qty}
          </span>
          <span className="ms-auto">
            {data.cash_data && data.cash_data[0] && data.cash_data[0].value}
          </span>
        </div>
      </div>
      {data.all_cash_data &&
        data.all_cash_data.map((data: XZReportData) => (
          <div className="flex">
            <span>{data.label}</span>
            <span className="ms-auto">{data.value}</span>
          </div>
        ))}
    </div>
  );

  const cardSales = () => (
    <>
      {separator()}
      <p className="text-center font-bold">Card Sales</p>
      {separator()}
      {data.card_sales_data &&
        data.card_sales_data.map((data: XZReportData) => (
          <div className="flex flex-col">
            <p>{data.label}</p>
            {(data.subLbls as Array<any>).map(
              (data: { amount: number; cardclass: string; qty: number }) => (
                <div className="flex flex-col">
                  <p>{data.cardclass}</p>
                  <div className="flex">
                    <span>{data.qty}</span>
                    <span className="ms-auto">
                      {formatNumberWithCommasAndDecimals(data.amount, 2)}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      {separator()}
    </>
  );

  const otherMOP = () => (
    <>
      <p className="text-center font-bold">Other MOP Sales</p>
      {separator()}
      <div id="other_mop" className="flex flex-col">
        {data.other_sales_data &&
          data.other_sales_data.map((data: XZReportData) => (
            <div className="flex flex-col">
              <p>{data.label}</p>
              <div className="flex">
                <span>{data.qty}</span>
                <span className="ms-auto">{data.value}</span>
              </div>
            </div>
          ))}
      </div>
      {separator()}
    </>
  );

  return (
    <>
      {data && (
        <div
          id="z-receipt"
          className="w-full flex justify-center items-center font-montserrat text-black mb-3"
        >
          <div id="content">
            <div id="header" className="text-center font-bold">
              {data.header &&
                Object.keys(data.header).map((key) => {
                  if (key !== "title" && key !== "date")
                    return <p>{data.header[key]}</p>;
                  else return <></>;
                })}
            </div>

            {separator()}
            <p className="text-center font-bold">
              {data.header ? data.header.title : "Z-Reading"}
            </p>
            {separator()}
            <p className="text-center font-bold">
              {data.header ? data.header.date : ""}
            </p>
            {separator()}
            <div>
              <p className="text-left">CASHIER: {data.cashier}</p>
            </div>
            {separator()}

            {salesData(data.sales_data)}
            {discount()}
            {cash()}
            {cardSales()}
            {otherMOP()}

            <p className="text-center font-bold">ITEMIZED SALES</p>
            {separator()}
            <div id="itm-sales">
              {data.itemized_sales_data &&
                data.itemized_sales_data.map((data: XZReportData) => (
                  <div className="flex flex-col">
                    <p>{data.label}</p>
                    <div className="flex">
                      <span>{data.qty}</span>
                      <span className="ms-auto">{data.value}</span>
                    </div>
                  </div>
                ))}
            </div>
            {separator()}
            <p className="text-center font-bold">GIFT CERTIFICATE SALES</p>
            {separator()}
            <div id="gift-certificate-sales">
              {data.itemized_sales_data &&
                data.itemized_sales_data.map((dataGc: XZReportData) => {
                  const sliceLabel = dataGc.label.slice(0, 2);
                  if (sliceLabel === "GC") {
                    return (
                      <div className="flex flex-col" key={dataGc.label}>
                        <p>{dataGc.label}</p>
                        <div className="flex">
                          <span>{dataGc.qty}</span>
                          <span className="ms-auto">{dataGc.value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              {data.category_sales_data &&
                data.category_sales_data.map((dataGcTotal: XZReportData) => {
                  if (dataGcTotal.label === "GIFT CERTIFICATES") {
                    return (
                      <div className="flex flex-col">
                        <p>{dataGcTotal.label}</p>
                        <div className="flex">
                          <span>{dataGcTotal.qty}</span>
                          <span className="ms-auto">{dataGcTotal.value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
            </div>
            {separator()}
            <p className="text-center font-bold">CATEGORY SALES</p>
            {separator()}
            <div id="catgry-sales">
              {data.category_sales_data &&
                data.category_sales_data.map((data: XZReportData) => (
                  <div className="flex flex-col">
                    <p>{data.label}</p>
                    <div className="flex">
                      <span>{data.qty}</span>
                      <span className="ms-auto">{data.value}</span>
                    </div>
                  </div>
                ))}
            </div>
            {separator()}
            <p className="text-center font-bold">SALES BY DINE-TYPE</p>
            {separator()}
            <div id="sales-by-dtype">
              {data.sales_by_dine_type_data &&
                data.sales_by_dine_type_data.map((data: XZReportData) => (
                  <div className="flex flex-col">
                    <p>{data.label}</p>
                    <div className="flex">
                      <span>{data.qty}</span>
                      <span className="ms-auto">{data.value}</span>
                    </div>
                    {(data.subLbls as any[]).map(
                      (d: {
                        itmqty: any;
                        extprc: any;
                        postypcde: any;
                        postypdsc: any;
                      }) => (
                        <div className="flex flex-col ms-5">
                          <p>{d.postypdsc}</p>
                          <div className="flex">
                            <span>{d.itmqty}</span>
                            <span className="ms-auto">
                              {formatNumberWithCommasAndDecimals(d.extprc, 2)}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))}
            </div>
            {separator()}
            <p className="text-center font-bold">SUMMARY</p>
            {separator()}

            {salesData(data.summary_data)}
            {discount()}
            {cash()}
            {cardSales()}
            {otherMOP()}

            <p className="text-center font-bold">Post Void</p>
            {separator()}
            <div id="post-void" className="flex flex-col">
              {data.postvoids &&
                data.postvoids.map((data: XZReportData) => (
                  <div className="flex">
                    <p>{data.label}</p>
                    <p className="ms-auto">{data.value}</p>
                  </div>
                ))}
            </div>
            {separator()}
            <div className="flex justify-between">
              <span>{data.beg_void && data.beg_void.label}</span>
              <span>{data.beg_void && data.beg_void.value}</span>
            </div>
            <div className="flex justify-between">
              <span>{data.end_void && data.end_void.label}</span>
              <span>{data.end_void && data.end_void.value}</span>
            </div>
            {separator()}
            <p className="text-center font-bold">Post Refund</p>
            {separator()}
            <div id="post-void" className="flex flex-col">
              {data.postrefunds &&
                data.postrefunds.map((data: XZReportData) => (
                  <div className="flex">
                    <p>{data.label}</p>
                    <p className="ms-auto">{data.value}</p>
                  </div>
                ))}
            </div>

            <div className="flex flex-col">
              {Array.isArray(data.post_refund_data) && // Added check to ensure it's an array
                data.post_refund_data
                  .filter(
                    (data: XZReportData) =>
                      data.label === "Beginning Refund" ||
                      data.label === "Ending Refund"
                  )
                  .map(
                    (data: XZReportData) => (
                      console.log("Beginning and Ending ", data),
                      (
                        <div className="flex" key={data.label}>
                          <span>{data.label}</span>
                          <span className="ms-auto">{data.value}</span>
                        </div>
                      )
                    )
                  )}
            </div>
            {separator()}

            <div className="flex flex-col">
              {Array.isArray(data.post_refund_data) &&
                data.post_refund_data
                  .filter(
                    (data: XZReportData) =>
                      data.label !== "Beginning Refund" &&
                      data.label !== "Ending Refund"
                  )
                  .map((data: XZReportData) => (
                    <div className="flex" key={data.label}>
                      <span>{data.label}</span>
                      <span className="ms-auto">{data.value}</span>
                    </div>
                  ))}
            </div>

            {separator()}
            <p className="text-center font-bold">
              {data.datetime && data.datetime}
            </p>
            <p className="text-center font-bold text-sm">
              End of Z - Reading Report
            </p>
            {separator()}
            {zReadingReportData.isReprint && (
              <p className="text-center font-bold">
                [ THIS IS A REPRINTED Z - READING ]
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
