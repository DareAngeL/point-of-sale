import {IconButton, TableCell, TableRow} from "@mui/material";
import {SpecialRequestDetailModel} from "../../../../models/specialrequest";
import {CloseOutlined} from "@ant-design/icons";
import {useAppDispatch, useAppSelector} from "../../../../store/store";
import {PosfileModel} from "../../../../models/posfile";
import {useEffect} from "react";
import {useSpecialRequest} from "../hooks/orderingHooks";
import { setSpecialRequestDetails } from "../../../../reducer/orderingSlice";
import { getSpecialRequestDetails } from "../../../../store/actions/specialRequest.action";
import { filterPosfiles } from "../../../../helper/transaction";

interface SpecialRequestRowProps {
  filteredSpecialRequests: SpecialRequestDetailModel[][];
  index: number;
  setFilteredSpecialRequests: (
    updatedSpecialRequests: SpecialRequestDetailModel[][]
  ) => void;
  removeX?: boolean;
}

export function SpecialRequestRow({
  filteredSpecialRequests,
  index,
  setFilteredSpecialRequests,
  removeX
}: SpecialRequestRowProps) {
  const dispatch = useAppDispatch();
  const {order} = useAppSelector((state) => state);
  const {posfiles, specialRequest} = order;

  const {onDeleteSpecialRequest} = useSpecialRequest();

  const filterSpecialRequest = (row: PosfileModel) => {
    return specialRequest.data.filter((sr) => sr.orderitmid == row.orderitmid);
  };

  useEffect(() => {
    // const filteredRequests = posfiles.data.map((row) => {
    //   return filterSpecialRequest(row);
    // });

    const init = async () => {

      const filteredRequests = (await filterPosfiles(posfiles?.data))
        .map((row) => {
          return filterSpecialRequest(row);
        });
  
      setFilteredSpecialRequests(filteredRequests);
    }

    init();
  }, [specialRequest.data, posfiles.data]);

  const onDeleteClick = (item: any) => {
    onDeleteSpecialRequest(
      item.recid + "",
      () => {
        const filteredSr = specialRequest.data.filter(
          (d) => d.recid != item.recid
        );

        dispatch(setSpecialRequestDetails(filteredSr));
        const updatedSr = filteredSpecialRequests[index].filter(
          (d) => d.recid != item.recid
        );
        const updatedWholeSr = filteredSpecialRequests.map((d, i) => {
          if (i == index) return updatedSr;
          else return d;
        });

        setFilteredSpecialRequests(updatedWholeSr);
        dispatch(getSpecialRequestDetails());
      },
      undefined,
      {
        customError: `Failed to Remove: ${item.modcde}.`,
        customSuccess: `${item.modcde}: Removed Successfully.`,
      }
    );
  };

  return (
    <>
      {filteredSpecialRequests.length != 0 &&
        filteredSpecialRequests[index] &&
        filteredSpecialRequests[index].map((item: any) => (
          <>
            <TableRow>
              <TableCell colSpan={5} padding="checkbox">
                <div className="flex justify-between items-center mx-10">
                  <p className="ml-10">SPECIAL REQUEST : {item.modcde}</p>
                  {!removeX && (
                    <IconButton onClick={() => onDeleteClick(item)}>
                      <CloseOutlined className=" text-[0.7rem]" />
                    </IconButton>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </>
        ))}
    </>
  );
}
