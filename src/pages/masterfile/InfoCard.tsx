import { CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";

interface InfoCardProps {
  onClose?: () => void;
}

export function InfoCard(props: InfoCardProps) {

  return (
    <>
      <div className="bg-green-200 rounded-md p-1 font-montserrat text-[12px] w-[420px] font-bold flex justify-between items-center">
        <InfoCircleOutlined className="text-gray-600 mx-2" />
        <span>To add another data, fill out the details below then click <span className="text-blue-500 underline">"Save"</span> button. Click <span className="text-red-500 underline">"Cancel"</span> button to cancel adding new data.</span>
        <CloseOutlined className="text-gray-500 float-right ms-1" onClick={props.onClose} />
      </div>
    </>
  )
}