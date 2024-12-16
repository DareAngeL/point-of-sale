import { useEffect, useRef } from "react";
import { BackButton } from "../../../common/backbutton/BackButton";
import { usePage } from "../../../hooks/modalHooks";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { isPage } from "../../../reducer/pageSlice";
import { PageTitle } from "../../../common/title/MasterfileTitle";
import { SettingOutlined } from "@ant-design/icons";
import { Switch } from "antd";
import { useLoadedData, useSubmitData } from "../../../hooks/serviceHooks";
import { SystemParametersModel } from "../../../models/systemparameters";
import { InputNumber } from "../../../common/form/InputNumber";
import { SingleButtonForm } from "../../../common/form/SingleButtonForm";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { AutoTransfer } from "./AutomationTransferTable";
import { toast } from "react-toastify";
import { useTheme } from "../../../hooks/theme";
import { AuthenticationGuard } from "../../../security/authentication/AuthGuards";

interface AutoTransferFormRequiredValues {
  "Set Interval (minutes) *": number;
}

export function AutomationOfSalesTransaction() {
  const { ButtonStyled, OutlinedButtonStyled, theme } = useTheme();
  const { header } = useAppSelector((state) => state.masterfile);

  const { pageActive, pageDispatch } = usePage();
  const dispatch = useAppDispatch();
  const { loadedData, setLoadedData } = useLoadedData<SystemParametersModel>();
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const { putRequestData: requestData } = useSubmitData<SystemParametersModel>(
    "systemparameters",
    "/pages/utilities",
    true
  );

  const { handleSubmit, register, errors } =
    useFormInputValidation<AutoTransferFormRequiredValues>();

  const handleInputChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setLoadedData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setLoadedData((prev: any) => ({
      ...prev,
      ["activateautotransfer"]: checked ? 1 : 0,
    }));
  };

  const clickTransferMod = (value: string) => {
    setLoadedData((prev: any) => ({
      ...prev,
      ["trnsfrmod"]: value,
    }));
  };

  const onSubmit = () => {
    if (loadedData?.is_transferring === 1) {
      toast.error(
        "Transferring is in progress, Unable to save due to the process is on going",
        {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        }
      );
      return;
    } else if (loadedData?.transferinterval && loadedData?.transferinterval < 5) {
      toast.error("Interval must be greater than or equal to five (5)", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
      return;
    } else if (
      loadedData?.transferinterval &&
      loadedData?.transferinterval > 1440
    ) {
      toast.error("Interval must be less than or equal to 1440 (1 day)", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
      return;
    }

    requestData(loadedData, setLoadedData);
    dispatch(isPage({ isPage: false }));
  };

  useEffect(() => {
    if (!pageActive) {
      dispatch(isPage({ isPage: true }));
    }
  }, []);

  if (header.data[0].brhcde === '') {
    pageDispatch(false);
  }

  return (
    <>
      <AuthenticationGuard redirectTo={"/pages/utilities"} condition={header.data[0].brhcde !== ''}>
        <div ref={scrollableDivRef} className="h-screen w-full relative overflow-y-auto">
          <div className="bg-white z-10 w-full fixed pl-5 py-3 border-b-2">
            <div className="flex items-center">
              <BackButton onClick={() => dispatch(isPage({ isPage: false }))} />
              <PageTitle name={"Automation of Sales Transaction"} />
            </div>

          </div>

          <div className="top-[4rem] m-5 h-[600px] relative">
            <fieldset className="w-full border border-black border-solid p-3">
              <legend>
                <label className="flex items-center block mb-2 text-black text-[1rem] font-montserrat font-extrabold">
                  <SettingOutlined className="animation text-slate-500" />
                  Setup
                </label>
              </legend>

              <form id="auto-transfer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="border-b border-solid border-black pb-[7px]">
                  <Switch
                    className="bg-[#ccc]"
                    id="activateautotransfer"
                    checked={loadedData?.activateautotransfer ? true : false}
                    onChange={handleSwitchChange}
                  />
                  <label htmlFor="activateautotransfer">
                    Automatically transfer sales data
                  </label>
                </div>

                {loadedData?.activateautotransfer === 1 ? (
                  <>
                    <label>
                      <b>
                        Transfer Interval Mode: (this will only work if Auto
                        Transfer is on)
                      </b>
                    </label>

                    <div>
                      {loadedData?.trnsfrmod === "TIME" ? (
                        <ButtonStyled $color={theme.primarycolor} $noHoverEffect
                          type="button"
                          id="trnsfrmod"
                          name="trnsfrmod"
                          onClick={() => clickTransferMod("TIME")}
                          className={'px-4 py-2 rounded my-5 mx-[7px]'}
                        >
                          Time Stamp
                        </ButtonStyled>
                      ) : (
                        <OutlinedButtonStyled $color={theme.primarycolor}
                          type="button"
                          id="trnsfrmod"
                          name="trnsfrmod"
                          onClick={() => clickTransferMod("TIME")}
                          className={'px-4 py-2 rounded my-5 mx-[7px]'}
                        >
                          Time Stamp
                        </OutlinedButtonStyled>
                      )}

                      {loadedData?.trnsfrmod === "EOD" ? (
                        <ButtonStyled $color={theme.primarycolor} $noHoverEffect
                          type="button"
                          id="trnsfrmod"
                          name="trnsfrmod"
                          onClick={() => clickTransferMod("EOD")}
                          className={'px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5'}
                        >
                          End of day (EOD)
                        </ButtonStyled>
                      ) : (
                        <OutlinedButtonStyled $color={theme.primarycolor}
                          type="button"
                          id="trnsfrmod"
                          name="trnsfrmod"
                          onClick={() => clickTransferMod("EOD")}
                          className={'px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5'}
                        >
                          End of day (EOD)
                        </OutlinedButtonStyled>
                      )}

                    </div>

                    <fieldset className="w-full border border-black border-solid p-3">
                      {loadedData?.trnsfrmod === "TIME" ? (
                        <>
                          <InputNumber
                            description="Set Interval (minutes) *"
                            id="transferinterval"
                            name="transferinterval"
                            value={loadedData?.transferinterval}
                            handleInputChange={handleInputChange}
                            min="5"
                            placeholder="5 - 1440"
                            error={errors}
                            register={register}
                            required
                          />

                          <label>
                            <b>NOTE</b>: After the end of the day, it will
                            trigger the <b>Auto Transfer</b> regardless of the
                            interval
                          </label>
                        </>
                      ) : (
                        <>
                          <label>
                            <b>NOTE</b>: <b>Auto Transfer</b> will run after the
                            end of the day. (Once the z-reading is done)
                          </label>
                        </>
                      )}
                    </fieldset>
                  </>
                ) : (
                  <></>
                )}
              </form>

              <SingleButtonForm
                formName="auto-transfer-form"
                labelName="Save"
              />
            </fieldset>

            <AutoTransfer sysparData={loadedData} scrollableDivRef={scrollableDivRef} />
          </div>

        </div>
      </AuthenticationGuard>
    </>
  );
}
