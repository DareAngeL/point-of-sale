import { Loading3QuartersOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export function PosfileValidationFragment() {
    return (
        <div className="flex justify-center items-center">
            <Spin className="mx-2" indicator={<Loading3QuartersOutlined spin />} size="large"/>
            <p>Validating sales data... Please wait...</p>
        </div>
    )
}