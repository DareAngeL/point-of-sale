interface MasterfileTitleProps {
  name: string;
}

export function PageTitle(props: MasterfileTitleProps) {
  return (
    <>
      <h1 className="text-[2rem] font-montserrat">{props.name}</h1>
    </>
  );
}
