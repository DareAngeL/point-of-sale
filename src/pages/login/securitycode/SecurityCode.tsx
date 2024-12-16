import { useEffect, useRef, useState } from "react";
import { InputText } from "../../../common/form/InputText";
import { SingleButtonForm } from "../../../common/form/SingleButtonForm";
import { toast } from "react-toastify";
import { useService } from "../../../hooks/reportHooks";

interface SecurityCodeProps {
  data: any;
  isSecurityCode: boolean;
  setIsSecurityCode: any;
}

export function SecurityCode(props: SecurityCodeProps) {
  const [data, setData] = useState<any>(props.data);
  const { postData } = useService<any>();
  const refToast = useRef(false);

  const handleInputChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    props.setIsSecurityCode(false);
  };

  const submitCode = async () => {
    if (!data.seccde) {
      return toast.error("Security code is required!", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
    };

    let _serial = localStorage.getItem("serialnum");
    const body = {
      ischeck: false,
      seccde: data?.seccde,
      imei: _serial,
      lstpos: localStorage.getItem("lstpos"),
    };

    await postData("securitycode", body, async (res) => {
      if (!res || !res.data || res.data.invalidcode) {
        toast.error("Invalid security code!", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      } else {
        toast.success("Successfully Register!", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 5000,
        });
        localStorage.setItem("lstpos", res.data.encrypted);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const showToast = () => {
      if (!refToast.current) {
        if (data?.expired) {
          // SUBSCRIPTION EXPIRED
          toast.error("Subscription expired, contact your support!", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 3000,
          });
        } else if (data?.incorrect || data?.missing) {
          // FILE IS INCORRECT FORMAT OR MISSING
          toast.error(
            "Something went wrong in your subscription, contact you support!",
            {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 3000,
            }
          );
        } else if (data?.override) {
          // FILE HAD CHANGE THE DATE
          toast.error("Back date detected!", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 3000,
          });
        } else if (data?.serial) {
          // INVALID SERIAL NUMBER
          toast.error("Invalid serial number!", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 3000,
          });
        }

        refToast.current = true;
      }
    };

    if (!data) {
      const postAPI = async () => {
        let _serial = localStorage.getItem("serialnum");

        if (!_serial) {
          toast.error("Serial number cannot be found!", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 2000,
          });

          return;
        }

        const body = {
          ischeck: true,
          lstpos: localStorage.getItem("lstpos"),
          imei: _serial,
        };

        await postData("securitycode", body, async (res) => {
          
          if (!data) {
            setData(res.data);
          } else {
            setData((prev: any) => ({
              ...prev,
              ...res.data,
            }));
          }

          showToast();
        });
      };

      postAPI();
    } else {
      showToast();
    }
  }, []);

  return (
    <>
      {props.isSecurityCode ? (
        <>
          <div className="absolute w-full h-full z-20">
            <div className="flex justify-center items-center bg-black/75 w-full center h-full z-30">
              <div className="rounded bg-white shadow-lg flex flex-col">
                <div className=" font-montserrat px-8 py-5 border-b border-[#adacac] font-bold">
                  <div className="flex items-center justify-between">
                    {!data?.expired &&
                    !data?.incorrect &&
                    !data?.missing &&
                    !data?.override &&
                    !data?.serial && 
                    localStorage.getItem("serialnum")? (
                      <>
                        <button
                          type="submit"
                          className="w-[100px] h-[40px] rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={onClose}
                        >
                          Continue
                        </button>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>

                <div className="min-w-[500px] max-w-[500px] p-[10px] font-montserrat overflow-y-auto overflow-x-hidden relative">
                  <div className="flex items-center justify-center">
                    {data?.expired || data?.incorrect || data?.expiring ? (
                      <>
                        <img
                          src="./src/assets/icon/sign-error-icon.png"
                          className="w-[50px] h-[50px] pr-[5px]"
                        />
                        <span>
                          {data?.expired || data?.incorrect
                            ? "Program License Has Already Expired!"
                            : ""}
                          {data?.expiring
                            ? `Your License is about to expire - ${data?.expringdate}`
                            : ""}
                        </span>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>

                  <InputText
                    description="Warning Code 1"
                    name="warningcode1"
                    id="warningcode1"
                    value={data?.warningcode1}
                    handleInputChange={handleInputChange}
                    readonly
                  />

                  <InputText
                    description="Serial No."
                    name="serialno"
                    id="serialno"
                    value={data?.lstpos?.serialno}
                    handleInputChange={handleInputChange}
                    readonly
                  />

                  <InputText
                    description="Company No."
                    name="seccde"
                    id="seccde"
                    value={data?.lstcom?.company_no}
                    handleInputChange={handleInputChange}
                    readonly
                  />

                  <InputText
                    description="Security Code"
                    name="seccde"
                    id="seccde"
                    value={data?.seccde}
                    handleInputChange={handleInputChange}
                    placeholder="Enter Security Code"
                  />

                  <SingleButtonForm
                    formName=""
                    labelName="Submit Security Code"
                    onClick={submitCode}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
