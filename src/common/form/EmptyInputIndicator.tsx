export function EmptyInputIndicator(props: { description: string }) {
  return (
    <>
      <div
        className="text-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span>{props.description}</span>
        <strong className="font-bold block sm:inline"> is required</strong>
      </div>
    </>
  );
}
