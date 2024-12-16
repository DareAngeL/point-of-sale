import { ChangeEvent, useEffect, useState } from "react";
import { CustomModal } from "../../../common/modal/CustomModal";
import { toast } from "react-toastify";
import { Spin } from "antd";
import { useWebSocket } from "../../../hooks/socketHooks";
import { IMessageEvent } from "websocket";
import { useAppDispatch } from "../../../store/store";
import { getLazyLoadedPriceDetails, importPricelist } from "../../../store/actions/pricelist.action";
import { serverURL } from "../../../services";

interface ImportPricelistProps {
  name: string;
  prccde: string;
  open: boolean;
  onClose: () => void;
  setAllLoadedData: React.Dispatch<React.SetStateAction<any[]>>;
  initRows: () => void;
}

export function ExportImportPricelist(props: ImportPricelistProps) {

  // use useService because redux asyncThunk does not support formData
  const appDispatch = useAppDispatch();
  const { listen } = useWebSocket();

  const [exportImport, setExportImport] = useState({
    isExporting: false,
    isImporting: false
  });
  const [progressTxt, setProgressTxt] = useState("Please wait...");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProblems, setImportProblems] = useState<string>("");
  const [showImportProblems, setShowImportProblems] = useState(false);

  // we will use useEffect() for the socket to work properly
  useEffect(() => {
    listen.onmessage((event: IMessageEvent) => {
      const msg = event.data as string;

      if (msg === 'Done') {
        setTimeout(() => {
          setExportImport((prev) => ({...prev, isExporting: false}));
        }, 1000);
        return;
      }
      
      setProgressTxt(event.data as string);
    });
  }, []);

  const onFetchFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      setSelectedFile(files[0]);
    }
  }

  const onImport = async () => {
    if (selectedFile) {
      setExportImport((prev) => ({...prev, isImporting: true}));
      setProgressTxt("Preparing... Please wait...")

      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await appDispatch(importPricelist({
        prccde: props.prccde,
        formData: formData
      }));

      if (!result) return;

      if (!result.payload.isSuccessful) {
        setImportProblems(result.payload.problems);
        setShowImportProblems(true);
      }

      if (result.payload.isSuccessful) {
        toast.success("Imported successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
      // update the pricelist details data
      const newPriceDetails = await appDispatch(getLazyLoadedPriceDetails(props.prccde));
      props.setAllLoadedData(newPriceDetails.payload);
      props.initRows();

      setTimeout(() => {
        setExportImport((prev) => ({...prev, isImporting: false}));
      }, 1000);
      return;
    }

    toast.error("No file selected", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
    });
  }

  if (!props.open) {
    return (<></>)
  }

  return (
    <>
      {(exportImport.isExporting || exportImport.isImporting) && (
        <CustomModal 
          modalName={exportImport.isExporting ? "Exporting" : "Importing"} 
          maxHeight={""} 
          height={50}
        >
          <div className="flex items-center">
            <Spin />
            <span className="ms-5">{progressTxt}</span>
          </div>
        </CustomModal>
      )}

      {showImportProblems && (
        <CustomModal 
          modalName={"Import Failed"} 
          maxHeight={""}
          isShowXBtn
          onExitClick={() => {
            // reset everything when closed
            setImportProblems("");
            setShowImportProblems(false);
            setSelectedFile(null);
            props.onClose();
          }}
        >
          <textarea
            className="resize-none border border-red-400 rounded p-2 w-full h-[440px] focus:outline-none"
            rows={4}
            wrap="none"
            value={importProblems}
            readOnly
          />
        </CustomModal>
      )}

      {(!exportImport.isExporting && !exportImport.isImporting && !showImportProblems) && (
        <CustomModal 
          modalName={"Export/Import Pricelist"} 
          maxHeight={""}
          height={300}
          isShowXBtn
          onExitClick={props.onClose}
        >
          <>
            <div className="flex flex-col border-[1px] p-2">
              <label>Export "{props.name}" Template</label>

              <a
                className="bg-green-600 ms-auto me-auto mt-2 p-2 text-white font-bold"
                onClick={() => setExportImport((prev) => ({...prev, isExporting: true}))}
                href={`${serverURL}pricedetail/export?prccde=${props.prccde}`}
              >
                EXPORT TEMPLATE
              </a>
            </div>

            <div className="flex flex-col border-[1px] p-2 mt-5">
              <label className="mb-2">Import "{props.name}" Pricelist</label>
              <input type="file" accept=".xls" onChange={onFetchFiles} />
              <button
                className="bg-green-600 ms-auto me-auto mt-2 p-2 text-white font-bold"
                onClick={onImport}
              >
                IMPORT PRICELIST
              </button>
            </div>
          </>
        </CustomModal>
      )}
    </>
  )
}