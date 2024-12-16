import {formatDateToDDMMYY} from "../../../../../helper/Date";
import {helperFixName} from "../../../../../helper/transaction";

interface Props {
  receiptData: any;
  company: {
    data: any;
    isLoaded: boolean;
  };
  reason?: string;
  denom?: any;
}
const Receipt = (props: Props) => {
  const {
    receiptData,
    company: {data},
    reason,
    denom,
  } = props;

  const {
    address1,
    address2,
    address3,
    business1,
    business2,
    business3,
    tin,
    machineno,
    serialno,
  } = data[0];

  if (denom) {
    return (
      <div
        style={{
          fontFamily: "Helvetica",
          fontSize: "9px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          lineHeight: "2px",
          // position: "absolute",
          // top: "0%",
          // right: "0%",
          width: "300px",
          // height: "100%",
          // backgroundColor: "gray",
        }}
      >
        <header
          style={{
            textAlign: "center",
            width: "100%",
            height: "20%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>{business1}</p>
          <p>{business2}</p>
          <p>{business3}</p>
          <p>VAT Reg. {tin}</p>
          <p>{address1}</p>
          <p>{address2}</p>
          <p>{address3}</p>
        </header>

        <div
          className="mid"
          style={{
            height: "15%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <p>
            MIN#:{machineno} SN#:{serialno}
          </p>
          <h1>CASH DECLARATION</h1>
          <p>
            {formatDateToDDMMYY(receiptData.trndte)} {receiptData.logtim}
          </p>
        </div>

        <div
          className="transaction"
          style={{
            width: "100%",
            height: "40%",
            padding: "2px",
          }}
        >
          <p
            style={{
              textAlign: "left",
              borderTop: "dashed 1px #000",
              borderBottom: "dashed 1px #000",
              padding: "8px",
            }}
          >
            CASHIER: {receiptData.cashier}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "4px",
            }}
          >
            {denom ? (
              <>
                <p>Denom Summary</p>
                {denom.map((item: any, index: number) => {
                  const {value, quantity, total} = item;
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        fontSize: "7px",
                        margin: "0px",
                        padding: "0px",
                      }}
                    >
                      <p>
                        {value} x {quantity}
                      </p>
                      <p>{total}</p>
                    </div>
                  );
                })}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <p>TOTAL: </p>
                  <p>{receiptData.extprc}</p>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <p>TOTAL: </p>
                <p>{receiptData.extprc}</p>
              </div>
            )}

            {reason && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <p>REASON:</p>
                <p>{reason}</p>
              </div>
            )}
          </div>
        </div>

        <footer
          style={{
            height: "25%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            alignItems: "center",
            justifyContent: "space-evenly",
            borderTop: "dashed 1px #000",
          }}
        >
          <div
            className="cash-sig"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                width: "100%",
                borderTop: "solid 1px #000",
              }}
            ></p>
            <p>Cashier's Signature</p>
          </div>
          <div
            className="sup-sig"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                width: "100%",
                borderTop: "solid 1px #000",
              }}
            ></p>
            <p>Supervisor's Signature</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Helvetica",
        fontSize: "9px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        lineHeight: "2px",
        position: "absolute",
        top: "0%",
        right: "0%",
        width: "100%",
        height: "100%",
      }}
    >
      <header
        style={{
          textAlign: "center",
          width: "100%",
          height: "30%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>{business1}</p>
        <p>{business2}</p>
        <p>{business3}</p>
        <p>VAT Reg. {tin}</p>
        <p>{address1}</p>
        <p>{address2}</p>
        <p>{address3}</p>
      </header>

      <div
        className="mid"
        style={{
          height: "20%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <p>
          MIN#:{machineno} SN#:{serialno}
        </p>
        <h1>{helperFixName(receiptData.itmcde)}</h1>
        <p>
          {formatDateToDDMMYY(receiptData.trndte)} {receiptData.logtim}
        </p>
      </div>

      <div
        className="transaction"
        style={{
          width: "100%",
          height: "20%",
          padding: "2px",
        }}
      >
        <p
          style={{
            textAlign: "left",
            borderTop: "dashed 1px #000",
            borderBottom: "dashed 1px #000",
            padding: "5px",
          }}
        >
          CASHIER: {receiptData.cashier}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <p>TOTAL: </p>
            <p>{receiptData.extprc}</p>
          </div>

          {reason && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <p>REASON:</p>
              <p>{reason}</p>
            </div>
          )}
        </div>
      </div>

      <footer
        style={{
          height: "30%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          alignItems: "center",
          justifyContent: "space-evenly",
          borderTop: "dashed 1px #000",
        }}
      >
        <div
          className="cash-sig"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              width: "100%",
              borderTop: "solid 1px #000",
            }}
          ></p>
          <p>Cashier's Signature</p>
        </div>
        <div
          className="sup-sig"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              width: "100%",
              borderTop: "solid 1px #000",
            }}
          ></p>
          <p>Supervisor's Signature</p>
        </div>
      </footer>
    </div>
  );
};

export default Receipt;
