
interface SingleButtonFormProps {
  formName: string;
  labelName: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function SingleButtonForm(props: SingleButtonFormProps) {

  return (
    <>
      <div className="flex justify-center items-center bg-white sticky bottom-0 p-2">
        <button
          form={props.formName}
          className={`px-4 py-2 rounded-lg border border-solid ${props.disabled ? 'border-gray-300 bg-gray-300 text-black hover:cursor-not-allowed' : 'border-green-500 bg-green-500 text-white'} my-5 mx-3 transition-all duration-200`}
          onClick={props.onClick}
          disabled={props.disabled}
        >
          {props.labelName ? props.labelName : "Update"}
        </button>
      </div>
    </>
  );
}
