export interface UserAccess {
  recid?: number;
  usrcde?: string;
  usrtyp?: string;
  module?: string;
  allowadd?: 1;
  allowedit?: 1;
  allowvoid?: 1;
  allowprint?: 1;
  allowdelete?: 1;
  allowtresend?: 1;
  allowtimport?: 1;
}
