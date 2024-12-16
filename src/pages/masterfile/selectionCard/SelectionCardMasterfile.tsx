import {Link} from "react-router-dom";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import {useAppSelector} from "../../../store/store";
import { masterfileList } from "../../../data/masterfiledata";

interface SelectionCardProps {
  name: string;
  url: string;
  isPage: boolean;
  menfield?: string;
}

export function SelectionCardMasterfile(props: SelectionCardProps) {

  const {dispatch} = useModal();
  const {modalNameDispatch} = useChangeNameModal();
  const {syspar} = useAppSelector((state) => state.masterfile);
  const {children} = masterfileList;

  
  const onclick = () => {
    let modalName = props.name;

    if (props.name === "FOOTERFILE") {
      modalName = "Receipt Footer Set Up";
    } else if (props.name === "SYSTEM PARAMETERS") {
      modalName = "System Parameters";
    } else if (props.name === "HEADERFILE") {
      modalName = "Receipt Header Set Up";
    } else if (props.name === "OTHER CHARGES") {
      modalName = "Other Charges";
    }

    modalNameDispatch(modalName);
    if (!findMf?.isPage) {
      dispatch();
    }
  };

  // filter masterfile
  if (
    props.name === "Printer Stations" &&
    !syspar.data[0]?.allow_printerstation
  ) {
    return null;
  } else if (props.name === "Warehouse") {
    return null;
  }
  
  if (props.name.trim() === "Re-compute ZReading") {
    return null;
  }
  
  const findMf = children.find(mf => mf.menfield === props.menfield)

  const goto = props.menfield
  ? findMf?.url.trim() + `/?menfield=${props.menfield}`
  : props.url;
  
  return (
    <>

      {!findMf && (<>

        <Link to={"/pages/maintenance"}>

          <div className=" font-montserrat border-b-2 text-lg mb-6 cursor-pointer hover:border-blue-200">
              {props.name}
          </div>
        
        </Link>
        
      </>)}

      {findMf && !findMf.disabled &&<>

        <Link tabIndex={-1} to={goto} onClick={onclick}>
          <div className=" font-montserrat border-b-2 text-lg mb-6 cursor-pointer hover:border-blue-200">
            {findMf?.name}
          </div>
        </Link>
      
      </>}
    </>
  );
}
