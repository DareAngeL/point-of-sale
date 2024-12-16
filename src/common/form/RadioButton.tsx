import {ChangeEventHandler} from "react";

interface RadioButtonProps {
  name: string;
  id?: string;
  radioDatas: {name: string; id: string; value: any}[];
  value: any;
  description: string;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
  isLandscape?: boolean;
  disabled?: boolean;
}

export function RadioButton(props: RadioButtonProps) {
  return (
    <>
      <div className="py-3 ">
        <label className="block mb-2 text-xs text-black font-montserrat cursor-pointer ">
          {props.description}
        </label>
        {props?.isLandscape ? (
          <div className="flex justify-evenly  ">
            {props.radioDatas.map((item, index) => (
              <div className="flex items-center" key={index}>
                <input
                  disabled={props.disabled}
                  className="w-[30px] h-[15px] cursor-pointer "
                  type="radio"
                  key={item.id}
                  name={props.name}
                  id={item.id}
                  value={item.value}
                  // checked={props.value == item.value}
                  checked={
                    props.value === item.value || (index === 0 && !props.value)
                  }
                  onChange={props.handleInputChange}
                />
                <label className="cursor-pointer" htmlFor={item.id}>
                  {item.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          props.radioDatas.map((item, index) => (
            <div className="flex items-center" key={index}>
              <input
                className="w-[30px] h-[15px] cursor-pointer"
                type="radio"
                key={item.id}
                name={props.name}
                id={item.id}
                value={item.value}
                checked={props.value == item.value}
                onChange={props.handleInputChange}
                disabled={props.disabled}
              />
              <label className="cursor-pointer" htmlFor={item.id}>
                {item.name}
              </label>
            </div>
          ))
        )}

        {}
      </div>
    </>
  );
}
