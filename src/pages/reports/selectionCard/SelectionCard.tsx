import {Link} from "react-router-dom";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import { reportsList } from "../../../data/reportsList";

interface SelectionCardProps {
  name: string;
  url: string;
  isPage: boolean;
  menfield?: string;
}

export function SelectionCard(props: SelectionCardProps) {

  const {dispatch} = useModal();
  const {modalNameDispatch} = useChangeNameModal();
  const {children} = reportsList;

  
  const onclick = () => {
    modalNameDispatch(props.name);

    if (!findMf?.isPage) {
      dispatch();
    }
  };
  
  let findMf: SelectionCardProps | undefined; 
  
  if (props.menfield === '') {
    findMf = props;
  } else {
    findMf = children.find(mf => mf.menfield === props.menfield);
  }

  const goto = props.menfield
    ? props?.url.trim() + `/?menfield=${props.menfield}`
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

      {findMf &&<>

        <Link tabIndex={-1} to={goto} onClick={onclick}>
          <div className=" font-montserrat border-b-2 text-lg mb-6 cursor-pointer hover:border-blue-200">
            {findMf?.name}
          </div>
        </Link>
      
      </>}
    </>
  );
}
