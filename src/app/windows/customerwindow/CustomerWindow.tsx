import { Carousel } from "antd";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { CustomerPaymentView } from "../../../pages/customerdisplay/customerpaymentview/CustomerPaymentView";
import { useEffect, useRef } from "react";
import { useAdvertisementHook } from "../../../pages/customerdisplay/hooks/ads";
import { CustomerWindowLocalStorageKey } from "../../../pages/login/setup/CustomerWindowSetup";
import { setCustomerWindow } from "../../../reducer/customerWindowSlice";

export function CustomerWindow() {
  const appDispatch = useAppDispatch();
  const { account: Account, customerwindow } = useAppSelector((state) => state);
  const { account } = Account;
  const { customerwindowsetup } = customerwindow;

  const { images, fetchImages } = useAdvertisementHook();

  const localData = useRef(localStorage.getItem(CustomerWindowLocalStorageKey.KEY));

  useEffect(() => {
    if (localData.current) {
      appDispatch(setCustomerWindow(JSON.parse(localData.current as string)));
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      localData.current = localStorage.getItem(CustomerWindowLocalStorageKey.KEY);
      const path = localData.current ? JSON.parse(localData.current as string) : undefined;

      console.log("dsa", customerwindowsetup.data.ads_path, "dsa2", path?.ads_path);

      await fetchImages(path?.ads_path);
    };

    init();
  }, [customerwindowsetup.data]);

  if (!account.isLoggedIn) {
    return (
      <>
        <div className="flex justify-center items-center h-[100vh] w-[100vw]">
          <Carousel
            className="flex-auto h-[100vh] w-[60vw] bg-slate-200"
            autoplaySpeed={
              typeof customerwindowsetup.data.carousel_time_interval === 'string' ? 
                parseInt(customerwindowsetup.data.carousel_time_interval) : 
                customerwindowsetup.data.carousel_time_interval
            }
            autoplay
            fade
          >
            {images.map((images, index) => {
              return (
                <div key={index}>
                  <img
                    src={images}
                    alt={images}
                    className="h-[100vh] w-[60vw] object-contain"
                  />
                </div>
              );
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
          <h1 className="flex-auto px-5 font-montserrat text-[3rem] text-center text-slate-700">
            <span className="font-bold">
              {customerwindowsetup.data.welcome_title}
            </span>
            <br /> {customerwindowsetup.data.welcome_desc}
          </h1>
        </div>
      </>
    );
  }

  return <CustomerPaymentView />;
}
