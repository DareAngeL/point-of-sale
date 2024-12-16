import { MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { Checkbox } from "../../../../common/form/Checkbox";
import React from "react";

interface ExpandableMultiSelectionProps {
  title: string;
  name: string;
  id: string;
  value: string;
  checked: boolean;
  expanded?: boolean;
  children?: React.ReactNode;
  underline?: boolean;
  showIcons?: boolean;
  onExpand?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ExpandableMultiSelection(props: ExpandableMultiSelectionProps) {
  const {
    title,
    checked,
    handleInputChange,
    id,
    name,
    value,
    children,
  } = props;

  const iconStyle = "flex items-center justify-center mx-1"

  return (
    <>
      <div className="flex flex-col">
        <div className="flex">
          {React.Children.count(children) > 1 && (
            props.expanded ? <MinusSquareOutlined onClick={props.onExpand} className={iconStyle}/> : <PlusSquareOutlined onClick={props.onExpand} className={iconStyle}/>
          )}

          {props.showIcons ? (
            <label className="my-2 text-sm">
              {title}
            </label>
          ) : (
            <Checkbox
              description={title}
              name={name}
              id={id}
              value={value}
              checked={checked}
              handleInputChange={handleInputChange}
            />
          )}
        </div>

        {props.underline && (
          <div className="border-b border-gray-400 w-full" /> 
        )}

        {props.expanded && (
          <div className="ms-10">
            {children}
          </div>
        )}
      </div>
    </>
  );
}
