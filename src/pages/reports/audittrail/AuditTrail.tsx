import {useEffect} from "react";
import { InputDateV2} from "../../../common/form/InputDate";
import {useReports, useService} from "../../../hooks/reportHooks";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {toast} from "react-toastify";
import moment from "moment";
import jsPDF from "jspdf";
import {useAppSelector} from "../../../store/store";
import {PrintDetail, PrintHeader, jsPdfToPrint} from "./PrintAuditTrail";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {METHODS, MODULES} from "../../../enums/activitylogs";
import {removeNewlines} from "../../../helper/StringHelper";
export function AuditTrail() {
  const {getData} = useService<any>();
  const {onChangeData, formValue, setFormValue} = useReports<any>();
  const company = useAppSelector((state) => state.masterfile.company);
  const {postActivity} = useUserActivityLog();

  // const handleInputChange = ({
  //   target: {name, value, checked, type},
  // }: React.ChangeEvent<HTMLInputElement>) => {
  //   onChangeData(name, value, checked, type);

  //   let dateFrom: any, dateTo: any;
  //   if (name === "dateTo") {
  //     dateFrom = new Date(formValue.dateFrom);
  //     dateTo = new Date(value);
  //   } else {
  //     dateFrom = new Date(value);
  //     dateTo = new Date(formValue.dateTo);
  //   }

  //   if (dateFrom && dateTo) {
  //     if (dateFrom > dateTo) {
  //       toast.error("Invalid Date End", {
  //         hideProgressBar: true,
  //         position: 'top-center',
  //         autoClose: 1500,
  //       });
  //       setFormValue((prev: any) => ({
  //         ...prev,
  //         ["dateTo"]: "",
  //       }));
  //     }
  //   }
  // };

  const handleInputDateChange = (name: string, value: string) => {
    onChangeData(name, value);

    let dateFrom: any, dateTo: any;
    if (name === "dateTo") {
      dateFrom = new Date(formValue.dateFrom);
      dateTo = new Date(value);
    } else {
      dateFrom = new Date(value);
      dateTo = new Date(formValue.dateTo);
    }

    if (dateFrom && dateTo) {
      if (dateFrom > dateTo) {
        toast.error("Invalid Date End", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
        setFormValue((prev: any) => ({
          ...prev,
          ["dateTo"]: "",
        }));
      }
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    const loading = toast.loading("", {
      position: "top-center",
    });

    let params = {};
    if (formValue.dateFrom && !formValue.dateTo) {
      params = {
        trndte: `gte:${formValue.dateFrom}`,
      };
    } else if (!formValue.dateFrom && formValue.dateTo) {
      params = {
        trndte: `lte:${moment(formValue.dateTo)
          .add(1, "day")
          .format("YYYY-MM-DD")}`,
      };
    } else {
      params = {
        trndte: `and:[gte=${formValue.dateFrom},lte=${moment(formValue.dateTo)
          .add(1, "day")
          .format("YYYY-MM-DD")}]`,
      };
    }

    let jspdf: any;
    await getData("useractivitylog", params, async (res) => {
      console.log(res, "testing");
      const x = removeNewlines(res.data);
      console.log(x);

      if (res.data.length > 0) {
        const reportSetup: object = {
          orientation: "L",
          unit: "mm",
          format: "Letter",
        };
        jspdf = new jsPDF(reportSetup);

        let TOP = 10;
        let numPages = 1;

        const header = PrintHeader(
          jspdf,
          TOP,
          company.data[0].comdsc,
          numPages,
          formValue
        );
        jspdf = header.jspdf;
        TOP = header.TOP;

        console.log(res.data);

        jspdf = PrintDetail(
          jspdf,
          TOP,
          company.data[0].comdsc,
          numPages,
          formValue,
          res.data
        );

        jsPdfToPrint(jspdf, "pdf", "AuditTrail", formValue);
        postActivity({
          method: METHODS.PRINT,
          module: MODULES.AUDIT_TRAIL,
          remarks: `PRINT:\nTRANSACTION DATE STARTED:${formValue.dateFrom}\nTRANSACTION DATE END:${formValue.dateTo}`,
        });
      } else {
        toast.error("Nothing to Print", {
          position: "top-center",
          hideProgressBar: true,
          autoClose: 1500,
        });
      }
    });

    toast.dismiss(loading);
  };

  useEffect(() => {
    setFormValue((prev: any) => ({
      ...prev,
      ["repOptionSave"]: true,
      ["repOptionView"]: true,
      ["dateFrom"]: moment().format("YYYY-MM-DD"),
      ["dateTo"]: moment().format("YYYY-MM-DD"),
    }));
  }, []);

  return (
    <>
      <form id="at-form" onSubmit={onSubmit}>
        <InputDateV2
          description={"Date From"}
          name={"dateFrom"}
          id={"dateFrom"}
          value={formValue?.dateFrom}
          handleInputChange={handleInputDateChange}
        />
        <InputDateV2
          description={"Date To"}
          name={"dateTo"}
          id={"dateTo"}
          value={formValue?.dateTo}
          handleInputChange={handleInputDateChange}
          disabled={formValue?.dateFrom == "" ? true : false}
        />
      </form>

      <ButtonForm
        isShowWarningCancel
        dontEmptyUndefinedData
        data={formValue}
        formName="at-form"
        okBtnTxt={"OK"}
        isActivated={true}
      />
    </>
  );
}
