import { BaseModel } from "./basemodel";

export interface Userfile extends BaseModel{
    approver : number;
    email : string;
    prntrange : number;
    usrcde : string;
    usrname : string;
    usrpwd : string;
    usrtyp : string;
    cardholder : string;
    cardno : string;
    receive_zreading : string;
}