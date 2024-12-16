import { useEffect, useRef, useState } from "react";
import { BackButton } from "../../common/backbutton/BackButton";
import { SingleButtonForm } from "../../common/form/SingleButtonForm";
import { useLoadedData, useSubmitData } from "../../hooks/serviceHooks";
import { SystemParametersModel } from "../../models/systemparameters";
import { AuthorizationByPass } from "./AuthorizationByPass";
import { MallHookUp } from "./MallHookUp";
import { Ordering } from "./Ordering";
import { Others } from "./Others";
import { useUserActivityLog } from "../../hooks/useractivitylogHooks";
import { MODULES, METHODS } from "../../enums/activitylogs";
import { findChangedProperties } from "../../helper/Comparison";
import PrinterStationTagging from "./PrinterStationTagging";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../store/store";
import { resetLoading } from "../../reducer/transactionSlice";

export function Systemsettings() {
  const dispatch = useAppDispatch();
  const { loadedData, setLoadedData } = useLoadedData<SystemParametersModel>();
  const { putRequestData: requestData } = useSubmitData<SystemParametersModel>(
    "systemparameters",
    "/pages/home",
    true
  );
  const { postActivity } = useUserActivityLog();
  const [editCopy, setEditCopy] = useState<any>([]);

  const [pStationShowRequired, setPStationShowRequired] =
    useState<boolean>(false);
  const isPrinterStationModified = useRef<boolean | undefined>(
    loadedData.prntr_stn_tag_modified
  );

  useEffect(() => {
    document.scrollingElement?.scrollTo(0, 0);
    dispatch(resetLoading());
    setLoadedData((prev: any) => ({
      ...prev,
      ["mitsukoshi_setup_type"]:
        loadedData.mitsukoshi_setup_type === null || !loadedData.mitsukoshi
          ? "default"
          : loadedData.mitsukoshi_setup_type,
    }));
    setEditCopy(loadedData);
  }, []);

  const handleSelectChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLSelectElement>) => {
    setLoadedData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = ({
    target: { name, value, checked, type, id },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "radio") {
      if (name === "enable_pstation") {
        setLoadedData((prev: any) => ({
          ...prev,
          ["allow_printerstation"]: id === "yes" ? 1 : 0,
        }));

        setPStationShowRequired(false);
        return;
      }

      if (
        id === "itemclass_printer_station_tag" ||
        id === "itemsubclass_printer_station_tag"
      ) {
        setLoadedData((prev: any) => ({
          ...prev,
          ["itemclass_printer_station_tag"]:
            id === "itemclass_printer_station_tag" ? 1 : 0,
          ["itemsubclass_printer_station_tag"]:
            id === "itemsubclass_printer_station_tag" ? 1 : 0,
        }));

        return;
      }

      console.log("id to pareh oh???", id);

      setLoadedData((prev: any) => ({
        ...prev,
        ["sm"]: 0,
        ["megaworld"]: 0,
        ["naia"]: 0,
        ["shangrila"]: 0,
        ["sm_mall_2022"]: 0,
        ["ayala"]: 0,
        ["ortigas"]: 0,
        ["mitsukoshi"]: 0,
        ["robinson"]: 0,
        ["ayala_mall_2022"]: 0,
        ["sta_lucia"]: 0,
        [id]: checked ? 1 : 0,
      }));
    } else {
      setLoadedData((prev: any) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let data,
      isDataModified = false;
    if (isPrinterStationModified.current) {
      data = { ...loadedData };
      data.prntr_stn_tag_modified = true;
      isDataModified = true;
    } else {
      setPStationShowRequired(true);
      toast.error("Fill up all the required fields", {
        autoClose: 2000,
        position: "top-center",
        hideProgressBar: true,
      });
      return;
    }

    if (!isDataModified) data = loadedData;
    requestData(data, setLoadedData);
    // dispatch();

    // handling activiy logs
    let templateRemarks = `UPDATED SYSTEM SETTINGS:\n`;
    let initialRemarks = "";
    const changedData = findChangedProperties(editCopy, loadedData);

    console.log("nagiibang data", editCopy, loadedData);

    const malls = [
      { code: "sm", name: "SM COINS" },
      { code: "megaworld", name: "MEGAWORLD" },
      { code: "naia", name: "NAIA" },
      { code: "shangrila", name: "SHANGRILA" },
      { code: "sm_mall_2022", name: "SM SIA" },
      { code: "ayala", name: "AYALA 2020" },
      { code: "ortigas", name: "ORTIGAS" },
      { code: "mitsukoshi", name: "MITSUKOSHI" },
      { code: "robinson", name: "ROBINSONS" },
      { code: "ayala_mall_2022", name: "AYALA 2022" },
      { code: "sta_lucia", name: "STA LUCIA" },
    ];

    const mallsFinal = changedData
      .map((item) => {
        return malls
          .map((mall) => {
            if (item.property === mall.code) {
              return { ...item, mallName: mall.name };
            }
          })
          .filter((item) => item);
      })
      .filter((item) => item.length > 0);

    const filteredData = changedData.filter((item) => {
      return !malls.some((mall) => mall.code === item.property);
    });

    filteredData.forEach((item: any) => {
      if (
        item.property.includes("auth") ||
        (typeof item.previousValue === "number" &&
          typeof item.currentValue === "boolean")
      ) {
        initialRemarks += `${item.property}: ${
          item.previousValue == 1 ? "ENABLE" : "DISABLE"
        } to ${item.currentValue == 1 ? "ENABLE" : "DISABLE"},\n`;
      } else {
        initialRemarks += `${item.property}: ${
          item.previousValue === null || item.previousValue.length === 0
            ? "NOT DEFINED"
            : item.previousValue
        } to ${
          item.currentValue === null || item.currentValue.length === 0
            ? "NOT DEFINED"
            : item.currentValue
        },\n`;
      }
    });

    initialRemarks = initialRemarks.slice(0, -2);
    if (mallsFinal.length > 1) {
      initialRemarks += `\nMALL: ${mallsFinal[0][0]?.mallName} to ${mallsFinal[1][0]?.mallName}`;
    }

    if (initialRemarks.length !== 0) {
      templateRemarks += initialRemarks;
      postActivity({
        method: METHODS.UPDATE,
        module: MODULES.SYSTEM_SETTINGS,
        remarks: templateRemarks,
      });
    }
  };

  return (
    <>
      <div className="h-full relative w-[100%]">
        <div className="flex bg-white z-10 w-full items-center fixed ps-10 border-b-2">
          <BackButton />
          <div className="text-[3rem] font-montserrat">System Settings</div>
        </div>
        <div className="flex z-0 flex-col w-[95%] relative left-[3%] top-[5rem] shadow-xl p-[7px]">
          <form id="ss-form" onSubmit={handleSubmit}>
            <AuthorizationByPass
              data={loadedData}
              setData={setLoadedData}
              handleSelectChange={handleSelectChange}
              handleInputChange={handleInputChange}
            />
            <PrinterStationTagging
              data={loadedData}
              setData={setLoadedData}
              handleInputChange={handleInputChange}
              isModified={() => {
                isPrinterStationModified.current = true;
              }}
              showRequired={pStationShowRequired}
            />
            <Ordering
              data={loadedData}
              setData={setLoadedData}
              handleSelectChange={handleSelectChange}
              handleInputChange={handleInputChange}
            />
            <MallHookUp
              data={loadedData}
              setData={setLoadedData}
              handleSelectChange={handleSelectChange}
              handleInputChange={handleInputChange}
            />
            <Others
              data={loadedData}
              setData={setLoadedData}
              handleSelectChange={handleSelectChange}
              handleInputChange={handleInputChange}
            />
          </form>

          <SingleButtonForm formName="ss-form" labelName="Update Settings" />
        </div>
      </div>
    </>
  );
}
