
interface DBSetupCardProps {
  name: string;
  onClick: () => void;
}

export function DBSetupCard(props: DBSetupCardProps) {

  const { name, onClick } = props;

  return (
    <>
      <div className=" font-montserrat border-b-2 text-md mb-6 cursor-pointer hover:border-blue-200" onClick={onClick}>
        {name}
      </div>
    </>
  )
}