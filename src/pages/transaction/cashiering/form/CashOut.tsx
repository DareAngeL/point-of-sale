import {useCashiering} from "../../../../hooks/cashieringHooks";
import {CashieringTransactType} from "../cashieringEnums";
import {CashieringNumberButtonGroup} from "../common/buttons/CashieringNumberButtonGroup";
import {ClearSaveButtons} from "../common/buttons/ClearSaveButtons";
import {TextInput} from "../common/input/TextInput/TextInput";
import {useAppDispatch} from "../../../../store/store";
import {handleCashTotal} from "../../../../reducer/transactionSlice";

export function CashOut() {
  const {changeInput, clearInput, eraseLastInput, saveInput, inputValue} =
    useCashiering();
  const appDispatch = useAppDispatch();

  return (
    <>
      <form
        className="flow"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      >
        <TextInput input={inputValue} />
        <CashieringNumberButtonGroup
          onButtonClick={(btn: string) => changeInput(btn)}
          onEraseBtnClick={eraseLastInput}
        />
        <ClearSaveButtons
          onClear={clearInput}
          onSave={() => {
            saveInput(CashieringTransactType.CASHOUT);
            appDispatch(handleCashTotal(parseFloat(inputValue)));
          }}
          onCancel={eraseLastInput}
          hasPrint={false}
        />
      </form>
    </>
  );
}
