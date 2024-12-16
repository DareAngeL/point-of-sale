export interface ActivityLog {
  recid?: number;
  usrname?: string;
  usrcde?: string;
  trndte?: Date | string;
  module?: string;
  method?: string;
  remarks?: string;
}
