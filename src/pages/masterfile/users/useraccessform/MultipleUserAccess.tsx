import { ChangeEventHandler } from "react";
import { Checkbox } from "../../../../common/form/Checkbox";

interface MultipleUserAccessProps {
  men: any;
  userAccessForm: any;
  opened: any;
  index: any;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

export function MultipleUserAccess(props: MultipleUserAccessProps) {
  return (
    <>
      {props.men.multiple ? (
        <div
          className={`panel ${
            props.opened[props.men.menfield + props.index]
              ? "active border-b border-solid border-black"
              : ""
          }`}
        >
          {props.men.allowadd ? (
            <div className="pl-[50px]">
              <Checkbox
                description="ADD"
                name={props.men.menfield + "_allowadd"}
                id={props.men.menfield + "_allowadd"}
                value={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowadd"
                  ]
                }
                checked={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowadd"
                  ]
                    ? true
                    : false
                }
                handleInputChange={props.handleInputChange}
              />
            </div>
          ) : (
            <></>
          )}

          {props.men.allowedit ? (
            <div className="pl-[50px]">
              <Checkbox
                description="EDIT"
                name={props.men.menfield + "_allowedit"}
                id={props.men.menfield + "_allowedit"}
                value={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowedit"
                  ]
                }
                checked={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowedit"
                  ]
                    ? true
                    : false
                }
                handleInputChange={props.handleInputChange}
              />
            </div>
          ) : (
            <></>
          )}

          {props.men.allowdelete ? (
            <div className="pl-[50px]">
              <Checkbox
                description="DELETE"
                name={props.men.menfield + "_allowdelete"}
                id={props.men.menfield + "_allowdelete"}
                value={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowdelete"
                  ]
                }
                checked={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowdelete"
                  ]
                    ? true
                    : false
                }
                handleInputChange={props.handleInputChange}
              />
            </div>
          ) : (
            <></>
          )}

          {props.men.allowimport ? (
            <div className="pl-[50px]">
              <Checkbox
                description="IMPORT"
                name={props.men.menfield + "_allowimport"}
                id={props.men.menfield + "_allowimport"}
                value={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowimport"
                  ]
                }
                checked={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowimport"
                  ]
                    ? true
                    : false
                }
                handleInputChange={props.handleInputChange}
              />
            </div>
          ) : (
            <></>
          )}

          {props.men.allowresend ? (
            <div className="pl-[50px]">
              <Checkbox
                description="RE-SEND"
                name={props.men.menfield + "_allowresend"}
                id={props.men.menfield + "_allowresend"}
                value={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowresend"
                  ]
                }
                checked={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowresend"
                  ]
                    ? true
                    : false
                }
                handleInputChange={props.handleInputChange}
              />
            </div>
          ) : (
            <></>
          )}

          {props.men.allowvoid ? (
            <div className="pl-[50px]">
              <Checkbox
                description="VOID"
                name={props.men.menfield + "_allowvoid"}
                id={props.men.menfield + "_allowvoid"}
                value={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowvoid"
                  ]
                }
                checked={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowvoid"
                  ]
                    ? true
                    : false
                }
                handleInputChange={props.handleInputChange}
              />
            </div>
          ) : (
            <></>
          )}

          {props.men.allowprint ? (
            <div className="pl-[50px]">
              <Checkbox
                description="PRINT"
                name={props.men.menfield + "_allowprint"}
                id={props.men.menfield + "_allowprint"}
                value={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowprint"
                  ]
                }
                checked={
                  props.userAccessForm[props.men.menfield][
                    props.men.menfield + "_allowprint"
                  ]
                    ? true
                    : false
                }
                handleInputChange={props.handleInputChange}
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
