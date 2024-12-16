import { useState, useEffect, ChangeEventHandler } from "react";
import Select, { MultiValue } from "react-select";
import { Checkbox } from "../../../common/form/Checkbox";
import { useService } from "../../../hooks/reportHooks";

interface ReceiveReportFormProps {
  data: any;
  errors: any;
  syspar: any;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  onReportListSelection: (reports: string[]) => void;
}

export function ReceiveReportForm(props: ReceiveReportFormProps) {
  const [rerenderKey, setRerenderKey] = useState<number>(0);
  const [reportList, setReportList] = useState<any>([]);
  const [userReport, setUserReport] = useState<any>([]);
  const {getData} = useService<any>();

  useEffect(() => {
    setReportList([
      {
        label: "ITEMIZED",
        value: "ITEMIZED",
      },
      {
        label: "CLASS AND SUBCLASS",
        value: "CLASSANDSUBCLASS",
      },
      props.syspar.no_dineout === 0
        ? {label: "DAILY DINE TYPE", value: "DAILYDINETYPE"}
        : {},
      {
        label: "HOURLY SALES",
        value: "HOURLYSALES",
      },
      {
        label: "FREE ITEM/TRANSACTION",
        value: "FREE",
      },
      {
        label: "VOID TRANSACTIONS",
        value: "VOIDTRANSACTIONS",
      },
      {
        label: "PER DAY HOURLY",
        value: "PERDAYHOURLY",
      },
      {
        label: "COST AND PROFIT ANALYSIS BY ITEM",
        value: "COSTANDPROFIT",
      },
      props.syspar.no_dineout === 0
        ? {label: "DAILY DINE TYPE", value: "DAILYDINETYPE"}
        : {},
      {
        label: "E-SALES",
        value: "ESALES",
      },
      {
        label: "SALES SUMMARY",
        value: "SALESSUMMARY",
      },
      {
        label: "DAILY SALES",
        value: "DAILYSALES",
      },
      {
        label: "Z-READING",
        value: "ZREADING",
      },
    ]);

    //#region reportListLoad
    const fetchAPI = async () => {
      await getData(
        "userreport/filter",
        {usercde: props.data?.usrcde},
        (res) => {
          if (res.data.length > 0) {
            props.onReportListSelection(res.data.map((val: any) => val.report));
            return setUserReport(res.data);
          }
        }
      );
    };
    fetchAPI();
    //#endregion
  }, []);

  useEffect(() => {
    if (!props.data) {
      setRerenderKey((prev) => prev + 1);
    }
  }, [props.data]);

  console.log("axdNo data", userReport);

  const onReportListSelect = (newValue: MultiValue<any>): void => {
    setUserReport(() => {
      const mappedNewValue = newValue.map(val => {
        return {
          usercde: props.data?.usrcde,
          report: val.value,
        };
      });

      return [...mappedNewValue];
    });

    props.onReportListSelection(newValue.map((val) => val.value));
  };

  return (
    <>
      <div key={rerenderKey}  className="shadow-md m-auto mb-[1.3rem] flex flex-col items-start">
        <label className="block mb-2 text-black text-[1rem] font-montserrat font-extrabold">
          Receive Report
        </label>

        <Checkbox
          description="via Email"
          name="receive_zreading"
          id="receive_zreading"
          value={props.data?.receive_zreading}
          checked={
            props.data?.receive_zreading === 1 || props.data?.receive_zreading
          }
          handleInputChange={props.handleInputChange}
          error={props.errors}
          required
        />

        <div className="p-[7px] w-full">
          <label
            htmlFor="modcde"
            className="block mb-2 text-xs text-black font-montserrat"
          >
            Report List
          </label>
          <Select
            isMulti
            id={"reportlist"}
            name={"reportlist"}
            options={
              props.syspar.no_dineout === 0
                ? reportList
                : reportList.filter((obj: any) => Object.keys(obj).length !== 0)
            }
            onChange={onReportListSelect}
            value={
              props.data?.recid &&
              userReport.map((value: any) => {
                return {
                  label: reportList.find((e: any) => e.value === value.report)
                    ?.label,
                  value: value.report,
                };
              })
            }
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>
    </>
  );
}
