import { BaseModel } from "./basemodel";

export interface TerminalModel extends BaseModel{
    terminalname : string;
    terminalip : string;
}