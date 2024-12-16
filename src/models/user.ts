export interface User {
  recid: number;
  usrcde: string;
  usrname: string;
  usrpwd: string;
  usrtyp: string;
  email: string;
  receive_zreading: number;
  approver?: number;
  prntrange?: number;
  useraccess: any;
  cardno?: string;
  cardholder?: string;
}
