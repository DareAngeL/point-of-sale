import { BaseModel } from "./basemodel";

export interface PrinterStationModel extends BaseModel{
    locationcde : string;
    terminalip : string;
    printername : string;
    locationdsc : string;
    printertype : string;
    printersize : number;
    isSticker : number;
    stckheight : number;
    stckwidth : number;
    stckfontsize : number
}