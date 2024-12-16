import { Checkbox } from "../../../../common/form/Checkbox";

interface OrderingProps {
  menu: any;
  men: any;
  checkAll: any;
  opened: any;
  ordering: any;
}

export function Ordering(props: OrderingProps) {
  return (
    <>
      {props.men.length > 0 && !props.men.mencap ? (
        <>
          <Checkbox
            description="ORDERING"
            name="ordering"
            id="ordering"
            value={props.ordering}
            checked={props.ordering ? true : false}
            handleInputChange={(e) => props.checkAll(e, props.menu, "ORDERING")}
          />

          {props.men.map((men1: any) => (
            <div
              className={`ml-[60px] panel ${
                props.opened["ORDERING"] ? "active" : ""
              }`}
            >
              <label className="text-[12px]">{men1.mencap}</label>
            </div>
          ))}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
