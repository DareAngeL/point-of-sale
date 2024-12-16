import {CashieringNumberButtonGroup} from "../common/buttons/CashieringNumberButtonGroup";
import {ClearSaveButtons} from "../common/buttons/ClearSaveButtons";
import {
  useCashiering,
  usePrintReceipt,
} from "../../../../hooks/cashieringHooks";
import {TextInput} from "../common/input/TextInput/TextInput";
import {CashieringTransactType} from "../cashieringEnums";
import {useAppDispatch} from "../../../../store/store";
import { handleCashTotal } from "../../../../reducer/transactionSlice";
import { getLastTransaction, hasCashfund } from "../../../../store/actions/posfile.action";
import { Modal } from "antd";

export function CashFund() {
  const {changeInput, clearInput, eraseLastInput, inputValue, openWarningModal, setOpenWarningModal, saveInput} =
    useCashiering();
  const {handlePrintingOnSave, inializePrinter} = usePrintReceipt();
  const dispatch = useAppDispatch();

  inializePrinter();

  const handleOnButtonClick = (btn: string) => {
    changeInput(btn);
  };

  return (
    <>
      <Modal 
        open={openWarningModal}
        title="You are about to cash fund with '0' total. Are you sure?"
        okButtonProps={{style: {backgroundColor: 'green'}}}
        onOk={() => {
          dispatch(handleCashTotal(parseFloat(inputValue)));
          saveInput(CashieringTransactType.CASHFUND, () => {
            dispatch(hasCashfund());
            dispatch(getLastTransaction());
            handlePrintingOnSave(true);
          });
        }}
        onCancel={() => setOpenWarningModal(false)}
      />

      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
        className="flex flex-col gap-1"
      >
        <TextInput input={inputValue} />
        <CashieringNumberButtonGroup
          onButtonClick={handleOnButtonClick}
          onEraseBtnClick={eraseLastInput}
        />
        <ClearSaveButtons
          onClear={clearInput}
          onSave={() => {
            if (inputValue === "0") {
              setOpenWarningModal(true);
              return;
            }

            dispatch(handleCashTotal(parseFloat(inputValue)));
            saveInput(CashieringTransactType.CASHFUND, () => {
              dispatch(hasCashfund());
              dispatch(getLastTransaction());
              handlePrintingOnSave(true);
            });
          }}
          onCancel={clearInput}
          hasPrint={false}
        />
      </form>
    </>
  );
}
