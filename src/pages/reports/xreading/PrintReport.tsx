interface Props {
  isCSV?: boolean;
  isPDF?: boolean;
  isText?: boolean;
  header?: any;
  data?: any;
}

export default function PrintReport({isCSV, isText, header, data}: Props) {
  if (isText) {
    console.log(header);
    return (
      <div
        style={{
          fontFamily: "Helvetica",
          fontSize: "9px",
          lineHeight: "3px",
        }}
      >
        <div
          style={{
            fontFamily: "Helvetica",
            fontSize: "10px",
            lineHeight: "4px",
            padding: "5px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {data
            .filter((value: any) => value.length > 1) // Remove empty strings
            .map((value: any, index: number) => (
              <div style={{display: "flex", gap: "5px"}} key={index}>
                {value.map((item: any, index: number) => (
                  <p
                    style={
                      index === 0 && item !== "" ? {marginRight: "5px"} : {}
                    }
                  >
                    {index === value.length - 1 ? `${item}` : item}
                  </p>
                ))}
              </div>
            ))}
        </div>
      </div>
    );
  } else if (isCSV) {
    return (
      <div
        id=""
        style={{
          fontFamily: "Helvetica",
          fontSize: "10px",
          lineHeight: "4px",
          padding: "5px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {data
          .filter((value: any) => value.length > 1) // Remove empty strings
          .map((value: any, index: number) => (
            <div style={{display: "flex", gap: "5px"}} key={index}>
              {value.map((item: any, index: number) => (
                <p
                  style={index === 0 && item !== "" ? {marginRight: "5px"} : {}}
                >
                  {index === value.length - 1 ? `${item},` : item}
                </p>
              ))}
            </div>
          ))}
      </div>
    );
  }
}
