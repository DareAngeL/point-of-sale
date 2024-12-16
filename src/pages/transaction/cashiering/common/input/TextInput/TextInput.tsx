/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {useEffect, useMemo, useRef} from "react";

interface TextInputProps {
  input: string;
  maxWidth?: number;
}

export function TextInput(props: TextInputProps) {
  const {input} = props;
  const inputRef = useRef<HTMLDivElement>(null);

  const formattedNum = useMemo(() => {
    let formattedInput = input;
    const fractNumCount = input.split(".")[1];
    if (!fractNumCount) {
      formattedInput = input.concat(input.includes(".") ? "00" : ".00");
    } else if (fractNumCount.length === 1) {
      formattedInput = input.concat("0");
    }

    return `₱${formattedInput.replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  }, [input]);

  // always scrolls to see the last character entered
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [input]);

  return (
    <>
      <div className="text-right px-2 py-2 border-b-4 border-slate-600 rounded-lg text-2xl">
        <div ref={inputRef} className={`overflow-hidden ${props.maxWidth&&`max-w-[${props.maxWidth}]`} w-full`}>
          <span>{formattedNum}</span>
        </div>
      </div>
    </>
  );
}
