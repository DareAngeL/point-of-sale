import { ChangeEventHandler } from "react";
import { UseFormRegister, FieldErrors, FieldValues, Path } from "react-hook-form";
import { EmptyInputIndicator } from "./EmptyInputIndicator";

interface InputTimeProps<TFieldValues extends FieldValues> {
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  register?: UseFormRegister<TFieldValues>;
  error?: FieldErrors<TFieldValues>;
  name: string;
  value?: string | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean | undefined;
  required?: boolean | false;
}

export function InputTime<TFieldValues extends FieldValues>({
  description,
  handleInputChange,
  register,
  error,
  id,
  name,
  value,
  disabled,
  required,
}: InputTimeProps<TFieldValues>) {
  return (
    <>
      <div className="py-3 w-full">
        <label
          htmlFor={id}
          className="block mb-2 text-xs text-black font-montserrat"
        >
          {description}
        </label>
        <input
          type="time"
          {...(register ? register(description, { required }) : {})}
          name={name}
          id={id}
          className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          onChange={handleInputChange}
          value={value ?? ""}
          disabled={disabled}
        />
        {error?.[description]?.type === "required" && (
          <EmptyInputIndicator description={description} />
        )}
      </div>
    </>
  );
}
