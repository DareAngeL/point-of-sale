import { CashieringNumber } from "./CashieringNumberButton";

interface CashieringButtonProps {
  onButtonClick: (btn: string) => void;
  onEraseBtnClick: () => void;
  setCustomBtnTxt?: {
    1: string,
    2: string,
    3: string,
    4: string,
    5: string,
    6: string,
    7: string,
    8: string,
    9: string,
    0: string,
    C: string,
    ".": string
  };
}

export function CashieringNumberButtonGroup(props: CashieringButtonProps) {
  const { onButtonClick, onEraseBtnClick } = props;

  return (
    <>
      <div className="my-4">
        <div className="flex justify-center my-1">
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[1]:"1")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[1]:1}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[2]:"2")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[2]:2}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[3]:"3")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[3]:3}
            </CashieringNumber>
          </div>
        </div>

        <div className="flex justify-center my-1">
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[4]:"4")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[4]:4}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[5]:"5")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[5]:5}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[6]:"6")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[6]:6}
            </CashieringNumber>
          </div>
        </div>

        <div className="flex justify-center my-1">
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[7]:"7")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[7]:7}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[8]:"8")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[8]:8}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[9]:"9")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[9]:9}
            </CashieringNumber>
          </div>
        </div>

        <div className="flex justify-center my-1">
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={()=> props.setCustomBtnTxt?onButtonClick(props.setCustomBtnTxt['C']):onEraseBtnClick()}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt['C']:'C'}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt[0]:"0")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt[0]:0}
            </CashieringNumber>
          </div>
          <div className="flex justify-center flex-auto">
            <CashieringNumber
              onClick={() => onButtonClick(props.setCustomBtnTxt?props.setCustomBtnTxt['.']:".")}
            >
              {props.setCustomBtnTxt?props.setCustomBtnTxt['.']:'.'}
            </CashieringNumber>
          </div>
        </div>
      </div>
    </>
  );
}
