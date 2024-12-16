import { useNavigate } from "react-router";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { toggle } from "../../../reducer/modalSlice";
import moment from "moment";
import { CashieringTransactType } from "../../transaction/cashiering/cashieringEnums";
import { InfoCircleOutlined } from "@ant-design/icons";

export function IsZread() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: mallHookup } = useAppSelector(
    (state) => state.masterfile.mallHookUp
  );
  const { remainingZread } = useAppSelector((state) => state.order);
  const { lastTransaction, isEnd } = useAppSelector(
    (state) => state.transaction
  );
  const { syspar, mallHookUp } = useAppSelector((state) => state.masterfile);

  const onConfirm = () => {
    dispatch(toggle());

    if (lastTransaction.trntyp !== CashieringTransactType.CASH_DECLARATION) {
      navigate("/pages/cashiering");
      return;
    }

    navigate("/pages/reports/ZReading");
  };

  console.log("this is the mallname", mallHookup?.mallname);

  return (
    <>
      <div id="x">
        {mallHookUp.data?.mallname === "Robinsons" ? (
          <p>
            {/* Did not perform EOD last{" "}
            {isEnd && !syspar.data[0].timeformat
              ? moment(new Date()).format("MM-DD-YYYY")
              : moment(remainingZread.data?.date).format("MM-DD-YYYY")} */}
            Previous’ day’s EOD was not performed
          </p>
        ) : (
          <p>
            You did not perform Z-reading last{" "}
            {isEnd && !syspar.data[0].timeformat
              ? moment(new Date()).format("MM-DD-YYYY")
              : moment(remainingZread.data?.date).format("MM-DD-YYYY")}
          </p>
        )}
        {lastTransaction.trntyp !== CashieringTransactType.CASH_DECLARATION && (
          <div className="flex items-center rounded-md p-1 bg-slate-50">
            <InfoCircleOutlined className="mx-1 text-[#FFA500]" />
            <p className="text-[13px]">
              It appears that the Cash Declaration has not been completed.
              <br /> We will redirect you to the page to perform this action
            </p>
          </div>
        )}
        <ButtonForm
          formName={"x"}
          okBtnTxt={
            lastTransaction.trntyp !== CashieringTransactType.CASH_DECLARATION
              ? "GO TO CASHIERING"
              : "GO TO REPORTS"
          }
          cancelBtnTxt="Cancel"
          isActivated={true}
          onOkBtnClick={onConfirm}
        />
      </div>
    </>
  );
}
