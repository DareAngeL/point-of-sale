import { Button } from "antd"
import React from "react"



interface NormalButton {
    type: 'primary'| 'dashed' | 'text'| 'link';
    onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    name: string;
    icon: React.ReactNode;
    danger?: boolean | true
}


export const NormalButton = (props: NormalButton) => {

    return (<>
        <Button className=" text-2xl" type={props.type} onClick={props.onClick} icon={props.icon} color={'danger'} danger={props.danger}>{props.name}</Button>
    </>)
}