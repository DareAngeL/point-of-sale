import {ButtonForm} from "../../../../common/form/ButtonForm";

interface Props {
  onSubmit: () => void;
}

export function Confirmation({onSubmit}: Props) {
  return (
    <>
      <div className="flex flex-col  gap-4 items-center">
        <h1>Do you want to make a copy of existing database?</h1>
        <ButtonForm
          formName="confirmation"
          onOkBtnClick={onSubmit}
          okBtnTxt="Confirm"
        />
      </div>
    </>
  );
}
