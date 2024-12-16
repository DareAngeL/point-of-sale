import {DownOutlined, UpOutlined} from "@ant-design/icons";
import {IconButton, TableCell, TableRow} from "@mui/material";
import {useState} from "react";
import {useAppSelector} from "../../../store/store";

interface ExpandingOrderingTableProps {
  children: React.ReactNode;
  expandedComponent: any;
  onClick?: () => void;
  key?: string;
  sx?: {};
  style?: boolean;
  showFlag?: boolean | false;
}

export function ExpandingOrderingTable(props: ExpandingOrderingTableProps) {
  const [isExpanded, setExpanded] = useState(true);
  const {selectedOrder} = useAppSelector((state) => state.order);

  return (
    <>
      <TableRow
        onClick={() => props.onClick && props.onClick()}
        key={props.key}
        sx={props.sx}
        style={{
          backgroundColor:
            props.style && selectedOrder != null ? "#9EDDFF" : "white",
          marginBottom: "0.5rem",
        }}
      >
        {props.showFlag ? (
          <>
            <TableCell padding="checkbox">
              <IconButton
                onClick={() => {
                  console.log(isExpanded);
                  setExpanded(!isExpanded);
                }}
              >
                {isExpanded ? (
                  <DownOutlined className=" text-[1rem]" />
                ) : (
                  <UpOutlined className=" text-[1rem]" />
                )}
              </IconButton>
            </TableCell>
            {props.children}
          </>
        ) : (
          <>
            <TableCell padding="checkbox"></TableCell>
            {props.children}
          </>
        )}
      </TableRow>
      {isExpanded && <>{props.expandedComponent}</>}
    </>
  );
}
