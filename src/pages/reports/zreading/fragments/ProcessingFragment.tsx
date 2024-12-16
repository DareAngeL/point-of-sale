import { CheckCircleFilled, CloseCircleOutlined, Loading3QuartersOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import moment from "moment";
import { GeneratingType } from "../ZReading";
import { useGenerateMallFiles } from "../../../../hooks/generateMallHookUp";
import { useAppSelector } from "../../../../store/store";

interface ProcessingFragmentProps {
  activeDate: string;
  generating: GeneratingType;
}

export function ProcessingFragment(props: ProcessingFragmentProps) {

  const { getHookedMall } = useGenerateMallFiles();
  const { syspar } = useAppSelector((state) => state.masterfile);

  return (
    <>
      <div className="flex items-center">
        {props.generating.zreading.isGenerating && <Spin className="mx-5" indicator={<Loading3QuartersOutlined spin />} size="default"/>}
        {props.generating.zreading.isError && (
          <CloseCircleOutlined className="text-red-500 text-2xl ms-4 mr-2" />
        )}
        {!props.generating.zreading.isError &&
          !props.generating.zreading.isGenerating && (
            <CheckCircleFilled className="text-green-500 text-2xl ms-4 mr-2" />
          )}
        <span>Generating Z-Read for {moment(props.activeDate).format('MM-DD-YYYY')}...</span>
      </div>

      {props.generating.backupDB.triggerBackup && (
        <div className="flex items-center mt-3">
          {props.generating.backupDB.isGenerating && <Spin className="mx-5" indicator={<Loading3QuartersOutlined spin />} size="default"/>}
          {props.generating.backupDB.isError && (
            <CloseCircleOutlined className="text-red-500 text-2xl ms-4 mr-2" />
          )}
          {!props.generating.backupDB.isError &&
            !props.generating.backupDB.isGenerating && (
              <CheckCircleFilled className="text-green-500 text-2xl ms-4 mr-2" />
            )}

          <span>Backuping database...</span>
        </div>
      )}

      {getHookedMall() && (
        <div className="flex items-center mt-3">
          {props.generating.mallhookup.isGenerating && <Spin className="mx-5" indicator={<Loading3QuartersOutlined spin />} size="default"/>}
          {props.generating.mallhookup.isError && (
            <CloseCircleOutlined className="text-red-500 text-2xl ms-4 mr-2" />
          )}
          {!props.generating.mallhookup.isError &&
            !props.generating.mallhookup.isGenerating && (
              <CheckCircleFilled className="text-green-500 text-2xl ms-4 mr-2" />
            )}

          <div className="flex flex-col">
            <span>Generating Mall Hookup...</span>
            {props.generating.mallhookup.isGenerating && <span className="text-[12px] text-gray-400">{props.generating.mallhookup.loadingTxt}...</span>}
          </div>
        </div>
      )}

      {(syspar.data[0].activateautotransfer === 1 && syspar.data[0].withtracc === 1 && syspar.data[0].trnsfrmod !== 'TIME') && (
        <div className="flex items-center mt-3">
          {props.generating.transferCentralFile.isGenerating && <Spin className="mx-5" indicator={<Loading3QuartersOutlined spin />} size="default"/>}
          {props.generating.transferCentralFile.isError && (
            <CloseCircleOutlined className="text-red-500 text-2xl ms-4 mr-2" />
          )}
          {!props.generating.transferCentralFile.isError &&
            !props.generating.transferCentralFile.isGenerating && (
              <CheckCircleFilled className="text-green-500 text-2xl ms-4 mr-2" />
            )}

          <span>Transferring remaining transaction(s) to central...</span>
        </div>
      )}

      <div className="flex items-center mt-3">
        {props.generating.receipt.isGenerating && <Spin className="mx-5" indicator={<Loading3QuartersOutlined spin />} size="default"/>}
        {props.generating.receipt.isError && (
          <CloseCircleOutlined className="text-red-500 text-2xl ms-4 mr-2" />
        )}
        {!props.generating.receipt.isError &&
          !props.generating.receipt.isGenerating && (
            <CheckCircleFilled className="text-green-500 text-2xl ms-4 mr-2" />
          )}
        <div className="flex flex-col">
          {props.generating.receipt.isPreparing ? (
            <>
              <span>Preparing, please wait...</span>
              <span className="text-[12px] text-gray-400">Printing Receipt...</span>
            </>
          ) : (
            <span>Printing Receipt...</span>
          )}
        </div>
      </div>
    </>
  )
}