import { ChangeEventHandler } from "react";
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { EmptyInputIndicator } from "./EmptyInputIndicator";
import { InputError } from "./InputError";
interface InputTextProps<TFieldValues extends FieldValues> {
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  register?: UseFormRegister<TFieldValues>;
  error?: FieldErrors<TFieldValues>;
  name: string;
  value: string | number | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean;
  required?: boolean | false;
  readonly?: boolean | false;
  isValid?: boolean;
  errorDescription?: string;
  placeholder?: string | undefined;
  linkCentral?: boolean;
  maxLength?: number;
  validate?: (value: string) => boolean | string;
  ref?:React.Ref<HTMLInputElement>
}

export function InputText<TFieldValues extends FieldValues>({
  description,
  handleInputChange,
  register,
  required,
  error,
  id,
  name,
  value,
  disabled,
  readonly,
  placeholder,
  linkCentral,
  maxLength,
  validate,
  ref
}: InputTextProps<TFieldValues>) {
  return (
    <>
      <div className="py-3 w-[100%]">
        <label
          htmlFor={id}
          className="block mb-2 text-xs text-black font-montserrat"
        >
          {description}
        </label>
        <input
          type="text"
          {...(register
            ? register(description, { required, validate: validate })
            : {})}
          aria-invalid={error && error[description] ? "true" : "false"}
          name={name}
          id={id}
          className={`${
            linkCentral && "link-central"
          } border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${disabled?'bg-gray-100 cursor-not-allowed':'bg-white'}`}
          onChange={handleInputChange}
          value={value ?? ""}
          disabled={disabled}
          readOnly={readonly}
          placeholder={placeholder}
          {...(maxLength && {maxLength: maxLength})}
          ref={ref}
        />
        {error?.[description]?.type === "required" && (
          <EmptyInputIndicator description={description} />
        )}
        {error?.[description]?.type === "validate" && (
          <InputError
            description={""}
            errorDescription={error[description]?.message}
          />
        )}
      </div>
    </>
  );
}
