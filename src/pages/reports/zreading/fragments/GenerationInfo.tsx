import moment from "moment";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { formatTimeTo12Hour } from "../../../../helper/Date";
import { useAppSelector } from "../../../../store/store";

interface GenerationInfoProps {
  allLoadedData: any[];
  hasOpenTran: boolean;
  switchToAuth: () => void;
  switchToFileTypeSelection: () => void;
}

export function GenerationInfo (props: GenerationInfoProps)  {

  const { masterfile, transaction } = useAppSelector(state => state);
  const { syspar } = masterfile;
  const { lastTransaction } = transaction;

  const authZRead = syspar.data[0].auth_report;

  const onConfirm = () => {
    if (authZRead === 0) {
      props.switchToAuth();
    } else {
      props.switchToFileTypeSelection();
    }
  }

  return (
    <>
      {props.allLoadedData.length > 0 ? (
        <>
          {/* If it has open transactions it means, this cashier didn't generate z-reading yesterday or the other days */}
          {props.hasOpenTran && (
            <p className="bg-yellow-200 text-[12px] p-1 font-bold mb-2">
              <span className="text-red-700">Note:</span> We have found open order. This will be automatically closed.
            </p>
          )}

          {!props.hasOpenTran && syspar.data[0].robinson == 1 && syspar.data[0].timestart != "00:00:00" && (
            <p className="bg-yellow-200 text-[12px] p-1 font-bold mb-2">
              <span className="text-red-700">Note:</span> This action will locked the transactions until next operation at {formatTimeTo12Hour(syspar.data[0].timestart || "03:59:00")}.
            </p>
          )}

          {!props.hasOpenTran && syspar.data[0].robinson != 1 && (
            <p className="bg-yellow-200 text-[12px] p-1 font-bold mb-2">
              <span className="text-red-700">Note:</span> This action will locked the transactions until next operation at {formatTimeTo12Hour(syspar.data[0].timestart || "00:00:00")}.
            </p>
          )}
          <p>
          Generate Z-Reading for {
            moment(props.allLoadedData[0].trndte).format(
              "MM-DD-YYYY"
            )}?
          </p>
          <ButtonForm
            okBtnTxt="Confirm"
            formName={""}
            isActivated
            onOkBtnClick={onConfirm}
          />
        </>
      ) : (
        <>
          {lastTransaction.trntyp === "GRANDTOTAL" ? (
            <>
              {syspar.data[0].robinson == 1 && syspar.data[0].timestart != "00:00:00" ? (<>
                <p className="bg-yellow-200 text-[12px] p-1 font-bold mb-2">
                  <span className="text-red-700">Note:</span> Transaction is lock until next operation at {formatTimeTo12Hour("09:00:00")}.
                </p>
              </>):(<>
                <p className="bg-yellow-200 text-[12px] p-1 font-bold mb-2">
                  <span className="text-red-700">Note:</span> Transaction is lock until next operation at {formatTimeTo12Hour(syspar.data[0].timestart || "00:00:00")}.
                </p>
              </>)}
              <p>ZReading is done for the day.</p>
            </>
          ) : (
            <>
              <h1>Generate Z-Reading:</h1>
              <p className="text-sm text-slate-700">All set and done!</p>
            </>
          )}
        </>
      )}
    </>
  )
}