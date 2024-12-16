export interface Menus {
  [index: string]: string | number | boolean | undefined;
  recid?: number;
  module?: string;
  mengrp?: string;
  mencap?: string;
  menfield?: string;
  usrtyp?: string;
  allowadd?: string;
  allowedit: number;
  allowprint: number;
  allowvoid: number;
  allowcancel: number;
  allowbillout: number;
  allowtransfer: number;
  allowimport: number;
  allowdelete: number;
  allowresend: number;
  allowprops: any;
}
