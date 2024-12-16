import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { EmptyInputIndicator } from "./EmptyInputIndicator";
import { InputError } from "./InputError";
import { TimePicker } from "antd";
import dayjs from "dayjs";

interface InputHourPropsV2<TFieldValues extends FieldValues> {
  handleInputChange: (name: string, value: string) => void;
  name: string;
  register?: UseFormRegister<TFieldValues>;
  value: string | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean;
  required?: boolean;
  validate?: (value: string) => boolean | string;
  error?: FieldErrors<TFieldValues>;
}

export function InputHourV2<TFieldValues extends FieldValues>(
  props: InputHourPropsV2<TFieldValues>
) {
  const format = "HH:mm";

  return (
    <div className="py-3">
      <label
        htmlFor={props.id}
        className="block mb-2 text-xs text-black font-montserrat"
      >
        {props.description}
      </label>

      <TimePicker
        className="w-full h-[35px]"
        format={format}
        value={props.value ? dayjs(props.value, format) : null}
        onChange={(_, timeString) => {
          props.handleInputChange(props.name, timeString as string);
        }}
        disabled={props.disabled}
      />

      {props.error?.[props.description]?.type === "required" && (
        <EmptyInputIndicator description={props.description} />
      )}
      {props.error?.[props.description]?.type === "validate" && (
        <InputError
          description={""}
          errorDescription={props.error[props.description]?.message}
        />
      )}
    </div>
  );
}
