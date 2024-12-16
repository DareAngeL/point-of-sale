import { InputDateV2 } from "../../../../common/form/InputDate";
import { Alert, Button } from "antd";

interface DateFromDateToProps {
  handleInputChange: (name: string, value: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onConfirm: () => void;
}

interface HourlyProps {
  handleInputChange: (name: string, value: string) => void;
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  onConfirm: () => void;
}

export function DateFragmentSingle(props: DateFromDateToProps) {
  return (
    <>
      <InputDateV2
        description={"Start"}
        name={"dateFrom"}
        id={"dateFrom"}
        value={props.dateFrom}
        handleInputChange={props.handleInputChange}
      />
      <div className="mt-8 flex justify-center">
        <button
          disabled={!props.dateFrom}
          type="button"
          onClick={props.onConfirm}
          className="font-bold bg-green-600 w-[200px] h-[50px] hover:bg-white hover:text-green-600 hover:border hover:border-green-600 text-white transition-all duration-300 ease-in-out cursor-pointer  "
        >
          Confirm
        </button>
      </div>
    </>
  );
}

export function DateFragment(props: DateFromDateToProps) {
  return (
    <>
      <Alert
        message="Base on the Z-READING of the selected date"
        type="info"
        showIcon
      />
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
        min={props.dateFrom}
        // min="2023-09-26"
      />
      <div className="mt-8 flex justify-center">
        <Button
          disabled={!props.dateFrom || (!props.dateTo && true)}
          onClick={props.onConfirm}
          type="primary"
          style={{ padding: 30 }}
        >
          Generate Daily
        </Button>
      </div>
    </>
  );
}

export function HourlyFragment(props: HourlyProps) {
  return (
    <>
      <Alert
        message="Base on the hourly transactions of the selected date"
        type="info"
        showIcon
      />
      <InputDateV2
        description={"Select Date"}
        name={"date"}
        id={"date"}
        value={props.date}
        handleInputChange={props.handleInputChange}
      />
      <div className="mt-8 flex justify-center">
        <Button
          disabled={!props.date}
          onClick={props.onConfirm}
          type="primary"
          style={{ padding: 30 }}
        >
          Generate Hourly
        </Button>
      </div>
    </>
  );
}
