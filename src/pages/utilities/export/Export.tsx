/* eslint-disable @typescript-eslint/no-explicit-any */
import {useMemo, useState} from "react";
import {Selection} from "../../../common/form/Selection";
import {useAllLoadedData, useService} from "../../../hooks/serviceHooks";
import {ExportModel} from "../../../models/export";
import {toast} from "react-toastify";
import {saveAs} from "file-saver";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {METHODS, MODULES} from "../../../enums/activitylogs";
import { useTheme } from "../../../hooks/theme";

export default function Export() {
  const { theme, ButtonStyled, DisabledButtonStyled } = useTheme();

  const [selectedMasterfile, setSelectedMasterfile] = useState("");
  const {allLoadedData} = useAllLoadedData<ExportModel>();
  const {getData} = useService("exportfile");

  const {postActivity} = useUserActivityLog();

  const listOfMasterfiles = useMemo(() => {
    if (allLoadedData) {
      const data = [];

      for (const [key, value] of Object.entries(allLoadedData)) {
        data.push({
          key: value as unknown as string,
          value: key,
        });
      }

      // return data;
      const filteredData = data.filter((item) => item.value !== "warehouse");

      return filteredData;
    }
    return [];
  }, []);

  console.log(allLoadedData);

  const handleSelection = ({
    target: {value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMasterfile(value);
  };

  const handleExportBtnClick = async () => {
    if (!selectedMasterfile) {
      toast.error("Something went wrong! Unable to export", {
        position: "top-center",
        autoClose: 1500,
      });

      return;
    }

    const result = await getData(
      `?selectedImported=${selectedMasterfile}`,
      (_, error) => {
        if (error) {
          toast.error("Something went wrong! Unable to export", {
            position: "top-center",
            hideProgressBar: true,
            autoClose: 1500,
          });

          console.error(error);
        }
      }
    );

    if (result) {
      const blob = new Blob([(result as any).data], {
        type: "text/plain;charset=utf-8",
      });
      const masterfile =
        allLoadedData[selectedMasterfile as unknown as keyof typeof allLoadedData];
      saveAs(blob, `${masterfile}.txt`);
    }

    postActivity({
      method: METHODS.READ,
      module: MODULES.EXPORT,
      remarks: `EXPORT masterfile: ${selectedMasterfile}`,
    });
  };

  return (
    <>
      <div className="border-2">
        <div className="p-2 text-center" style={{backgroundColor: theme.primarycolor}}>
          <span className="text-white">EXPORT INTO FILE (TARGET)</span>
        </div>
        <div className="flex flex-col border-2 m-2 p-2">
          <Selection
            handleSelectChange={handleSelection}
            value={selectedMasterfile}
            description={"Select Master File: "}
            id={"masterfileselection"}
            name={"masterfileselection"}
            keyValuePair={listOfMasterfiles}
          />
          <hr />
          {selectedMasterfile ? (
            <ButtonStyled $color={theme.primarycolor}
              className="ms-auto mt-2 p-2 w-[150px] font-bold rounded-md"
              onClick={handleExportBtnClick}
            >
              EXPORT
            </ButtonStyled>
          ) : (
            <DisabledButtonStyled
              className="ms-auto mt-2 p-2 w-[150px] font-bold cursor-not-allowed rounded-md"
            >
              EXPORT
            </DisabledButtonStyled>
          )}
        </div>
      </div>
    </>
  );
}
