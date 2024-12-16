import {ChangeEvent, ChangeEventHandler} from "react";
import {FieldErrors, FieldValues, Path, UseFormRegister} from "react-hook-form";
import {EmptyInputIndicator} from "./EmptyInputIndicator";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";

interface InputNumberProps<TFieldValues extends FieldValues> {
  onInputBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  register?: UseFormRegister<TFieldValues>;
  onArrowClick?: (name: string, type: 'up' | 'down') => void;
  error?: FieldErrors<TFieldValues>;
  name: string;
  value?: number | undefined;
  id: string;
  description: Path<TFieldValues>;
  disabled?: boolean;
  required?: boolean | false;
  min?: string | undefined;
  placeholder?: string | undefined;
  width?: number;
  inputWidth?: number;
  orientation?: "landscape";
  disableTyping?: boolean;
  linkCentral?: boolean;
  defaultValue?: number;
  maxLength?: number;
  trailingText?: string;
  showArrow?: boolean;
}

export function InputNumber<TFieldValues extends FieldValues>({
  description,
  onInputBlur,
  handleInputChange,
  register,
  onArrowClick,
  showArrow,
  error,
  id,
  name,
  value,
  disabled,
  required,
  min,
  placeholder,
  width,
  inputWidth,
  orientation,
  disableTyping,
  linkCentral,
  defaultValue,
  maxLength,
  trailingText,
}: InputNumberProps<TFieldValues>) {

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (maxLength && value.length > maxLength) return;

    handleInputChange?.(e);
  }

  return (
    <>
      <div
        className={`py-3 ${width && `w-[${width}px]`} ${
          orientation && `flex items-center gap-10`
        }`}
      >
        <label
          htmlFor="itmdsc"
          className="block mb-2 text-xs text-black font-montserrat"
        >
          {description}
        </label>
        <div className="flex items-center">
          <div 
            id="input-container" 
            className={`relative flex`}
            style={{width: inputWidth ?? "100%"}}
          >
            <input
              onKeyDown={(e) => {
                disableTyping && e.preventDefault();
              }}
              type="number"
              {...(register ? register(description, {required}) : {})}
              aria-invalid={error && error[description] ? "true" : "false"}
              name={name}
              id={id}
              className={`${linkCentral && 'link-central'} bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 w-full`}
              onChange={onChange}
              onBlur={onInputBlur}
              value={value ?? ""}
              defaultValue={defaultValue ?? 1}
              disabled={disabled}
              min={min}
              placeholder={placeholder}
              {...(maxLength && {maxLength: maxLength})}
            />
            {showArrow && (
              <div className="absolute right-1 top-1.5 flex flex-col">
                <ArrowUpOutlined
                  className="arrow-up rounded-md"
                  onClick={() => onArrowClick?.(name, 'up')}
                />
                <ArrowDownOutlined
                  className="arrow-down rounded-md"
                  onClick={() => onArrowClick?.(name, 'down')}
                />
              </div>
            )}
          </div>
          {trailingText && (
            <span className="text-xs text-gray-400 ms-2 select-none">{trailingText}</span>
          )}
        </div>
        {error?.[description]?.type === "required" && (
          <EmptyInputIndicator description={description} />
        )}
      </div>
    </>
  );
}
