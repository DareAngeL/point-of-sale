import {InputText} from "../../common/form/InputText";
import {Selection} from "../../common/form/Selection";
import {SystemParametersModel} from "../../models/systemparameters";

interface SystemSettingsProps {
  data: SystemParametersModel;
  setData: (prev: any) => void;
  handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> | undefined;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
}

export function Others(props: SystemSettingsProps) {
  return (
    <>
      <div className="shadow-xl w-[95%] m-auto mb-[1.3rem]">
        <label className="block mb-2 text-black text-[1.2rem] font-montserrat font-extrabold">
          Others
        </label>

        <div className="">
          <div className="shadow flex flex-col items-start w-[30%]">
            {props.data.mitsukoshi ? (
              <>
                <Selection
                  description={"Mitsukoshi Setup Type"}
                  name={"mitsukoshi_setup_type"}
                  id={"mitsukoshi_setup_type"}
                  value={props.data.mitsukoshi_setup_type}
                  keyValuePair={[
                    {
                      key: "Default",
                      value: "default",
                    },
                    {
                      key: "Consolidator",
                      value: "consolidator",
                    },
                    {
                      key: "Consolidator Client",
                      value: "client",
                    },
                  ]}
                  handleSelectChange={props.handleSelectChange}
                />
              </>
            ) : (
              <></>
            )}

            {/* <Checkbox
              description={"ACCPAC"}
              name={"accpac"}
              id={"accpac"}
              value={props.data.accpac?.toString()}
              checked={props.data.accpac ? true : false}
              handleInputChange={props.handleInputChange}
            /> */}
          </div>

          <div className="flex flex-col items-start m-[20px]">
            <InputText
              description="EJ Pathfile"
              name="ej_pathfile"
              id="ej_pathfile"
              value={props.data.ej_pathfile}
              handleInputChange={props.handleInputChange}
            />

            <InputText
              description="Backup Pathfile"
              name="dbbackup_pathfile"
              id="dbbackup_pathfile"
              value={props.data.dbbackup_pathfile}
              handleInputChange={props.handleInputChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
