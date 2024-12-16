import moment from "moment";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { useAppSelector } from "../../../../store/store";

interface NoEODFragmentProps {
  switchToAuth: () => void;
  switchToFileTypeSelection: () => void;
}

export function NoEODFragment(props: NoEODFragmentProps) {

  const { masterfile, transaction } = useAppSelector((state) => state);
  const { noEOD } = transaction;
  const authZRead = masterfile.syspar.data[0].auth_report;

  const onConfirm = () => {
    if (authZRead === 0) {
      props.switchToAuth();
    } else {
      props.switchToFileTypeSelection();
    }
  }

  return (
    <>
      <div>
        <p>Generate Z-Reading from {moment(noEOD.from).format('MM-DD-YYYY')} to {moment(noEOD.to).format('MM-DD-YYYY')}</p>
        <ButtonForm
          formName={""}
          okBtnTxt="Confirm"
          onOkBtnClick={onConfirm}
          isActivated
        />
      </div>
    </>
  );
}