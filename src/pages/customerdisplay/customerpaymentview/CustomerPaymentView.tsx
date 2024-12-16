import { Carousel } from "antd";
import './customer-payment.css';
import { useEffect } from "react";
import { useAdvertisementHook } from "../hooks/ads";
import OrderingTable from "../../transaction/ordering/OrderingTable";
import { formatNumberWithCommasAndDecimals } from "../../../helper/NumberFormat";
import { useAppSelector } from "../../../store/store";

export function CustomerPaymentView() {

  const sampleBanner = "YOUR BANNER HERE";
  const { images, fetchImages } = useAdvertisementHook();

  const { order, masterfile, customerwindow } = useAppSelector((state) => state);
  const { 
    posfileTOTAL: posfile, 
    serviceCharge, 
    serviceChargeDiscount, 
    transaction 
  } = order;
  const { dineType, syspar } = masterfile;
  const { customerwindowsetup } = customerwindow;

  useEffect(() => {
    const init = async () => {
      customerwindowsetup.data.ads_path && await fetchImages(customerwindowsetup.data.ads_path);
    }

    init();
  }, []);

  return (
    <>
      <div className="flex justify-center items-center h-[100vh] w-[100vw] bg-slate-200">
        <Carousel 
          className="flex-auto h-[100vh] w-[60vw]" 
          autoplaySpeed={customerwindowsetup.data.carousel_time_interval} 
          autoplay fade
        >
          {images.map((image, index) => {
              return (
                <div key={index}>
                  <img 
                    src={image} 
                    alt={image} 
                    className="h-[100vh] w-[60vw] object-contain" 
                  />
                </div>
              )
            })}
            {images.length === 0 && (
              <>
                <div className="flex h-[100vh] justify-center items-center">
                  <div className="flex flex-col items-center font-montserrat text-[2rem] border border-gray-500 p-8">
                    <span>Your</span>
                    <span>Ads</span>
                    <span>Here</span>
                  </div>
                </div>
              </>
            )}
        </Carousel>
        <div className="flex flex-col flex-auto mx-5 py-5 h-[100vh] font-montserrat text-[3rem] overflow-hidden">
          {/* REGION: BANNER VIEW */}
          <div className="relative flex-auto bg-black w-full h-[12vh] max-h-[12vh] font-bold rounded shadow">
            <h1 className="banner-text">{customerwindowsetup.data.txt_banner ? customerwindowsetup.data.txt_banner : sampleBanner}</h1>
          </div>
          {/* ENDREGION: BANNER VIEW */}

          {/* REGION: ITEMS LIST VIEW */}
          <div className="mt-2 h-[60vh] w-full bg-white rounded shadow">
            <p className="text-[1.1rem] font-bold text-center my-2">
              {!syspar.data[0]?.no_dineout && dineType.data.find(
              (item: any) => item.postypcde == transaction.data?.postypcde
            )?.postypdsc}
            </p>
            <OrderingTable 
              columns={['itm_desc', 'price', 'qty']} 
              forDisplay
            />
          </div>
          {/* ENDREGION: ITEMS LIST VIEW */}

          {/* REGION: PAYMENT TOTAL VIEW */}
          <div className="mt-2 h-[20vh] w-full bg-white rounded shadow text-[1.5rem] font-bold">
            
            <div className="flex mt-2 text-[1.2rem]">
              <span className="ms-5">Subtotal</span>
              <p className="ms-auto me-5">
                {formatNumberWithCommasAndDecimals(
                  posfile?.data?.groext as number,
                  2
                )}
              </p>
            </div>

            <div className="flex mt-2">
              <span className="ms-5">Grandtotal</span>
              <p className="ms-auto me-5">
                {(posfile?.data?.extprc &&
                serviceCharge?.data?.extprc &&
                formatNumberWithCommasAndDecimals(
                  parseFloat(posfile.data.extprc + "") +
                    parseFloat(serviceCharge.data.extprc + "") -
                    serviceChargeDiscount.data,
                  2
                )) ||
                formatNumberWithCommasAndDecimals(0, 2)}
              </p>
            </div>
          </div>
          {/* ENDREGION: PAYMENT TOTAL VIEW */}
        </div>
        
      </div>
    </>
  )
}