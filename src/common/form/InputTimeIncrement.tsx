import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { EmptyInputIndicator } from "./EmptyInputIndicator"
import { ChangeEventHandler, useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button } from "antd";


interface InputTimeIncrement<TFieldValues extends FieldValues>{
    handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
    register?: UseFormRegister<TFieldValues>;
    error?: FieldErrors<TFieldValues>;
    name: string;
    value?: number;
    id: string;
    description: Path<TFieldValues>;
    disabled?: boolean | undefined;
    required?: boolean | false;
    handleInputToggle: (value: number) => void;

}

export const InputTimeIncrement = <TFieldValues extends FieldValues>({
    description,
    handleInputChange,
    register,
    error,
    id,
    name,
    value,
    required,
    handleInputToggle
}: InputTimeIncrement<TFieldValues>) => {

    const [mins, setMins] = useState(value);

    const increment =() => {
        console.log(mins);
        const num = mins ?? 0;

        setMins(num+30);
        handleInputToggle(num+30);
    }

    const decrement = () => {
        const num = mins ?? 30;
        setMins((num)<=30?30:(num)-30);
        handleInputToggle(num+30);
    }

    return(
        <>
            
            <div className="py-3 w-full">
                <label
                    htmlFor={id}
                    className="block mb-2 text-xs text-black font-montserrat"
                >
                    {description}
                </label>
                <div className="flex items-center justify-between">
                    <div className="w-5/6">
                        <input
                            type="text"
                            {...(register ? register(description, { required }) : {})}
                            name={name}
                            id={id}
                            className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            onChange={handleInputChange}
                            value={mins}
                            disabled={true}
                        />
                        {error?.[description]?.type === "required" && (
                        <EmptyInputIndicator description={description} />
                        )}
                    </div>
                    <div className="w-1/6 flex justify-evenly items-center">
                        <Button shape="circle" onClick={increment} icon={<UpOutlined />}/>
                        <Button shape="circle" onClick={decrement} icon={<DownOutlined />}/>
                    </div>
                </div>
            </div>
        </>
    )

}