import { ChangeEventHandler } from "react";
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { EmptyInputIndicator } from "./EmptyInputIndicator";

interface InputPasswordProps<TFieldValues extends FieldValues> {
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  register?: UseFormRegister<TFieldValues>;
  error?: FieldErrors<TFieldValues>;
  name: string;
  value: string | number | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean;
  required?: boolean | false;
  placeholder?: string;
  onEnterKey?: () => void;
  autoFocus?: boolean;
  readonly?: boolean;
}

export function InputPassword<TFieldValues extends FieldValues>({
  description,
  handleInputChange,
  register,
  required,
  error,
  id,
  name,
  value,
  disabled,
  placeholder,
  onEnterKey,
  autoFocus,
  readonly
}: InputPasswordProps<TFieldValues>) {
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
          type="password"
          {...(register ? register(description, { required }) : {})}
          aria-invalid={error && error[description] ? "true" : "false"}
          name={name}
          id={id}
          className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEnterKey && onEnterKey();
            }
          }}
          value={value ?? ""}
          disabled={disabled}
          placeholder={placeholder && placeholder}
          readOnly={readonly}
          autoFocus={autoFocus}
        />
        {error?.[description]?.type === "required" && (
          <EmptyInputIndicator description={description} />
        )}
      </div>
    </>
  );
}
