import {ChangeEventHandler} from "react";
import {FieldErrors, FieldValues, Path, UseFormRegister} from "react-hook-form";
import {EmptyInputIndicator} from "./EmptyInputIndicator";
import { NumericFormat } from "react-number-format";

interface InputPesoNumberProps<TFieldValues extends FieldValues> {
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  register?: UseFormRegister<TFieldValues>;
  error?: FieldErrors<TFieldValues>;
  name: string;
  value?: number | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean;
  required?: boolean | false;
  placeholder?: string | undefined;
  width?: number;
  orientation?: "landscape";
}

export function InputPesoNumber<TFieldValues extends FieldValues>({
  description,
  handleInputChange,
  register,
  error,
  id,
  name,
  value,
  disabled,
  required,
  placeholder,
  width,
  orientation,
}: InputPesoNumberProps<TFieldValues>) {

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: e.target.value.replace('₱', '').replace(',', '')
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange && handleInputChange(newEvent);
  }

  return (
    <>
      <div
        className={`py-3 ${width && `w-[${width}px]`} ${
          orientation && `flex items-center gap-10`
        } `}
      >
        <label
          htmlFor="itmdsc"
          className="block mb-2 text-xs text-black font-montserrat"
        >
          {description}
        </label>
        <NumericFormat
          aria-invalid={error && error[description] ? "true" : "false"}
          decimalSeparator={"."}
          decimalScale={2}
          thousandSeparator={true}
          allowNegative={false}
          {...(register ? register(description, {required}) : {})}
          name={name}
          id={id}
          className={`bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${disabled && `hover:bg-gray-200 hover:cursor-not-allowed`}`}
          value={value||0}
          prefix="₱"
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
        />
        {error?.[description]?.type === "required" && (
          <EmptyInputIndicator description={description} />
        )}
      </div>
    </>
  );
}
