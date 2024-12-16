import { BaseModel } from "./basemodel";

export interface FooterModel extends BaseModel {
  officialreceipt: number;
  supname: string;
  supaddress: string;
  supvarregtin: string;
  supnonvatregtin: string;
  accrenum: string;
  accredate: string;
  permitnum: string;
  validyr: number;
  footermsg1: string;
  footermsg2: string;
  footermsg3: string;
  footermsg4: string;
  footermsg5: string;
  dateissued: string;
}
