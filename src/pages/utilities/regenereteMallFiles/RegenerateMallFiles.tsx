import { AuthFragment } from "./fragments/AuthFragment";
import { ProcessingFragment } from "./fragments/ProcessingFragment";
import { DateFragment, HourlyFragment } from "./fragments/DateFragment";
import { useState, useEffect } from "react";
import { useChangeNameModal, useModal } from "../../../hooks/modalHooks";
import { useUserActivityLog } from "../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../enums/activitylogs";
// import { useRegenerateMallFiles } from "../../../hooks/regenerateMallFiles";
import { useGenerateMallFiles } from "../../../hooks/generateMallHookUp";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getMallFields } from "../../../store/actions/mallhookup.action";
import { Tabs } from "antd";
import type { TabsProps } from "antd";

enum FragmentType {
  DEFAULT,
  AUTH,
  PROCESSING,
  DATE,
}

export default function RegenerateMallFiles() {
  const appDispatch = useAppDispatch();
  const { syspar, mallHookUp } = useAppSelector((state) => state.masterfile);
  const { dispatch: dispatchModal } = useModal();
  // const { handleRegenerateMallFiles } = useRegenerateMallFiles();
  const { reGenerateMallFiles, reGenerateHoursMallFiles } =
    useGenerateMallFiles();
  const [fragmentType, setFragmentType] = useState<FragmentType>(
    FragmentType.AUTH
  );
  const [dateForm, setDateForm] = useState({
    dateFrom: moment().format("yyyy-MM-DD"),
    dateTo: moment().format("yyyy-MM-DD"),
  });

  const [hourlyForm, setHourlyForm] = useState({
    date: moment().format("yyyy-MM-DD"),
    timeFrom: "",
    timeTo: "",
  });

  const [activeProcessingDate, setActiveProcessingDate] = useState("");

  const { modalNameDispatch } = useChangeNameModal();
  const { postActivity } = useUserActivityLog();

  const handleOnAuth = () => {
    setFragmentType(FragmentType.DATE);
    modalNameDispatch("Generate FTP Files");
  };

  const handleDateInputChange = (name: string, value: string) => {
    setDateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHourInputChange = (name: string, value: string) => {
    setHourlyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setFragmentType(FragmentType.PROCESSING);
    modalNameDispatch("Processing");
    try {
      await reGenerateMallFiles(
        dateForm.dateFrom,
        dateForm.dateTo,

        (date: string) => {
          // on generating
          setActiveProcessingDate(date);
        },
        () => {
          // on complete
          postActivity({
            method: METHODS.DOWNLOAD,
            module: MODULES.REGENERATE_MALL_FILES,
            remarks: `PRINT: Regenerate Mall Files from ${dateForm.dateFrom} to ${dateForm.dateTo}`,
          });
          setTimeout(() => {
            dispatchModal();
          }, 1500);
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Hourly
  const handleHourSubmit = async () => {
    setFragmentType(FragmentType.PROCESSING);
    modalNameDispatch("Processing");
    try {
      await reGenerateHoursMallFiles(
        hourlyForm.date,
        (date: string) => {
          // on generating
          setActiveProcessingDate(date);
        },
        () => {
          // on complete
          postActivity({
            method: METHODS.DOWNLOAD,
            module: MODULES.REGENERATE_MALL_FILES,
            remarks: `PRINT: Regenerate Hourly Mall Files on  ${hourlyForm.date}`,
          });
          setTimeout(() => {
            dispatchModal();
          }, 1500);
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    modalNameDispatch("Authorized User Only");
    appDispatch(getMallFields(syspar.data[0].active_mall || -1));
  }, []);

  const onChangeTabs = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Daily",
      children: (
        <DateFragment
          dateFrom={dateForm.dateFrom}
          dateTo={dateForm.dateTo}
          onConfirm={handleSubmit}
          handleInputChange={handleDateInputChange}
        />
      ),
    },
    ...(mallHookUp.data?.mallname === "Ayala 2024" ||
    mallHookUp.data?.mallname === "SM COINS & SM SIA" ||
    mallHookUp.data?.mallname === "SM COINS"
      ? [
          {
            key: "2",
            label: "Hourly",
            children: (
              <HourlyFragment
                date={hourlyForm.date}
                onConfirm={handleHourSubmit}
                handleInputChange={handleHourInputChange}
              />
            ),
          },
        ]
      : []),
  ];

  switch (fragmentType) {
    case FragmentType.AUTH:
      return <AuthFragment onAuthorize={handleOnAuth} />;
    case FragmentType.PROCESSING:
      return (
        <ProcessingFragment
          date={dateForm}
          activeProcessingDate={activeProcessingDate}
        />
      );
    case FragmentType.DATE:
      return (
        <Tabs defaultActiveKey="1" items={items} onChange={onChangeTabs} />
      );
    default:
      return (
        <div>
          <h1>Regenerate Mall File</h1>
        </div>
      );
  }
}
