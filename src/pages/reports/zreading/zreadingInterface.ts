interface SalesSummary {
  localtax: number;
  serv_charge_disc: number;
  gross_sales: number;
  less_post_void: number;
  less_post_refund: number;
  less_post_refund_netvatamt: number;
  less_post_refund_vatamt: number;
  less_post_refund_vatexempt: number;
  less_disc: number;
  scpwdDiscount: number;
  less_serv_charge: number;
  less_vat_adj: number;
  vat_amount: number;
  net_sales: number;
  total_vat_sales: number;
  total_vat_exempt: number;
  vat_exempt_net: number;
  total_non_vat_sales: number;
  total_numtrans: number;
  total_numpax: number;
  total_quantity: number;
  average_sales: number;
}

interface Cash {
  qty: number;
  cashsales: number;
}

interface CashTransactionSummary {
  cash: Cash;
  cashfund: number;
  cash_in: number;
  cash_out: number;
  exp_cash: number;
  pos_cash: number;
  end_cash: number;
  shortover: number;
  excess: number;
}

interface SalesByDineType {
  ordertyp: string;
  postypdata: any[];
  itmqty: number;
  extprc: number;
}

interface DocnumSummary {
  beg_or: string;
  end_or: string; 
}

interface ZReadData {
  cashier:string,
  sales_summ : SalesSummary,
  discounts : any[],
  cash_tran_summ : CashTransactionSummary,
  card_sales : any[],
  othermop : any[],
  sales_by_item : any[],
  category_sales : any[],
  sales_by_dinetype : SalesByDineType[],
  postvoids : any[],
  beg_void : string,
  end_void : string,
  postrefunds : any[],
  beg_refund : string,
  end_refund : string,
  docnum_summ : DocnumSummary,
  z_counter :number,
  beg_sales:number,
  end_sales:number
}