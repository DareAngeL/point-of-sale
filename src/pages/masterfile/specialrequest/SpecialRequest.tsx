import {BackButton} from "../../../common/backbutton/BackButton";
import {dateNowFormatted} from "../../../helper/Date";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {SpecialRequestModel} from "../../../models/specialrequest";
import {useAppSelector} from "../../../store/store";
import {AddButton} from "../../../common/addbutton/AddButton";
import {Modal} from "../../../common/modal/Modal";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import Select, {ActionMeta, MultiValue} from "react-select";
import {useModal} from "../../../hooks/modalHooks";
import {useCallback, useEffect, useState} from "react";
import {SpecialRequestGroup} from "../../../models/specialrequestgroup";
import {InputText} from "../../../common/form/InputText";
import {useService} from "../../../hooks/serviceHooks";
import {toast} from "react-toastify";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {EmptyInputIndicator} from "../../../common/form/EmptyInputIndicator";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { InfoCard } from "../InfoCard";

interface SpecialRequestFormRequiredValues {
  "Special Request *": string;
  "Item Subclassification *": string;
}

enum SpecialRequestFormRequiredFields {
  modcde = "modcde",
  modgrpcde = "modgrpcde"
}

export function SpecialRequest() {
  const {
    onSubmit,
    onChangeData,
    onDelete,
    onOpenModal,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<SpecialRequestModel>("specialrequest");

  const {
    handleSubmit,
    errors,
    changeRequiredValue,
    registerInputs,
    unregisterInputs,
    validateInputCharacters
  } = useFormInputValidation<SpecialRequestFormRequiredValues>();

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
  } = useTablePagination<SpecialRequestModel>(setAllLoadedData, "specialrequest");

  const { validateOnDelete } = useMasterfileDeletionValidation("specialrequest");

  const {deleteData: deleteSpclReqGrpData} = useService<SpecialRequestGroup>(
    "specialrequestgroup"
  );

  const [selectedItemSub, setSelectedItemSub] = useState<SpecialRequestGroup[]>(
    []
  );

  const {itemSubclassification, company} = useAppSelector(
    (state) => state.masterfile
  );
  const {createAction, updateAction, deleteAction, printAction} =
    useUserActivityLog();
  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);
  const [openInfoCard, setOpenInfoCard] = useState(false);

  const modalName = useAppSelector((state) => state.modal.modalName);
  const {dispatch, modal} = useModal();

  useEffect(() => {
    registerInputs({
      inputs: [
        {
          path: "Special Request *",
          name: "modcde",
          value: singleData?.modcde.toString() || "",
        },
        {
          path: "Item Subclassification *",
          name: "modgrpcde",
          value: selectedItemSub?.map((d) => d.modgrpcde).join(", ") || "",
        },
      ],
    });

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  // init the data to be printed
  const printoutData = allLoadedData.map((item) => {
    return {
      modcde: item.modcde,
      itemsubclass: itemSubclassification.data.find(
        (sr) => sr.itemsubclasscde === item.modgrpcde
      )?.itemsubclassdsc,
    };
  });

  const itemSubclassFinder = (itemsubclasscde: string) =>
    itemSubclassification.data.find((d) => d.itemsubclasscde == itemsubclasscde)
      ?.itemsubclassdsc;

  const fixallLoadedData = useCallback(() => {
    return allLoadedData.map((item: any) => {
      const updatedSubclasscde = itemSubclassFinder(item.modgrpcde);
      return {...item, itemsubclassdsc: updatedSubclasscde};
    });
  }, [allLoadedData]);

  const handleInputChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const handleSelectChange = (
    newValue: MultiValue<{label: string; value: string}>,
    actionMeta: ActionMeta<{label: string; value: string}>
  ) => {
    setSelectedItemSub((prev: any) => {
      if (prev) {
        if (actionMeta.action === "select-option") {
          // get the last item from the newValue
          const newSelected = newValue[newValue.length - 1];

          const slectedItmSub = [
            ...prev,
            {
              modcde: singleData?.modcde,
              modgrpcde: newSelected.value,
            },
          ];

          setSingleData((prev: any) => {
            if (!prev) return {
              modcde: '',
              modgrpcde: '',
              modifiergroupfiles: slectedItmSub
            };

            return {
              ...prev,
              modifiergroupfiles: slectedItmSub,
            };
          });

          changeRequiredValue(
            "modgrpcde",
            slectedItmSub.map((d) => d.modgrpcde).join(", ")
          );
          return slectedItmSub;
        } else if (actionMeta.action === "remove-value") {
          const removedValue = actionMeta.removedValue;

          const slectedItmSub = prev.filter(
            (d: any) => d.modgrpcde !== removedValue.value
          );

          setSingleData((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              modifiergroupfiles: slectedItmSub,
            };
          });

          changeRequiredValue(
            "modgrpcde",
            slectedItmSub.map((d: any) => d.modgrpcde).join(", ") || ""
          );
          return slectedItmSub;
        }
      }

      return prev;
    });
  };

  const onEditClick = (row: any) => {
    const spclRequest = row.original;

    if (!spclRequest.modifiergroupfiles) {
      spclRequest.modifiergroupfiles = [];
      selectedItemSub.map((d) => {
        if (d.modcde === spclRequest.modcde) {
          spclRequest.modifiergroupfiles.push({
            ...d,
            modgrpcde: d.modgrpcde,
            modcdes: d.modcde,
          });
        }

        return d;
      });
    }

    onOpenModal("Edit Special Request");
    setSingleData(spclRequest);
    setSelectedItemSub(spclRequest.modifiergroupfiles);
    setStatus("UPDATE");
    console.log(singleData);
    setEditCopy(singleData);
  };

  const onAddClick = () => {
    setSelectedItemSub([]);
    onOpenModal("Add Special Request");
    setStatus("CREATE");
  };

  const handleModSubClass = useCallback(() => {
    if (selectedItemSub.length === 0) return [];

    const modgrpfiles = [];
    for (const modgrpfile of Object.values(selectedItemSub)) {
      const label = itemSubclassFinder(
        (modgrpfile as unknown as SpecialRequestGroup).modgrpcde || ""
      );
      const value =
        (modgrpfile as unknown as SpecialRequestGroup).modgrpcde || "";

      label && modgrpfiles.push({label, value});
    }

    return modgrpfiles;
  }, [selectedItemSub]);

  const openDeleteConfirmation = async (row: any) => {
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  const onConfirmedDelete = () => {
    deleteSpclReqGrpData(encodeURIComponent(deleteData.original.modcde), async (_, error) => {
      dispatch();
      if (error) {
        toast.error("Something went wrong. Unable to delete.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });

        console.error(error);
        return;
      }

      await onDelete(encodeURIComponent(deleteData.original.modcde), true);
      let data = {
        module: MODULES.SPECIALREQUEST,
        remarks: "",
      };
      data.remarks = `DELETED: \nSPECIAL REQUEST: ${deleteData?.original.modcde}`;
      deleteAction(data);
    });
  };

  const onSubmitForm = async () => {
    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nSPECIAL REQUEST:${singleData?.modcde}`;
        createAction({module: MODULES.SPECIALREQUEST, remarks: createRemarks});
        break;
      case "UPDATE":
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.SPECIALREQUEST,
          },
          {
            itemName: singleData?.modcde,
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
        setSelectedItemSub([]);
        changeRequiredValue(SpecialRequestFormRequiredFields.modcde, "");
        changeRequiredValue(SpecialRequestFormRequiredFields.modgrpcde, "");
      }
    });
  };

  console.log(singleData);

  useEffect(() => {
    if (editCopy === undefined) {
      console.log("DUPLICATING");
      setEditCopy(singleData);
    }
  }, [singleData]);

  return (
    <>
      {modalName === "Delete Confirmation" ? (
        <Modal title={"Delete Confirmation"}>
          <h1>
            Do you want to delete:{" "}
            <span className="font-bold">{deleteData.original.modcde} ?</span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            isColorSwitched={true}
            onOkBtnClick={async () => {
              if (!await validateOnDelete({
                modcde: deleteData.original.modcde
              })) {
                return toast.info(`"${deleteData.original.modcde}" is already in use. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }
              
              onConfirmedDelete()
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Special Request"} onClose={() => setOpenInfoCard(false)}>
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}

          <form id="sr-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"modcde"}
              id={"modcde"}
              value={singleData?.modcde || ""}
              description={"Special Request *"}
              error={errors}
            />

            <div className="py-3">
              <label
                htmlFor={"modgrpcde"}
                className="block mb-2 text-xs text-black font-montserrat"
              >
                {"Item Subclassification *"}
              </label>
              <Select
                isMulti
                id={"modgrpcde"}
                name={"modgrpcde"}
                options={itemSubclassification.data.map((sr) => {
                  return {
                    label: sr.itemsubclassdsc,
                    value: sr.itemsubclasscde,
                  };
                })}
                value={handleModSubClass()}
                onChange={handleSelectChange}
                className="basic-multi-select"
                classNamePrefix="select"
              />
              {errors &&
                errors["Item Subclassification *"]?.type === "required" && (
                  <EmptyInputIndicator
                    description={"Item Subclassification *"}
                  />
                )}
            </div>
          </form>

          <ButtonForm<SpecialRequestModel>
            isShowWarningCancel
            data={singleData}
            formName={"sr-form"}
            okBtnTxt={"Save"}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        <AddButton onClick={onAddClick} />

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Special Requests"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.SPECIALREQUEST);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Special Request Masterfile",
                date: dateNowFormatted(),
                headers: {
                  modcde: {
                    header: "Special Request Code",
                    id: "modcde",
                  },
                  itemsubclass: {
                    header: "Item Subclassification",
                    id: "itemsubclass",
                  },
                },
                data: printoutData,
              }}
            />
          </div>
        </div>

        <POSTable<SpecialRequestModel>
          onClick={onEditClick}
          columns={[
            {
              accessorKey: "modcde",
              id: "modcde", // Make sure to include the 'id' property
              header: "Description",
            },
          ]}
          tableSearchPlaceholder="Search Special Requests"
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={fixallLoadedData()}
          onDeleteConfirm={openDeleteConfirmation}
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
