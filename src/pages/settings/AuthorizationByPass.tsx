import { Checkbox } from "../../common/form/Checkbox";
import { SystemParametersModel } from "../../models/systemparameters";

interface SystemSettingsProps {
  data: SystemParametersModel;
  setData: (prev: any) => void;
  handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> | undefined;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
}

export function AuthorizationByPass(props: SystemSettingsProps) {
  return (
    <>
      <div className="shadow-xl w-[95%] m-auto mb-[1.3rem]">
        <label className="block mb-2 text-black text-[1.2rem] font-montserrat font-extrabold">
          Authorization Bypass
        </label>

        <div className="grid grid-cols-2 m-[20px]">
          <div className="grid-cols-1 flex flex-col items-start">
            <Checkbox
              description={"Cancel Transaction"}
              name={"auth_cancel_tran"}
              id={"auth_cancel_tran"}
              value={props.data.auth_cancel_tran?.toString()}
              checked={props.data.auth_cancel_tran ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Void Transaction"}
              name={"auth_void_tran"}
              id={"auth_void_tran"}
              value={props.data.auth_void_tran?.toString()}
              checked={props.data.auth_void_tran ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Reprint Void Transaction"}
              name={"auth_reprintvoid_tran"}
              id={"auth_reprintvoid_tran"}
              value={props.data.auth_reprintvoid_tran?.toString()}
              checked={props.data.auth_reprintvoid_tran ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Free Item"}
              name={"auth_free_itm"}
              id={"auth_free_itm"}
              value={props.data.auth_free_itm?.toString()}
              checked={props.data.auth_free_itm ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Remove Item"}
              name={"auth_itm_remove"}
              id={"auth_itm_remove"}
              value={props.data.auth_itm_remove?.toString()}
              checked={props.data.auth_itm_remove ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Price Override"}
              name={"auth_prc_change"}
              id={"auth_prc_change"}
              value={props.data.auth_prc_change?.toString()}
              checked={props.data.auth_prc_change ? true : false}
              handleInputChange={props.handleInputChange}
            />
          </div>

          <div className="grid-cols-2 flex flex-col items-start">
            <Checkbox
              description={"Free Transaction"}
              name={"auth_free_tran"}
              id={"auth_free_tran"}
              value={props.data.auth_free_tran?.toString()}
              checked={props.data.auth_free_tran ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Reprint Transaction"}
              name={"auth_reprint_tran"}
              id={"auth_reprint_tran"}
              value={props.data.auth_reprint_tran?.toString()}
              checked={props.data.auth_reprint_tran ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Recall Transaction"}
              name={"auth_recall_tran"}
              id={"auth_recall_tran"}
              value={props.data.auth_recall_tran?.toString()}
              checked={props.data.auth_recall_tran ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Discounting"}
              name={"auth_add_disc"}
              id={"auth_add_disc"}
              value={props.data.auth_add_disc?.toString()}
              checked={props.data.auth_add_disc ? true : false}
              handleInputChange={props.handleInputChange}
            />

            <Checkbox
              description={"Z-Reading"}
              name={"auth_report"}
              id={"auth_report"}
              value={props.data.auth_report?.toString()}
              checked={props.data.auth_report ? true : false}
              handleInputChange={props.handleInputChange}
            />

            {props.data.robinson ? (
              <>
                <Checkbox
                  description={"View Sent Files"}
                  name={"viewsentfiles"}
                  id={"viewsentfiles"}
                  value={props.data.viewsentfiles?.toString()}
                  checked={props.data.viewsentfiles ? true : false}
                  handleInputChange={props.handleInputChange}
                />
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
