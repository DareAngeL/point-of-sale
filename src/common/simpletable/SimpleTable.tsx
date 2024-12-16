
interface SimpleTableProps{
    data : any[];
    headers : {
        [key : string] : {header : string, id : string};
    };
}

export function SimpleTable(props : SimpleTableProps){

    const headerKeys = Object.keys(props.headers)
    const headerValues = Object.values(props.headers)


    return (
        <>
            <section className=" w-full h-full">
                <table className="w-full">
                    <thead className="border-b-2 border-black m-0">
                        <tr>
                            {headerValues.map((item) => (
                                <th key={item.id} className="text-left pb-4">
                                    {item.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="">
                        {props.data.map((item, index) => (
                        <tr key={index}>
                            {headerKeys.map((header, index) => (
                            <td className="pt-4" key={index}>
                                {item[header]}
                            </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </>
    )
}