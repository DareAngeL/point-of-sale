import {Link} from "react-router-dom";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import {useAppSelector} from "../../../store/store";
import { toast } from "react-toastify";

interface SelectionCardProps {
  name: string;
  url: string;
  isPage: boolean;
  menfield?: string;
}

export function SelectionCard(props: SelectionCardProps) {
  const {dispatch} = useModal();
  const {modalNameDispatch} = useChangeNameModal();
  const {syspar, header} = useAppSelector((state) => state.masterfile);

  const goto = props.menfield
    ? props.url.trim() + `/?menfield=${props.menfield}`
    : props.url;

  const onclick = () => {
    if ((props.name === "Download and Sync Master File" || props.name === "Automation of Sales Transaction") &&
      (header.data[0].brhcde === "" || header.data[0].brhcde === null)) 
    {
      toast.error("Please set the branch code first", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    modalNameDispatch(props.name);

    if (!props.isPage) {
      dispatch();
    }
  };

  // filter masterfile
  if (
    props.name.toLowerCase() === "printer stations" &&
    syspar.data[0]?.allow_printerstation === 0
  ) {
    return null;
  } else if (props.name === "Warehouse") {
    return null;
  }
  
  if (props.name.trim() === "Re-compute ZReading") {
    return null;
  }
  
  return (
    <>
      <Link tabIndex={-1} to={goto} onClick={onclick}>
        <div className=" font-montserrat border-b-2 text-lg mb-6 cursor-pointer hover:border-blue-200">
          {props.name}
        </div>
      </Link>
    </>
  );
}
