import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { EmptyInputIndicator } from "./EmptyInputIndicator";
import { InputError } from "./InputError";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { ChangeEventHandler } from "react";

interface InputDatePropsV2<TFieldValues extends FieldValues> {
  handleInputChange: (name: string, value: string) => void;
  name: string;
  register?: UseFormRegister<TFieldValues>;
  value: string | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  validate?: (value: string) => boolean | string;
  error?: FieldErrors<TFieldValues>;
}

export function InputDateV2<TFieldValues extends FieldValues>(props: InputDatePropsV2<TFieldValues>) {

  const dateFormat = "MM/DD/YYYY"

  return (
    <>
      <div className="py-3">
        <label
          htmlFor={props.id}
          className="block mb-2 text-xs text-black font-montserrat"
        >
          {props.description}
        </label>

        <DatePicker 
          className="w-full h-[35px]"
          format={dateFormat}
          value={!props.value ? null : dayjs(props.value)}
          onChange={(_, dateString)=>{
            props.handleInputChange(props.name, dateString as string);
            console.log(dateString);
          }}
        />

        {/* <input
          type="date"
          {...(props.register
            ? props.register(props.description, { required: props.required, validate: props.validate })
            : {})}
          aria-invalid={props.error && props.error[props.description] ? "true" : "false"}
          name={props.name}
          id={props.id}
          className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          onChange={props.handleInputChange}
          value={props.value}
          disabled={props.disabled}
          max={props?.max}
          min={props?.min}
        /> */}
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
    </>
  );
}



interface InputDateProps<TFieldValues extends FieldValues> {
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  name: string;
  register?: UseFormRegister<TFieldValues>;
  value: string | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  validate?: (value: string) => boolean | string;
  error?: FieldErrors<TFieldValues>;
}

export function InputDate<TFieldValues extends FieldValues>(props: InputDateProps<TFieldValues>) {


  return (
    <>
      <div className="py-3">
        <label
          htmlFor={props.id}
          className="block mb-2 text-xs text-black font-montserrat"
        >
          {props.description}
        </label>

        <input
          type="date"
          {...(props.register
            ? props.register(props.description, { required: props.required, validate: props.validate })
            : {})}
          aria-invalid={props.error && props.error[props.description] ? "true" : "false"}
          name={props.name}
          id={props.id}
          className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          onChange={props.handleInputChange}
          value={props.value}
          disabled={props.disabled}
          max={props?.max}
          min={props?.min}
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
    </>
  );
}
