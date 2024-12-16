import {Spin} from "antd";

interface Props {
  date: any;
  activeProcessingDate: string;
}
export function ProcessingFragment({date, activeProcessingDate}: Props) {
  return (
    <>
      <div className="flex items-center gap-4 justify-center">
        <Spin />
        <div className=" flex flex-col items-center">
          <p className="mx-5 text-[13px] text-gray-400">Regenerating Mall files</p>
          <p className="mx-5 text-[13px] text-gray-400">{`${date.dateFrom} - ${date.dateTo}`}</p>
          <p className="mx-5">Generating: {activeProcessingDate}</p>
        </div>
      </div>
    </>
  );
}
