import { Spin } from "antd";
import { CustomModal } from "../../../../common/modal/CustomModal";

interface TransferringModalProps {
  open: boolean;
  msg: string | undefined;
}

export function TransferringModal(props: TransferringModalProps) {

  if (!props.open) {
    return <></>;
  }

  return (
    <>
      <CustomModal 
        modalName={"Transfer Sales Transactions"}
        maxHeight={""}
        height={50}
      >
        <div className="flex">
          <Spin />
          <span className="ms-5">{props.msg ? props.msg : 'Preparing... please wait...'}</span>
        </div>
      </CustomModal>
    </>
  )
}