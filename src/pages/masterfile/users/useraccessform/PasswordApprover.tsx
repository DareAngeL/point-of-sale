import { ChangeEventHandler } from "react";
import { Checkbox } from "../../../../common/form/Checkbox";

interface PasswordApproverProps {
  menu: any;
  data: any;
  opened: any;
  index: any;
  toggleFunc: any;
  checkAll: any;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

export function PasswordApprover(props: PasswordApproverProps) {
  return (
    <>
      <div className="shadow-xl">
        <div className="ml-[20px]">
          <Checkbox
            description="ALLOW PRINTING OF DATE RANGE"
            name="prntrange"
            id="prntrange"
            value={props.data?.prntrange}
            checked={props.data?.prntrange ? true : false}
            handleInputChange={props.handleInputChange}
          />
        </div>

        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <img
              className="w=[20px] h-[20px] relative cursor-pointer"
              src={props.opened[`image${props.index}`]}
              onClick={() => props.toggleFunc(props.index)}
              alt=""
            />

            <Checkbox
              description={props.menu[0].mengrp}
              name="approver"
              id="approver"
              value={props.data?.approver}
              checked={props.data?.approver ? true : false}
              handleInputChange={(e) =>
                props.checkAll(e, props.menu, "APPROVER")
              }
            />
          </div>

          <div
            className={`panel ${
              props.opened["ind" + props.index] ? "active" : ""
            }`}
          >
            <label className="ml-[35px] text-[11px]">
              <span className="text-red-700">Note:</span> The access below
              required a password of a supervisor
            </label>

            {props.menu.map((men: any) => (
              <div className="ml-[35px] pr-[5px]">
                <label className="text-[12px]">{men.mencap}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
