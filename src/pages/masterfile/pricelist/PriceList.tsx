import {useNavigate} from "react-router";
import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {InputText} from "../../../common/form/InputText";
import {Modal} from "../../../common/modal/Modal";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {dateNowFormatted} from "../../../helper/Date";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {PricelistModel} from "../../../models/pricelist";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {DeleteFilled, EditFilled, EyeOutlined, TableOutlined} from "@ant-design/icons";
import {useCallback, useEffect, useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {useCentral} from "../../../hooks/centralHooks";
import {CentralNote} from "../../../common/centralnote/CentralNote";
import {Selection} from "../../../common/form/Selection";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { Box, IconButton } from "@mui/material";
import { UserAccessActions, useUserAccessHook } from "../../../hooks/userAccessHook";
import { toast } from "react-toastify";
import { deletePriceList } from "../../../store/actions/pricelist.action";
import { useTheme } from "../../../hooks/theme";
import { InfoCard } from "../InfoCard";

interface DineTypeFormRequiredValues {
  "Price List *": string;
  "Order Type *": string;
  "Order Description *": string;
}

enum DineTypeFormRequiredFields {
  prcdsc = "prcdsc",
  postypcde = "postypcde",
}

export function PriceList() {
  const {
    onSubmit,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<PricelistModel>("pricelist");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    validateInputCharacters,
    errors,
  } = useFormInputValidation<DineTypeFormRequiredValues>();

  const { 
    pagination,
    columnFilters,
    sorting, 
    setPagination, 
    setSearch,
    setColumnFilters,
    setSorting,
    isFetching,
    rows,
    pageCount
  } = useTablePagination<PricelistModel>(setAllLoadedData, "pricelist");

  const { EyeOutlineStyled, theme } = useTheme();

  const appDispatch = useAppDispatch();

  const { validateOnDelete } = useMasterfileDeletionValidation("pricelist");

  const {hasActionAccess} = useUserAccessHook();
  const {isCentralConnected, checkLinkInputsCentral} = useCentral();

  const navigate = useNavigate();

  const company = useAppSelector((state) => state.masterfile.company);
  // const { transaction } = useAppSelector((state) => state.order)
  const {createAction, updateAction, printAction} =
    useUserActivityLog();

  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);
  const [openInfoCard, setOpenInfoCard] = useState<boolean>(false);

  const {dispatch, modal} = useModal();
  const modalName = useAppSelector((state) => state.modal.modalName);
  const {dineType} = useAppSelector((state) => state.masterfile);

  useEffect(() => {
    if (modal) {
      checkLinkInputsCentral();
    }

    registerInputs({
      inputs: [
        {
          path: "Price List *",
          name: "prcdsc",
          value: singleData?.prcdsc || "",
        },
        {
          path: "Order Type *",
          name: "postypcde",
          value: singleData?.postypcde || "",
        },
      ],
    });

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  useEffect(() => {
    if (editCopy === undefined) {
      setEditCopy(singleData);
    }
  }, [singleData]);

  // useEffect(() => {
  //   appDispatch(getPriceList());
  // }, [apiData])

  const onDeleteConfirm = (row: any) => {
    console.log("row", row.original);

    // if (transaction.data && transaction.data.warcde === row.original.prccde) {
    //   return toast.error(`${row.original.prcdsc} is in use. Unable to delete.`, {
    //     hideProgressBar: true,
    //     position: 'top-center',
    //     autoClose: 5000,
    //   })
    // }

    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  const onEdit = (row: any) => {
    onOpenModal("Edit Price List");
          
    const findCorrectData = dineType.data.find(
      (dineItem) => dineItem.postypdsc === row.original.postypcde
    );

    const updatedRow = {
      ...row.original,
      postypcde: findCorrectData?.postypcde,
    };

    setSingleData(updatedRow);
    // setSingleData(row.original);
    setStatus("UPDATE");
    setEditCopy(singleData);
  }

  const handleInputChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const handleSelectChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const onShowPrices = (row: any) =>
    navigate(`/pages/priceDetail/${row.original.prccde}`);

  const onSubmitForm = () => {
    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nPRICELIST NAME: ${singleData?.prcdsc}`;
        createAction({module: MODULES.PRICELIST, remarks: createRemarks});
        break;
      case "UPDATE":
        console.log("RUNNING UPDATE");

        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.PRICELIST,
          },
          {
            itemName: singleData?.prcdsc,
            itemCode: singleData?.prccde,
          }
        );
        break;
      // print in print button
      // delete in delete button

      default:
        console.log("default");
        break;
    }
    onSubmit(undefined, status, () => {
      if (status === "CREATE") {
        setSingleData(undefined);
        setOpenInfoCard(true);
        changeRequiredValue(DineTypeFormRequiredFields.prcdsc, "");
        changeRequiredValue(DineTypeFormRequiredFields.postypcde, "");
      }
    });
  };

  const fixallLoadedData = useCallback(() => {
    const restructuredallLoadedData = allLoadedData.map((item: PricelistModel) => {
      const matchingItem = dineType.data.find(
        (dineItem) => dineItem.postypcde === item.postypcde
      );
      return {
        ...item, 
        postypdsc: matchingItem?.postypdsc, 
        postypcde: matchingItem?.postypdsc
      };
    });

    return restructuredallLoadedData;
  }, [allLoadedData]);

  return (
    <>
      {modalName === "Delete Confirmation" ? (
        <Modal title={"Delete Confirmation"}>
          <h1>
            Do you want to delete:{" "}
            <span className="font-bold">{deleteData?.original?.prcdsc} ?</span>
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
                prccde: deleteData.original.prccde
              })) {
                return toast.info(`"${deleteData.original.prcdsc}" is already in use. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }

              const result = await appDispatch(deletePriceList(deleteData.original.recid));
              if (result) {
                toast.success(`Successfully deleted.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });

                // update the lazy loaded data
                setAllLoadedData((prev) => {
                  return prev.filter(
                    (item: PricelistModel) =>
                      item.prccde !== deleteData.original.prccde
                  );
                });
              } else {
                toast.error(`Failed to delete "${deleteData.original.prcdsc}".`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }
              
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Price List"} 
          onClose={() => {
            clearErrors();
            setOpenInfoCard(false);
          }}
        >
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}
          <form id="pl-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"prcdsc"}
              value={singleData?.prcdsc}
              id={"prcdsc"}
              description={"Price List *"}
              error={errors}
              linkCentral={true}
              required
            />

            <Selection
              handleSelectChange={handleSelectChange}
              description={"Order Type *"}
              value={singleData?.postypcde}
              id={"postypcde"}
              name={"postypcde"}
              keyValuePair={dineType.data.map((item) => {
                return {key: item.postypdsc, value: item.postypcde};
              })}
              error={errors}
              linkCentral={true}
              required
            />
          </form>

          <ButtonForm<PricelistModel>
            isShowWarningCancel
            data={singleData}
            formName={"pl-form"}
            okBtnTxt={"Save"}
            isCentralConnected={isCentralConnected.current}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        {!isCentralConnected.current ? (
          <AddButton
            onClick={() => {
              onOpenModal("Add Price List");
              setStatus("CREATE");
            }}
          />
        ) : (
          <CentralNote description={"Price List"} />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Price List"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.PRICELIST);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Price List Masterfile",
                date: dateNowFormatted(),
                headers: {
                  prcdsc: {
                    header: "Price List Description",
                    id: "prcdsc",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<PricelistModel>
          columns={[
            {
              accessorKey: "prcdsc",
              id: "prcdsc", // Make sure to include the 'id' property
              header: "Price List",
            },
            {
              accessorKey: "postypdsc",
              id: "postypdsc", // Make sure to include the 'id' property
              header: "Order Type",
            },
          ]}
          renderRowActions={({row}) => (
            <Box>
              {isCentralConnected.current ? (
                <>
                  <IconButton
                    onClick={() => onEdit(row)}
                    color="secondary"
                  >
                    <EyeOutlineStyled $color={theme.primarycolor} className="flex">
                      <EyeOutlined />
                    </EyeOutlineStyled>
                  </IconButton>
                  <IconButton
                    onClick={() => onShowPrices(row)}
                    color="primary"
                  >
                    <TableOutlined className=" text-blue-300" />
                  </IconButton>
                </>
              ) : (
                <>
                  {hasActionAccess(UserAccessActions.EDIT) && (
                    <IconButton
                      onClick={() => onEdit(row)}
                      color="secondary"
                    >
                      <EditFilled className=" text-green-300" />
                    </IconButton>
                  )}
                  {hasActionAccess(UserAccessActions.DELETE) && (
                    <IconButton
                      onClick={() => onDeleteConfirm(row)}
                      color="error"
                    >
                      <DeleteFilled className=" text-red-300" />
                    </IconButton>
                    )}
                  <IconButton
                    onClick={() => onShowPrices(row)}
                    color="primary"
                  >
                    <TableOutlined className=" text-blue-300" />
                  </IconButton>
                </>
              )}
            </Box>
          )}
          tableSearchPlaceholder="Search Pricelist"
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={fixallLoadedData() as any}
          onDeleteConfirm={onDeleteConfirm}
          isFetching={isFetching}
          setSearch={setSearch} 
          setPagination={setPagination} 
          pagination={pagination}
          row={rows}
          pageCount={pageCount}
        />
      </section>
    </>
  );
}
