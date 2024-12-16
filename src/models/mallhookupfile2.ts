import { BaseModel } from "./basemodel";

export interface MallHookup2Model extends BaseModel {
  mall_id: number;
  input_type: 'TEXT' | 'NUMBER' | 'SELECT';
  label: string;
  value: string;
  is_select: number;
}