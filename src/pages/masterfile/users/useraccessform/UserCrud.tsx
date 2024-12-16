import { ChangeEventHandler } from "react";
import { Checkbox } from "../../../../common/form/Checkbox";

interface UserCrudProps {
  men: any;
  userAccessForm: any;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

export function UserCrud(props: UserCrudProps) {
  return (
    <>
      {console.log(props.men.menfield)}
      {console.log(props.userAccessForm[props.men.menfield])}
      {!props.men.multiple && props.men.mencap ? (
        <div className="ml-[35px] pr-[5px] border-b border-solid border-black">
          {props.men.allowadd ? (
            <Checkbox
              description={props.men.mencap}
              id={props.men.menfield + "_allowadd"}
              name={props.men.menfield + "_allowadd"}
              value={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowadd"
                ]
              }
              checked={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowadd"
                ]
              }
              handleInputChange={props.handleInputChange}
            />
          ) : (
            <></>
          )}

          {props.men.allowedit ? (
            <Checkbox
              description={props.men.mencap}
              id={`${props.men.menfield}_allowedit`}
              name={`${props.men.menfield}_allowedit`}
              value={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowedit"
                ]
              }
              checked={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowedit"
                ]
              }
              handleInputChange={props.handleInputChange}
            />
          ) : (
            <></>
          )}

          {props.men.allowdelete ? (
            <Checkbox
              description={props.men.mencap}
              id={`${props.men.menfield}_allowdelete`}
              name={`${props.men.menfield}_allowdelete`}
              value={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowdelete"
                ]
              }
              checked={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowdelete"
                ]
              }
              handleInputChange={props.handleInputChange}
            />
          ) : (
            <></>
          )}

          {props.men.allowimport ? (
            <Checkbox
              description={props.men.mencap}
              id={`${props.men.menfield}_allowimport`}
              name={`${props.men.menfield}_allowimport`}
              value={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowimport"
                ]
              }
              checked={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowimport"
                ]
              }
              handleInputChange={props.handleInputChange}
            />
          ) : (
            <></>
          )}

          {props.men.allowresend ? (
            <Checkbox
              description={props.men.mencap}
              id={`${props.men.menfield}_allowresend`}
              name={`${props.men.menfield}_allowresend`}
              value={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowresend"
                ]
              }
              checked={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowresend"
                ]
              }
              handleInputChange={props.handleInputChange}
            />
          ) : (
            <></>
          )}

          {props.men.allowvoid ? (
            <Checkbox
              description={props.men.mencap}
              id={`${props.men.menfield}_allowvoid`}
              name={`${props.men.menfield}_allowvoid`}
              value={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowvoid"
                ]
              }
              checked={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowvoid"
                ]
              }
              handleInputChange={props.handleInputChange}
            />
          ) : (
            <></>
          )}

          {props.men.allowprint ? (
            <Checkbox
              description={props.men.mencap}
              id={`${props.men.menfield}_allowprint`}
              name={`${props.men.menfield}_allowprint`}
              value={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowprint"
                ]
              }
              checked={
                props.userAccessForm[props.men.menfield][
                  props.men.menfield + "_allowprint"
                ]
              }
              handleInputChange={props.handleInputChange}
            />
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
