import CashDeclarationNumberButton from "../common/buttons/CashDeclarationNumberButton";
import {ClearSaveButtons} from "../common/buttons/ClearSaveButtons";
import {NumberInput} from "../common/input/NumberInput/NumberInput";
import {useCashDeclaration} from "../../../../hooks/cashieringHooks";
import {useAppSelector} from "../../../../store/store";
import {useState} from "react";
import {Modal, Spin} from "antd";
import {useNavigate} from "react-router";
import {useModal} from "../../../../hooks/modalHooks";

enum View {
  UPLOADING,
  REDIRECTING,
  SETUP,
}

export function CashDeclaration() {
  const {handleSaveTotal, handleClearTotal, setOpenWarningModal, openWarningModal} = useCashDeclaration();
  const [viewType, setViewType] = useState<View>(View.SETUP);
  const {dispatch} = useModal();

  const navigate = useNavigate();

  const {denom, cashDeclarationTotal} = useAppSelector(
    (state) => state.transaction
  );

  const renderButtons = () => {
    return denom.map((item: any, index: number) => {
      return <CashDeclarationNumberButton key={index} {...item} />;
    });
  };

  const onSave = async () => {
    setViewType(View.UPLOADING);
    const onSaved = await handleSaveTotal().catch((err) => {
      console.log(err);
      setViewType(View.SETUP);
      return false;
    });

    if (onSaved) {
      setViewType(View.REDIRECTING);
      // redirect back to home
      setTimeout(() => {
        dispatch();
        navigate("/pages/home");
      }, 1200);
    }
  };

  if (viewType === View.UPLOADING)
    return (
      <>
        <div className="flex ">
          <Spin />
          <p className="mx-5">Processing...</p>
        </div>
      </>
    );

  if (viewType === View.REDIRECTING)
    return (
      <>
        <div className="flex ">
          <Spin />
          <p className="mx-5">Redirecting back to home...</p>
        </div>
      </>
    );

  return (
    <>
      <Modal 
        open={openWarningModal}
        title="You are about to declare cash with '0' total. Are you sure?"
        okButtonProps={{style: {backgroundColor: 'green'}}}
        onOk={onSave}
        onCancel={() => setOpenWarningModal(false)}
      />
      <form className="h-[100%] form-container flex flex-col gap-4">
        <div className="btn-controls">{renderButtons()}</div>
        <NumberInput total={cashDeclarationTotal} />
        <ClearSaveButtons
          onClear={handleClearTotal}
          onCancel={handleClearTotal}
          onSave={() => {
            if (cashDeclarationTotal === 0) {
              setOpenWarningModal(true);
              return;
            }

            onSave();
          }}
          hasPrint={true}
        />
      </form>
    </>
  );
}
