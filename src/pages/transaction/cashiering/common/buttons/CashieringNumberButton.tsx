interface CashieringNumberProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function CashieringNumber(props: CashieringNumberProps) {
  const {onClick, children} = props;

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="font-montserrat font-bold text-base rounded-full border-slate-600 hover:bg-slate-600 active:bg-slate-700 hover:text-white border-2 py-3 w-20"
      >
        {children}
      </button>
    </>
  );
}
