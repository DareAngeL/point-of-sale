import {ChangeEventHandler} from "react";
import {FieldErrors, FieldValues, Path, UseFormRegister} from "react-hook-form";
import {EmptyInputIndicator} from "./EmptyInputIndicator";

interface CheckboxProps<TFieldValues extends FieldValues> {
  handleInputChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  register?: UseFormRegister<TFieldValues>;
  error?: FieldErrors<TFieldValues>;
  checked: boolean | undefined;
  id: string;
  name: string;
  description: Path<TFieldValues>;
  value?: any;
  disabled?: boolean | undefined;
  className?: string;
  required?: boolean | false;
  alignment?: string | "flex-row-reverse";
  linkCentral?: boolean;
  fontSize?: string;
}

export function Checkbox<TFieldValues extends FieldValues>({
  description,
  handleInputChange,
  register,
  required,
  error,
  id,
  name,
  checked,
  value,
  disabled,
  className,
  alignment,
  linkCentral,
  fontSize,
}: CheckboxProps<TFieldValues>) {
  return (
    <>
      <div
        className={`py-3 flex group ${
          alignment ? alignment : "flex-row-reverse justify-end"
        } items-center ${className && className}`}
      >
        <label
          htmlFor={id}
          className={`${linkCentral && "link-central"} block m-0 ${
            fontSize ? `text-[${fontSize}] ` : `text-xs`
          } text-black font-montserrat select-none cursor-pointer ${className && className}`}
        >
          {description}
        </label>
        <input
          type="checkbox"
          {...(register ? register(description, {required}) : {})}
          aria-invalid={error && error[description] ? "true" : "false"}
          name={name}
          id={id}
          className={`${
            linkCentral && "link-central"
          } me-1 bg-white border text-black sm:text-lg rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 w-[1rem] h-6 cursor-pointer ${className && className}`}
          onChange={handleInputChange}
          checked={checked}
          value={value}
          disabled={disabled ? disabled : false}
        />
      </div>
      {error?.[description]?.type === "required" && (
        <EmptyInputIndicator description={description} />
      )}
    </>
  );
}
