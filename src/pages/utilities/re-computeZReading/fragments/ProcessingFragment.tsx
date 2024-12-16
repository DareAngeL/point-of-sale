import {Spin} from "antd";

interface Props {
  date: any;
}
export function ProcessingFragment({date}: Props) {
  return (
    <>
      <div className="flex gap-4 items-center">
        <Spin />
        <div className="text flex   flex-col">
          <p className="mx-5">{`Recomputing Z-Reading`}</p>
          <p className="mx-5">{`Processing ${date.dateFrom} to ${date.dateTo}`}</p>
        </div>
      </div>
    </>
  );
}
