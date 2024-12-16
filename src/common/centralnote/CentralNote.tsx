
interface CentralNoteProps {
  description: string;
}

export function CentralNote(props: CentralNoteProps) {

  const { description } = props;

  return (
    <>
      <div className="flex justify-center w-full p-2 font-montserrat font-bold border-2 fixed bottom-0">
        <span>Syncing of {description} is located at Utilities/Sync Master File</span>
      </div>
    </>
  )
}