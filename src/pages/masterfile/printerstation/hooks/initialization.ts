import { useEffect } from "react";
import { ipRegex } from "../../../../data/regex";
import { PrinterStationModel } from "../../../../models/printerstation";
import { useModal } from "../../../../hooks/modalHooks";

export function usePrinterStationInitialization(
  editCopy: any,
  printerStationModalData: PrinterStationModel | undefined,
  setPrinterStationModalData: React.Dispatch<React.SetStateAction<PrinterStationModel | undefined>>,
  setEditCopy: React.Dispatch<any>,
  registerInputs: ({
    inputs,
  }: {
    inputs: {
      path:
        | "Station Name *"
        | "Terminal IP *"
        | "Printer Name *"
        | "Printer Size *";
      name: string;
      value: string;
      validate?: ((value: string) => string | boolean) | undefined;
    }[];
  }) => void,
  unregisterInputs: () => void
) {
  const { modal } = useModal();

  useEffect(() => {
    if (modal) {
      registerInputs({
        inputs: [
          {
            path: "Station Name *",
            name: "locationdsc",
            value: printerStationModalData?.locationdsc || "",
          },
          {
            path: "Terminal IP *",
            name: "terminalip",
            value: printerStationModalData?.terminalip || "",
            validate: (value) =>
              ipRegex.test(value) || "Please enter a valid IP address.",
          },
          {
            path: "Printer Name *",
            name: "printername",
            value: printerStationModalData?.printername || "",
          },
          {
            path: "Printer Size *",
            name: "printersize",
            value: printerStationModalData?.printersize ? printerStationModalData?.printersize.toString() : "",
          },
        ],
      });
    } else {
      setPrinterStationModalData(undefined);
    }

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  useEffect(() => {
    if (editCopy === undefined) {
      console.log("DUPLICATING");
      setEditCopy(printerStationModalData);
    }
  }, [printerStationModalData]);
}
