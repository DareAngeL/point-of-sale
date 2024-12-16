import {Spin} from "antd";

interface Props {}
export function ProcessingFragment({}: Props) {
  return (
    <>
      <div className="flex gap-4 items-center">
        <Spin />
        <div className=" flex justify-center   flex-col">
          <p className="mx-5">{`Backing up Files...`}</p>
          <p className="mx-5">{`Please Wait.`}</p>
        </div>
      </div>
    </>
  );
}
