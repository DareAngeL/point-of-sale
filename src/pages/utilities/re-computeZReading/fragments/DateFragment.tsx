import {InputDateV2} from "../../../../common/form/InputDate";

interface DateFromDateToProps {
  handleInputChange: (name: string, value: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onConfirm: () => void;
}

export function DateFragment(props: DateFromDateToProps) {
  return (
    <>
      <InputDateV2
        description={"Start"}
        name={"dateFrom"}
        id={"dateFrom"}
        value={props.dateFrom}
        handleInputChange={props.handleInputChange}
      />
      <InputDateV2
        description={"End"}
        name={"dateTo"}
        id={"dateTo"}
        value={props.dateTo}
        handleInputChange={props.handleInputChange}
        disabled={props.dateFrom === "" ? true : false}
        min={props?.dateFrom}
      />
      <div className="mt-8 flex justify-center">
        <button
          // disabled={!props.dateFrom || (!props.dateTo && true)}
          type="button"
          onClick={props.onConfirm}
          className="font-bold bg-green-600 w-[200px] h-[50px] hover:bg-white hover:text-green-600 hover:border hover:border-green-600 text-white transition-all duration-300 ease-in-out cursor-pointer"
        >
          Confirm
        </button>
      </div>
    </>
  );
}
