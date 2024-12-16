import { Checkbox } from "../../common/form/Checkbox";
import { SystemParametersModel } from "../../models/systemparameters";

interface SystemSettingsProps {
  data: SystemParametersModel;
  setData: (prev: any) => void;
  handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> | undefined;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
}

export function Ordering(props: SystemSettingsProps) {
  return (
    <>
      <div className="shadow-xl w-[95%] m-auto mb-[1.3rem]">
        <label className="block mb-2 text-black text-[1.2rem] font-montserrat font-extrabold">
          Ordering
        </label>

        <div className="grid grid-cols-3 m-[20px]">
          <div className="grid-cols-1 flex flex-col items-start justify-between">
            <div className="flex items-center nowrap">
              <label
                htmlFor={"orderprintcount"}
                className="block m-auto text-xs text-black font-montserrat"
              >
                {"Order Ticket Print Copy"}
              </label>
              <input
                type="number"
                name={"orderprintcount"}
                id={"orderprintcount"}
                className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-[70px] p-2.5"
                onChange={props.handleInputChange}
                value={props.data.orderprintcount}
              />
            </div>

            <Checkbox
              description={"Allow Item No. on Receipt"}
              name={"receipt_itmnum"}
              id={"receipt_itmnum"}
              value={props.data.receipt_itmnum?.toString()}
              checked={props.data.receipt_itmnum ? true : false}
              handleInputChange={props.handleInputChange}
            />
          </div>
          <div className="grid-cols-2 flex flex-col items-start justify-between">
            <Checkbox
              description={"Send to Kitchen"}
              name={"send_to_kitchen"}
              id={"send_to_kitchen"}
              value={props.data.send_to_kitchen?.toString()}
              checked={props.data.send_to_kitchen ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Allow Refund Transaction"}
              name={"enablerefund"}
              id={"enablerefund"}
              value={props.data.enablerefund?.toString()}
              checked={props.data.enablerefund ? true : false}
              handleInputChange={props.handleInputChange}
            />
          </div>
          <div className="grid-cols-3 flex flex-col items-start justify-between">
            <Checkbox
              description={"Disable Dine in/Takeout Ordering"}
              name={"no_dineout"}
              id={"no_dineout"}
              value={props.data.no_dineout?.toString()}
              checked={props.data.no_dineout ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Manual Change of Default Dine Type"}
              name={"manual_dinetype"}
              id={"manual_dinetype"}
              className="group-hover:cursor-not-allowed"
              value={props.data.manual_dinetype?.toString()}
              checked={props.data.manual_dinetype ? true : false}
              handleInputChange={props.handleInputChange}
              disabled
            />
          </div>
          <Checkbox
            description={"Enable Special Request/Remarks On Receipt"}
            name={"enable_spcl_req_receipt"}
            id={"enable_spcl_req_receipt"}
            value={props.data.enable_spcl_req_receipt?.toString()}
            checked={props.data.enable_spcl_req_receipt ? true : false}
            handleInputChange={props.handleInputChange}
          />
        </div>
      </div>
    </>
  );
}
