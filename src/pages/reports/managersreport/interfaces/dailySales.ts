export interface DailySales {
  trndte: string;
  trncde: string;
  groext: number | string;
  lessvat: number | string;
  amtdis: number | string;
  govdisc: number;
  extprc: number | string;
  ordocnum: string;
  netvatamt: number | string;
  vatamt: number | string;
  vatexempt: number | string;
  discde: string ;
  logtim: string;
  postrntyp: string;
  refund: number;
  void: number;
  billdocnum: string;
  itmqty: number | string;
  itmcde: string;
  numpax: number;
}

export interface DailysalesHistoryData {
  lessPostRefund: number;
  lessPostVoid: number;
  lessDiscounts: number;
  lessServiceCharge: number;
  lessVatAdj: number;
  totalVatSales: number;
  totalNonVatSales: number;
  totalTransaction: number;
  totalPax: number;
  totalQty: number;
  cash: number;
  otherMop: number;
  cashFund: number;
  cashInDrawer: number;
  posCash: number;
  declaration: number;
  shortOver: number;
  netSales: number;
  grossSales: number;
  begOr: string,
  endOr: string
}