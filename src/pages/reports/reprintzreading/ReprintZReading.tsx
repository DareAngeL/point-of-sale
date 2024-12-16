import {useEffect, useRef, useState} from "react";
import {BackButton} from "../../../common/backbutton/BackButton";
import {ZReadingReprintModel} from "../../../models/zreadingreprint";
import {ReprintZReadingTable} from "./ReprintZReadingTable";
import {Modal} from "../../../common/modal/Modal";
import {
  FileTypeSelection,
  ZReadingFileTypes,
} from "../common/FileTypeSelection";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import {useService} from "../../../hooks/serviceHooks";
// import {useZReadingReport} from "../zreading/zreadingreport/zreadingReport";
import {LoadingFragment} from "../zreading/fragments/LoadingFragment";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {MODULES, METHODS} from "../../../enums/activitylogs";
import { toast } from "react-toastify";
import { useZReadingReport } from "../zreading/zreadingreport/zreadingReport";
import { ZReadingReceipt } from "../zreading/receipt/ZReadingReceipt";
import { Spin } from "antd";
import { CustomModal } from "../../../common/modal/CustomModal";
import moment from "moment";
import { useAppDispatch } from "../../../store/store";
import { getReprintZreading } from "../../../store/actions/reprintzreading.action";

export function ReprintZReading() {
  const {dispatch} = useModal();
  const appDispatch = useAppDispatch();
  const {modalNameDispatch} = useChangeNameModal();
  const [allLoadedData, setAllLoadedData] = useState<ZReadingReprintModel[]>([]) // useAllLoadedData<ZReadingReprintModel>();
  const { getData: getGeneratedZRead, query } = useService<any>("xzreading/generate");
  const { getData: getZReadRecord } = useService<any>("posfile/reprint_zreading");
  const { saveReports } = useZReadingReport();

  const {postActivity} = useUserActivityLog();

  const [selectedRow, setSelectedRow] = useState<ZReadingReprintModel | null>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isNoMoreData, setIsNoMoreData] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const origallLoadedData = useRef<ZReadingReprintModel[]>([]); // use to hold the original api data when searching
  const page = useRef(0); // table page
  const searchPage = useRef(0); // table page when searching
  const pageSize = 20; // rows per page

  useEffect(() => {
    const init = async () => {
      document.body.classList.add('cursor-wait');
      const response = await appDispatch(getReprintZreading(pageSize));
      setAllLoadedData(response.payload);
      document.body.classList.remove('cursor-wait');
    }

    init();
  }, []);

  useEffect(() => {
    searchPage.current = 0;
    page.current = 0;

    if (origallLoadedData.current.length === 0) {
      origallLoadedData.current = allLoadedData;
    }

    if (search === "" || !search) {
      setAllLoadedData(origallLoadedData.current);
    }

    handleSearch(searchPage.current);
  }, [search])

  useEffect(() => {
    if (allLoadedData.length === 0 || allLoadedData.length < pageSize) {
      setIsNoMoreData(true);
    } else {
      setIsNoMoreData(false);
    }
  }, [allLoadedData]);

  const handleOnLoadMoreData = async () => {
    page.current++;

    // setTimeout(async () => {

      if (search && search !== "") {
        return await handleSearch(++searchPage.current);
      }

      const data = await getZReadRecord(query({
        page: page.current,
        pageSize: pageSize
      }), (_, err) => {
        if (err) {
          toast.error("Unable to fetch data", {
            autoClose: 2000,
            position: 'top-center',
            hideProgressBar: true
          })
        }
      });
  
      if (data.data.length > 0) {
        setAllLoadedData((prev) => {
  
          return [
            ...prev,
            ...data.data
          ]
        })
      } else {
        setIsNoMoreData(true);
      }
    // }, 1000);
  }

  const handleSearch = async (_page: number) => {
    if (search === "" || !search) return;

    setIsSearching(true);
    const data = await getZReadRecord("search/"+search+"/"+query({
      page: _page,
      pageSize: pageSize,
    }), (_, err) => {
      if (err) {
        toast.error("Unable to fetch data", {
          autoClose: 2000,
          position: 'top-center',
          hideProgressBar: true
        });
      }
    });
    setIsSearching(false);

    if (!data) return;

    setAllLoadedData(data.data);
  }

  /**
   * Handles the onReprint event from the table. Opens the modal to select the file type to be printed.
   * @param row
   */
  const handleOnReprintClick = (row: ZReadingReprintModel) => {
    setSelectedRow(row);
    modalNameDispatch("Select Generated Report Type:");
    dispatch();
  };

  /**
   * Handles the onOkBtnClick event from the FileTypeSelection component.
   * Makes an api call to get all of the transactions data for the selected batchnum
   * @param selectedFileTypes the selected file types to be printed
   */
  const handleOnOkBtnClick = async (selectedFileTypes: ZReadingFileTypes[]) => {
    setIsProcessing(true);

    const batchnum = selectedRow?.batchnum;
    if (batchnum) {
      const data = await getGeneratedZRead(query({
        batchnum,
        range: true,
        datefrom: selectedRow?.fromDateTime.split(" ")[0],
        dateto: selectedRow?.toDateTime.split(" ")[0],
        isReprint: true,
      }), async (_, err) => {
        if (err) {
          toast.error("Something went wrong! Unable to re-print zreading", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
          console.error(err.message);
          setIsProcessing(false);
          
          return;
        }
      });

      if (!data) {
        toast.error("Something went wrong! Unable to re-print zreading", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
        setIsProcessing(false);
        
        return;
      }

      const date = selectedRow?.fromDateTime.split(" ")[0];
      await saveReports(data.data[0], selectedFileTypes, true, moment(date).format("MMM-DD-YYYY"), async (isSuccess) => {
        if (!isSuccess) {
          toast.error("Unable to print receipt!", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
          setIsProcessing(false);
          return;
        }

        toast.success("Successfully re-print zreading!", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });

        dispatch();
        setIsProcessing(false);
      });
    }

    postActivity({
      method: METHODS.PRINT,
      module: MODULES.ZREADING,
      remarks: `REPRINT ZREADING:\nBATCH:${selectedRow?.batchnum}\nSTARTED:${selectedRow?.fromDateTime}\nENDED:${selectedRow?.toDateTime}`,
    });
  };

  return (
    <>
      <div className="absolute top-0 right-0 -z-10 h-full w-[80%] bg-white opacity-[0] ">
        <ZReadingReceipt />
      </div>
      {isSearching && (
        <CustomModal
          modalName="Search Z-Reading" 
          maxHeight={""}
          height={10}
        >
          <div className="pt-1 pb-8 flex">
            <Spin className="me-5"/>
            <span className="font-montserrat text-lg">Searching....</span>
          </div>
        </CustomModal>
      )}
      {isProcessing ? (
        <Modal title={"Processing"}>
          <LoadingFragment title={"Re-printing zreading..."} />
        </Modal>
      ) : (
        <Modal title={"Select Generated Report Type:"}>
          <FileTypeSelection handleOnOkBtnClick={handleOnOkBtnClick} />
        </Modal>
      )}
      <div className="p-5">
        <div className="flex">
          <BackButton />
          <h1 className="text-[2rem] font-montserrat">Re-Print Z-Reading</h1>
        </div>
        <section className="h-screen w-full relative">
          <ReprintZReadingTable
            tableData={allLoadedData}
            setSearch={setSearch}
            noMoreData={isNoMoreData}
            onReprint={handleOnReprintClick}
            onLoadMoreData={handleOnLoadMoreData}
          />
        </section>
      </div>
    </>
  );
}
