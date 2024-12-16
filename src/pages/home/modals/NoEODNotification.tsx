import { useNavigate } from "react-router";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { useAppSelector } from "../../../store/store";
import { useModal } from "../../../hooks/modalHooks";
import moment from "moment";

export function NoEODNotification() {
  const { noEOD } = useAppSelector((state) => state.transaction);
  const mallHookUp = useAppSelector((state) => state.masterfile.mallHookUp);
  const { dispatch } = useModal();
  const navigate = useNavigate();

  const onGoToReports = () => {
    navigate("/pages/reports");
    dispatch();
  };

  return (
    <>
      {mallHookUp.data?.mallname === "Robinsons" ? (
        <>
          <p>Previous’ day’s EOD was not performed</p>
          {/* <p>Did not perform EOD last {noEOD.from === noEOD.to ? `${moment(noEOD.from).format('MM-DD-YYYY')}` : `${moment(noEOD.from).format('MM-DD-YYYY')} to ${moment(noEOD.to).format('MM-DD-YYYY')}`} </p> */}
          <ButtonForm
            formName={""}
            okBtnTxt="GO TO REPORTS"
            isActivated={true}
            cancelBtnTxt="CANCEL"
            onOkBtnClick={onGoToReports}
          />
        </>
      ) : (
        <>
          <p>
            You need to generate Z-Reading{" "}
            {noEOD.from === noEOD.to
              ? `for ${moment(noEOD.from).format("MM-DD-YYYY")}`
              : `from ${moment(noEOD.from).format("MM-DD-YYYY")} to ${moment(
                  noEOD.to
                ).format("MM-DD-YYYY")}`}{" "}
          </p>
          <ButtonForm
            formName={""}
            okBtnTxt="GO TO REPORTS"
            isActivated={true}
            cancelBtnTxt="CANCEL"
            onOkBtnClick={onGoToReports}
          />
        </>
      )}
    </>
  );
}
