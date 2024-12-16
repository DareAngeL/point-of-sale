import { ChangeEventHandler, useEffect } from "react";
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { EmptyInputIndicator } from "./EmptyInputIndicator";

interface SelectionProps<TFieldValues extends FieldValues> {
  handleSelectChange: ChangeEventHandler<HTMLSelectElement> | undefined;
  register?: UseFormRegister<TFieldValues>;
  error?: FieldErrors<TFieldValues>;
  description: Path<TFieldValues>;
  value?: string | number | undefined;
  id: string;
  name: string;
  index?: number;
  keyValuePair: { value?: string | number; key?: string }[] | undefined;
  disabled?: boolean | false;
  isWidthFull?: boolean;
  required?: boolean | false;
  className?: string;
  showEmptyIndicator?: boolean;
  linkCentral?: boolean;
  onShowEmptyIndicator?: (isShown: boolean) => void;
}

export function Selection<TFieldValues extends FieldValues>({
  description,
  handleSelectChange,
  register,
  error,
  id,
  name,
  value,
  disabled,
  keyValuePair,
  isWidthFull,
  index,
  className,
  showEmptyIndicator,
  linkCentral,
  onShowEmptyIndicator,
}: SelectionProps<TFieldValues>) {

  useEffect(() => {
    onShowEmptyIndicator &&
      onShowEmptyIndicator(
        showEmptyIndicator || error?.[description]?.type === "required"
      );
  }, [showEmptyIndicator, error?.[description]]);

  const checker = () => {
    

    const findValue = keyValuePair?.find((d: any)=> d.value == value)
    return (!findValue?"":findValue.value) as  string;


  }

  return (
    <>
      <div
        className={
          (isWidthFull ? "py-3 w-full" : "py-3") + className && className
        }
      >
        <label htmlFor={id} className="block mb-2 text-xs text-black font-montserrat">
          {description}
        </label>
        <select
          {...(register ? register(description) : {})}
          aria-invalid={error && error[description] ? "true" : "false"}
          name={name}
          id={index?.toString() || id}
          className={`${linkCentral&&'link-central'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} bg-white border text-black text-3xl rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 `}
          onChange={handleSelectChange}
          value={checker()}
          disabled={disabled}
        >
          <option value={""} disabled selected>
            -- Select an option --
          </option>
          
          {keyValuePair?.map((kvp) =>
            Object.keys(kvp).length === 0 ? (
              ""
            ) : (
              <option key={kvp.key} value={kvp.value}>
                {kvp.key}
              </option>
            )
          )}
        </select>
        {(showEmptyIndicator || error?.[description]?.type === "required") && (
          <EmptyInputIndicator description={description || "This field"} />
        )}
      </div>
    </>
  );
}
