import {BaseModel} from "./basemodel";

export interface MemcTypeModel extends BaseModel {
  code: string;
  value: string;
  recid: number;
  codedsc: string;
}
