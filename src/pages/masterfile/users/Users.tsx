import { useEffect, useRef, useState } from "react";
import { AddButton } from "../../../common/addbutton/AddButton";
import { BackButton } from "../../../common/backbutton/BackButton";
import { PrinterButton } from "../../../common/printerbutton/PrinterButton";
import { PageTitle } from "../../../common/title/MasterfileTitle";
import { dateNowFormatted } from "../../../helper/Date";
import { useServiceMasterfile } from "../../../hooks/masterfileHooks";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Modal } from "../../../common/modal/Modal";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { useModal } from "../../../hooks/modalHooks";
import { InputText } from "../../../common/form/InputText";
import { InputEmail } from "../../../common/form/InputEmail";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { PasswordForm } from "./PasswordForm";
import { CardCredentialsForm } from "./CardCredentialsForm";
import { ReceiveReportForm } from "./ReceiveReportForm";
import { UserAccessFormV2 } from "./UserAccessFormV2";
import { toast } from "react-toastify";
import { User } from "../../../models/user";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { getMenus } from "../../../store/actions/menus.action";
import { useUserActivityLog } from "../../../hooks/useractivitylogHooks";
import { MODULES } from "../../../enums/activitylogs";
import { InfoCard } from "../InfoCard";

interface UsersFormRequiredValues {
  "User Code *": string;
  "User Name *": string;
  "Password *": string;
  "Re-type Password *": string;
  "Email *": string;
}

enum UsersRequiredFields {
  usrcde = "usrcde",
  usrname = "usrname",
  usrpwd = "usrpwd",
  c_usrpwd = "c_usrpwd",
  email = "email",
}

export function Users() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<User | any>("userFile");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    errors,
    changeRequiredValue,
    clearErrors,
  } = useFormInputValidation<UsersFormRequiredValues>();

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
  } = useTablePagination<User>(setAllLoadedData, "userFile");

  const {createAction, updateAction} = useUserActivityLog();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);

  const { company, syspar, menus } = useAppSelector(
    (state) => state.masterfile
  );

  const [openInfoCard, setOpenInfoCard] = useState(false);
  const [deleteData, setDeleteData] = useState<any>();
  const [isSwiping, setIsSwiping] = useState(false);

  const modalBodyRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { dispatch: dispatchModal, modal } = useModal();
  const modalName = useAppSelector((state) => state.modal.modalName);

  const handleInputChange = ({
    target: { name, value, checked, type },
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value, checked, type);
  };

  useEffect(() => {
    if (!menus.isLoaded) {
      dispatch(getMenus());
    }

    if (modal) {
      const inputs: any = [
        {
          path: "User Code *",
          name: "usrcde",
          value: singleData?.usrcde || "",
        },
        {
          path: "User Name *",
          name: "usrname",
          value: singleData?.usrname || "",
        },
        {
          path: "Email *",
          name: "email",
          value: singleData?.email || "",
        },
      ];
      
      if (!singleData?.recid) {
        inputs.push({
          path: "Password *",
          name: "usrpwd",
          value: singleData?.usrpwd || "",
        });
        inputs.push({
          path: "Re-type Password *",
          name: "c_usrpwd",
          value: singleData?.c_usrpwd || "",
        });
      }
      
      registerInputs({inputs});
      
    }

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  const submit = () => {
    
    if (isSwiping) return;

    // check if the password is correct
    if (!singleData?.recid && singleData?.usrpwd !== singleData?.c_usrpwd) {
      toast.error("Password does not match", {
        autoClose: 1500,
        hideProgressBar: true,
        position: "top-center"
      });

      return;
    }

    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\USER:${singleData?.usrname}`;
        createAction({module: MODULES.USERS, remarks: createRemarks});
        break;
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.USERS,
          },
          {
            itemName: singleData?.usrname,
          }
        );
        break;
      // print in print button
      // delete in delete button

      default:
        console.log("default");
        break;
    }

    // determine if this will be for adding user or updating user
    if (!singleData?.recid) {
      onSubmit({
        isAdd: true
      }, status, () => {
        if (status === "CREATE") {
          // smooth scroll to top
          modalBodyRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          setSingleData(undefined);
          setOpenInfoCard(true);
          changeRequiredValue(UsersRequiredFields.usrcde, "");
          changeRequiredValue(UsersRequiredFields.usrname, "");
          changeRequiredValue(UsersRequiredFields.usrpwd, "");
          changeRequiredValue(UsersRequiredFields.c_usrpwd, "");
          changeRequiredValue(UsersRequiredFields.email, "");
        }
      });
    } else {
      onSubmit({
        isAdd: false
      }, status);
    }
  }

  const handleOnReportListSelection = (reports: string[]): void => {
    setSingleData((prev: any) => {
      
      return {
        ...prev,
        reportslist: reports
      }
    })
  }

  console.log('xxPAS', singleData);
  

  return (
    <>
      {modalName === "Delete Confirmation" ? (
        <Modal title={"Delete Confirmation"}>
          <h1>
            Do you want to delete:{" "}
            <span className="font-bold">{deleteData.original.usrname} ?</span>
          </h1>
          <ButtonForm
            formName={""}
            isActivated={false}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            isColorSwitched={true}
            onOkBtnClick={() => {
              dispatchModal();
              onDelete(deleteData);
            }}
          />
        </Modal>
      ) : (
        <Modal
          title={"Users"}
          isActivated={false}
          bodyRef={modalBodyRef}
          onClose={() => {
            clearErrors()
            setSingleData({});
            setOpenInfoCard(false);
          }}
        >
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}
          <span className="text-[10px] text-gray-500">
            Fields with (*) asterisk are required
          </span>
          <form id="user-form" onSubmit={handleSubmit(submit)} aria-disabled>
            <InputText
              description="User Code *"
              name="usrcde"
              id="usrcde"
              value={singleData?.usrcde}
              error={errors}
              required
              handleInputChange={handleInputChange}
            />

            <InputText
              description="User Name *"
              name="usrname"
              id="usrname"
              value={singleData?.usrname}
              error={errors}
              required
              handleInputChange={handleInputChange}
            />

            <PasswordForm
              data={singleData}
              errors={errors}
              handleInputChange={handleInputChange}
            />

            <CardCredentialsForm
              data={singleData}
              setData={setSingleData}
              handleInputChange={handleInputChange}
              onCardSwiping={(swiping) => setIsSwiping(swiping)}
            />

            <InputEmail
              description="Email *"
              name="email"
              id="email"
              value={singleData?.email}
              error={errors}
              required
              handleInputChange={handleInputChange}
            />

            <ReceiveReportForm
              data={singleData}
              syspar={syspar.data[0]}
              errors={errors}
              handleInputChange={handleInputChange}
              onReportListSelection={handleOnReportListSelection}
            />

            <UserAccessFormV2
              usrcde={singleData?.usrcde}
              data={singleData}
              onChangeData={onChangeData}
              menus={menus.data}
              handleInputChange={handleInputChange}
            />
          </form>

          <ButtonForm
            dontAddDataOnFirstRender
            isShowWarningCancel
            data={singleData}
            formName={"user-form"}
            okBtnTxt={"Save"}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        <AddButton onClick={() => {
          setStatus("CREATE");
          onOpenModal("Add User");
         }} 
        />

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Users"} />
          </div>

          <PrinterButton
            printoutData={{
              companyName: company.data[0].comdsc,
              title: "User Master File",
              date: dateNowFormatted(),
              headers: {
                usrcde: {
                  header: "User Code",
                  id: "usrcde",
                },
                usrname: {
                  header: "User Name",
                  id: "usrname",
                },
              },
              data: allLoadedData,
            }}
          />
        </div>

        <POSTable<User>
          onClick={(row) => {
            setStatus("UPDATE");
            setEditCopy(singleData);
            onOpenModal("Edit User");
            setSingleData(row.original);
          } }
          columns={[
            {
              accessorKey: "usrcde",
              header: "User Code",
            },
            {
              accessorKey: "usrname",
              header: "User Name",
            },
          ]}
          tableSearchPlaceholder="Search User Code"
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={allLoadedData}
          onDeleteConfirm={(row) => {
            setDeleteData(row);
            onOpenModal("Delete Confirmation");
          }}
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
