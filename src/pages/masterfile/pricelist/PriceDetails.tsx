import {useParams} from "react-router";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import {useEffect} from "react";
import {PriceDetailModel} from "../../../models/pricedetail";
import {BackButton} from "../../../common/backbutton/BackButton";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {ApiService} from "../../../services";
import {Modal} from "../../../common/modal/Modal";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {InputText} from "../../../common/form/InputText";
import {useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {Checkbox} from "../../../common/form/Checkbox";
import {useCentral} from "../../../hooks/centralHooks";
import {CentralNote} from "../../../common/centralnote/CentralNote";
import { UserAccessActions, useUserAccessHook } from "../../../hooks/userAccessHook";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { ArrowLeftOutlined, ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { CustomModal } from "../../../common/modal/CustomModal";
import { Spin } from "antd";
import { Loading } from "../../../common/modal/Loading";
import { Box, LinearProgress } from "@mui/material";
import { getItems } from "../../../store/actions/items.action";
import { ExportImportPricelist } from "./ExportImportPricelist";
import { getSinglePriceListByPriceCode, setLoadItems } from "../../../store/actions/pricelist.action";
import { PricelistModel } from "../../../models/pricelist";
import { useTheme } from "../../../hooks/theme";
interface PriceDetailFormRequiredValues {
  "Item Description *": string;
  "Unit of Measure *": string;
  "Selling Price *": string;
}

export function PriceDetails() {
  const params = useParams();

  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setSingleData,
    setAllLoadedData,
    onSubmitBulk,
  } = useServiceMasterfile<PriceDetailModel>("pricedetail");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    errors,
  } = useFormInputValidation<PriceDetailFormRequiredValues>();

  const { 
    pagination,
    columnFilters,
    sorting, 
    setPagination, 
    setSearch,
    setColumnFilters,
    setSorting,
    initRows,
    isFetching,
    rows,
    pageCount
  } = useTablePagination<PriceDetailModel>(setAllLoadedData, "pricedetail", {prccde: params.prccde});

  const { ButtonStyled, theme } = useTheme();

  const { validateOnDelete } = useMasterfileDeletionValidation("");

  const {checkLinkInputsCentral, isCentralConnected} = useCentral();

  const { hasActionAccess } = useUserAccessHook();

  const [itemsCount, setItemsCount] = useState(0);
  const [loadedItems, setLoadedItems] = useState<any[]>([]);
  const [loadedItemPage, setLoadedItemPage] = useState<number>(0);
  const [loadedItemSelectAll, setLoadedItemSelectAll] = useState<boolean>(false);
  const [uncheckedItems, setUncheckedItems] = useState<any[]|undefined>([]);
  const [loading, setLoading] = useState<{
    isLoadingData:boolean,
    isLoadNextData:boolean,
    isFetching:boolean
  }>({
    isLoadingData: false,
    isLoadNextData: false,
    isFetching: false
  });

  // const {priceList:priceListSelector, /*item*/} = useAppSelector((state) => state.masterfile);
  
  // const priceListTitleFinder = priceListSelector.data.find(
  //   (pl: any) => pl.prccde == params.prccde
  // );
  const [priceList, setPriceList] = useState<PricelistModel>();
  const {createAction, updateAction, deleteAction} =
    useUserActivityLog();

  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);
  const [isModalLoad, setModalLoad] = useState(false);
  const [itemPrice, setItemPrice] = useState<PriceDetailModel[]>([]);
  const [openImportModal, setOpenImportModal] = useState(false);

  const {dispatch, modal} = useModal();
  const appDispatch = useAppDispatch();
  const modalName = useAppSelector((state) => state.modal.modalName);

  const onDeleteConfirm = (row: any) => {
    console.log(row);
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  useEffect(() => {

    if (modal) {
      appDispatch(getItems({}));
      checkLinkInputsCentral();
    } else {
      setLoadedItemPage(0);
      setLoadedItemSelectAll(false);
      setUncheckedItems([]);
      setItemPrice([]);
    }

    registerInputs({
      inputs: [
        {
          path: "Item Description *",
          name: "itmdsc",
          value: singleData?.itmdsc || "",
        },
        {
          path: "Unit of Measure *",
          name: "untmea",
          value: singleData?.untmea || "",
        },
        {
          path: "Selling Price *",
          name: "untprc",
          value: (singleData?.untprc && singleData?.untprc.toString()) || "",
        },
      ],
    });

    return () => {
      unregisterInputs();
    };


  }, [modal]);

  useEffect(() => {
    if (loadedItemSelectAll) {
      checkAllItems();
    }
  }, [loadedItems])

  useEffect(() => {
    if (editCopy === undefined) {
      console.log("DUPLICATING");
      setEditCopy(singleData);
    }
  }, [singleData]);

  useEffect(() => {
    checkLinkInputsCentral();
    // const find = pricelist.data.find(pl => pl.prccde == params.prccde)
    const find = async () => {
      const pricelist = await appDispatch(getSinglePriceListByPriceCode(params.prccde || ''));
      setPriceList(pricelist.payload);
    };

    find();
  }, []);

  const checkAllItems = () => {
    loadedItems.forEach((i) => {
      if (
        !itemPrice.find((data) => data.itmcde == i.itmcde) &&
        uncheckedItems?.find((data) => data == i.itmcde) == undefined
      ) {
        setItemPrice(
          (prev) =>
            [
              ...prev,
              {
                untprc: i.untprc,
                untmea: "PCS",
                itmcde: i.itmcde,
                itmdsc: i.itmdsc,
                prccde: params.prccde,
              },
            ] as PriceDetailModel[]
        );
      }
    });
  }

  const handleInputChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
    console.log(singleData);
  };

  const handleCheckboxChange = async ({
    target: {name, value, checked},
  }: React.ChangeEvent<HTMLInputElement>) => {
    console.log("value", value);
    console.log("name", name);
    console.log("checked", checked);
    console.log(itemPrice);

    if (name === "selectAll") {
      if (checked) {
        setLoadedItemSelectAll(true);
        checkAllItems();
        // item.data.forEach((i) => {
        //   if (!allLoadedData.find((data) => data.itmcde == i.itmcde)) {
        //     setItemPrice(
        //       (prev) =>
        //         [
        //           ...prev,
        //           {
        //             untprc: i.untprc,
        //             untmea: "PCS",
        //             itmcde: i.itmcde,
        //             itmdsc: i.itmdsc,
        //             prccde: params.prccde,
        //           },
        //         ] as PriceDetailModel[]
        //     );
        //   }
        // });
      } else {
        setLoadedItemSelectAll(false);
        setUncheckedItems([]);
        setItemPrice([]);
      }
    } else {

      // const findItem = item.data.find(d => d.itmcde == name);
      const findItem = (await ApiService.get(`item/filter/?itmcde=${name}`)).data[0];

      if (checked) {
        setUncheckedItems((prev: any) => {
          if (prev.includes(name)) {
            const data = prev.filter((d: any) => d !== name);
            return data;
          }

          return prev;
        });
        setItemPrice(
          (prev) =>
            [
              ...prev,
              {
                untprc: findItem?.untprc,
                untmea: "PCS",
                itmcde: name,
                itmdsc: value,
                prccde: params.prccde,
              },
            ] as PriceDetailModel[]
        );
      } else {
        if (loadedItemSelectAll) {
          setUncheckedItems((prev: any) => {
            if (prev.includes(name)) return;
  
            return [...prev, name];
          });
        }
        const data = itemPrice.filter((d) => d.itmcde != name);

        setItemPrice(data);
      }
    }
  };

  const onLoadDataSubmit = async () => {
    // dispatch();
    setLoading((prev) => ({...prev, isLoadingData:true}));
    if (loadedItemSelectAll) {
      const res = await ApiService.put(`pricedetail/all/${params.prccde}`, {uncheckedItems});
      await initRows(); // initialize table rows
      setAllLoadedData(res.data.items);
      setLoading((prev) => ({...prev, isLoadingData:false}));
      toast.success("Successfully loaded items.", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000
      });
      dispatch();
      return;
    }

    onSubmitBulk(
      itemPrice,
      (data) => {
        setAllLoadedData(data);
        setLoading((prev) => ({...prev, isLoadingData:false}));
      },
      params.prccde,
      {
        page: 0,
        pageSize: 10
      }
    );

    if (status === "CREATE") {
      console.log("CREATE");
      let createRemarks = "ADDED: \n";

      itemPrice.forEach((item) => {
        createRemarks += `ITEM DESCRIPTION: ${
          item?.itmdsc
        }\nCOST: ${item?.untprc.toFixed(2)}\nMEASURE: ${item?.untmea},\n`;
      });
      createRemarks = createRemarks.slice(0, -2);
      createAction({module: MODULES.PRICEDETAILS, remarks: createRemarks});
    }
  };

  const onSubmitForm = () => {
    switch (status) {
      case "UPDATE":
        console.log("RUNNING UPDATE");
        console.log(itemPrice);
        console.log(singleData);

        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.PRICEDETAILS,
          },
          {itemName: singleData?.itmdsc, itemCode: singleData?.itmcde}
        );
        break;
      // print in print button
      // delete in delete button

      default:
        console.log("default");
        break;
    }
    onSubmit(undefined, status);
  };

  const onLoadData = async () => {
    if (isCentralConnected.current) return;
    setLoading((prev) => ({...prev, isFetching:true}));
    await loadItems(0, 10);
    setLoading((prev) => ({...prev, isFetching:false}));

    setModalLoad(true);
    onOpenModal("Load data");
    setStatus("CREATE");
  };

  const loadItems = async (page: number, pageSize: number) => {
    // get items count
    const loadedItems = await appDispatch(setLoadItems({
      prccde: params.prccde || '',
      page: page,
      pageSize: pageSize
    }))

    setItemsCount(loadedItems.payload.rows);
    setLoadedItems(loadedItems.payload.items);
  }

  const onCloseLoadData = () => {
    setModalLoad(false);
  };

  return (
    <>
      <ExportImportPricelist
        name={priceList?.prcdsc || ''}
        prccde={priceList?.prccde || ''}
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        setAllLoadedData={setAllLoadedData}
        initRows={initRows}
      />

      {modalName === "Delete Confirmation" ? (
        <Modal title={"Delete Confirmation"}>
          <h1>
            Do you want to delete:{" "}
            <span className="font-bold">{deleteData?.original?.itmdsc} ?</span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            isColorSwitched={true}
            onOkBtnClick={async () => {
              dispatch();

              if (!await validateOnDelete({
                itmcde: deleteData.original.itmcde
              })) {
                return toast.info(`"${deleteData.original.itmdsc}" is already in use. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }
              
              onDelete(deleteData);
              let data = {
                module: MODULES.PRICEDETAILS,
                remarks: "",
              };
              data.remarks = `DELETED: \nITEM DESCRIPTION: ${deleteData?.original.itmdsc}\nFROM PRICELIST: ${priceList?.prcdsc}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : isModalLoad ? (
        <Modal title={"Load Data"} onClose={() => onCloseLoadData()}>
          <span className="text-[10px] text-gray-500">
            Fields with (*) asterisk are required
          </span>
          <form id="pd-form" onSubmit={handleSubmit(onSubmitForm)}>
            
            {loadedItems.length >= 0 &&(
              
              <Checkbox
                checked={undefined}
                id={"selectAll"}
                name={"selectAll"}
                description={"Check All "}
                alignment="flex-row justify-between font-black"             
                handleInputChange={handleCheckboxChange}
              />

            )}

            {loadedItems.length === 0 && (
              <p className="text-center mb-5 text-gray-400">All items already added.</p>
            )}

            {loadedItems.map((itm, index) => (
              <>
                <Checkbox
                  key={index}
                  checked={
                    itemPrice.find((d) => d.itmcde == itm.itmcde) != undefined
                  }
                  id={itm.itmcde}
                  handleInputChange={handleCheckboxChange}
                  name={itm.itmcde}
                  value={itm.itmdsc}
                  description={itm.itmdsc}
                  alignment="flex-row justify-between"
                />
              </>
            ))}
          </form>
          <ButtonForm
            isShowWarningCancel
            data={itemPrice}
            formName={"pd-form"}
            okBtnTxt={"Load"}
            onOkBtnClick={() => {
              onLoadDataSubmit();
            }}
          >
            {loading.isLoadNextData && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress />
              </Box>
            )}
            <div className="flex text-[13px] mt-">
              <div className="flex items-center hover:cursor-pointer" onClick={() => {
                setLoadedItemPage((prev) => { 
                  if (prev === 0) return prev;
                  const page = --prev;

                  const load = async () => {
                    setLoading((prev) => ({...prev, isLoadNextData:true}));
                    await loadItems(page, 10);
                    setLoading((prev) => ({...prev, isLoadNextData:false}));
                  }

                  load();
                  return page;
                });
              }}>
                <ArrowLeftOutlined />
                <span className="mx-1">Previous</span>
              </div>
              |
              <div className="flex items-center hover:cursor-pointer" onClick={() => {
                setLoadedItemPage((prev) => { 
                  if (prev+1 >= itemsCount) return prev;
                  const page = ++prev;

                  const load = async () => {
                    setLoading((prev) => ({...prev, isLoadNextData:true}));
                    await loadItems(page, 10);
                    setLoading((prev) => ({...prev, isLoadNextData:false}));
                  }

                  load();
                  return page;
                });
              }}>
                <span className="ms-2 me-1">Next</span>
                <ArrowRightOutlined />
              </div>
            </div>
            <span className="text-[13px]">Page {loadedItemPage+1} of {itemsCount===0?itemsCount+1:itemsCount}</span>
          </ButtonForm>
        </Modal>
      ) : (
        <Modal title={"Price List"} onClose={() => clearErrors()}>
          <span className="text-[10px] text-gray-500">
            Fields with (*) asterisk are required
          </span>
          <form id="pd-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={handleInputChange}
              name={"untmea"}
              value={singleData?.untmea}
              id={"untmea"}
              description={"Unit of Measure *"}
              linkCentral
              error={errors}
            />

            <InputText
              handleInputChange={handleInputChange}
              name={"untprc"}
              value={singleData?.untprc}
              id={"untprc"}
              description={"Selling Price *"}
              linkCentral
              error={errors}
            />
          </form>

          <ButtonForm<PriceDetailModel>
            isShowWarningCancel
            data={singleData}
            formName="pd-form"
            okBtnTxt="Save"
            isCentralConnected={isCentralConnected.current}
          />
        </Modal>
      )}

      {loading.isLoadingData && (
        <CustomModal 
          modalName={"Loading"} 
          maxHeight={""}
          height={50}
        >
          <div className="flex">
            <Spin />
            <span className="ms-3">Loading selected items. Please wait...</span>
          </div>
        </CustomModal>
      )}

      {loading.isFetching && (
        <Loading />
      )}

      <section className="h-screen w-full relative">
        <div className="flex items-center pl-10">
          <BackButton />
          <div className="p-10 font-montserrat">
            <div className="font-montserrat text-[2rem] my-auto w-[100%]">
              {priceList?.prcdsc}
            </div>
          </div>
        </div>

        <div className="flex items-center w-[90%] mx-auto">
          {(hasActionAccess(UserAccessActions.ADD) && !isCentralConnected.current) && (
            <div
              className="link-central group border border-green-700 rounded-lg h-[40px] flex justify-center items-center cursor-pointer hover:bg-green-700 hover:text-white select-none"
              onClick={onLoadData}
            >
              <p className="text-green-700 font-montserrat font-extrabold text-center m-3 group-hover:text-white text-[0.8rem]">
                Load data from items
              </p>
            </div>
          )}

          {!isCentralConnected.current && (
            <div className="ms-auto">
              <ButtonStyled $color={theme.primarycolor}
                className="font-montserrat text-[2rem] bg-slate-600 w-[50px] h-[50px] text-center text-white rounded flex justify-center items-center cursor-pointer"
                onClick={() => setOpenImportModal(true)}
              >
                <DownloadOutlined className="text-center" />
              </ButtonStyled>
            </div>
          )}
        </div>

        {isCentralConnected.current && (
          <CentralNote description={"Price List"} />
        )}

        <POSTable<PriceDetailModel>
          onClick={async (row) => {
            onOpenModal(row.original.itmdsc);
            setSingleData(row.original);
            setStatus("UPDATE");
            setEditCopy(singleData);
          } }
          columns={[
            {
              accessorKey: "recid",
              header: "ID",
            },
            {
              accessorKey: "itmdsc",
              id: "itmdsc", // Make sure to include the 'id' property
              header: "Item Description",
            },
            {
              accessorKey: "untmea",
              id: "untmea", // Make sure to include the 'id' property
              header: "Unit of Measure",
            },
            {
              accessorKey: "untprc",
              id: "untprc", // Make sure to include the 'id' property
              header: "Selling Price",
              Cell: ({row}) => {
                const {
                  original: {untprc},
                } = row;
                return <span>{parseFloat(untprc as any).toFixed(2)}</span>;
              },
            },
          ]}
          tableSearchPlaceholder="Search Items"
          topAdjust="1rem"
          isCentralConnected={isCentralConnected.current}
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={allLoadedData}
          onDeleteConfirm={onDeleteConfirm}
          isFetching={isFetching}
          setSearch={setSearch}
          setPagination={setPagination}
          pagination={pagination}
          row={rows}
          pageCount={pageCount} 
        />
        {/* <PriceDetailTable
          onClick={(row) => {
            onOpenModal(row.original.itmdsc);
            setSingleData(row.original);
            setStatus("UPDATE");
            console.log(singleData, "SET UPDATE");
            setEditCopy(singleData);
          }}
          onDeleteConfirm={onDeleteConfirm}
          tableData={allLoadedData}
          isCentralConnected={isCentralConnected.current}
        /> */}
      </section>
    </>
  );
}
