
import { format } from "date-fns";
import { ALIGNMENT, usePrinterCommands } from "../../enums/printerCommandEnums";
import { dateNowFormatted } from "../../helper/Date";
import { formatNumberWithCommasAndDecimals } from "../../helper/NumberFormat";
import { receiptDefiner } from "../../helper/ReceiptNumberFormatter";
// import { XZReportData } from "../../pages/reports/xzreadingreportbuilder/xzreportBuilder";

export function xReadingReceiptPrintout(selector:any){


    const {input, tableInput, bigInput, lineBreak, fullCut, encode} = usePrinterCommands();

    const {header, syspar} = selector.masterfile;
    const {account} = selector.account;
    const {xReading} = selector.report;

    const _xreading = xReading.data[0];

    input(header.data[0].business1 || "", ALIGNMENT.CENTER);
    // input(header.data[0].business2 || "", ALIGNMENT.CENTER);
    input(header.data[0].business3 || "", ALIGNMENT.CENTER);
    input((header.data[0].chknonvat ? "NON-VAT Reg."
      : "VAT Reg.") + ` TIN- ${header.data[0].tin}` || "", ALIGNMENT.CENTER);
    input(header.data[0].address1 || "", ALIGNMENT.CENTER);
    input(header.data[0].address2 || "", ALIGNMENT.CENTER);
    input(header.data[0].address3 || "", ALIGNMENT.CENTER);
    input(`MIN#${header.data[0].machineno} SN#${header.data[0].serialno}` || "", ALIGNMENT.CENTER);

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)
    lineBreak();

    bigInput("X-READING", ALIGNMENT.CENTER, true)
    
    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    lineBreak();

    bigInput(format(new Date(), 'MMMM do yyyy'), ALIGNMENT.CENTER, true)
    lineBreak();
    bigInput(format(new Date(), 'h:mm:ss a'), ALIGNMENT.CENTER, true)

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)
    lineBreak();

    input(`CASHIER: ${account.data?.usrname}`, ALIGNMENT.CENTER)

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    tableInput("Gross Sales", formatNumberWithCommasAndDecimals(
        _xreading?.sales_summ?.gross_sales,
        2
    ));

    tableInput("Less Paid Void", formatNumberWithCommasAndDecimals(
        _xreading.sales_summ.less_post_void,
                2
    ));

    tableInput("Less Paid Refund", formatNumberWithCommasAndDecimals(
        _xreading.sales_summ.less_post_refund,
                2
    ));

    tableInput("Less Discount",
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.less_disc,
            2
          )
    );

    tableInput("Less Service Charge", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.less_serv_charge,
                2
          )
    );

    tableInput("Less VAT Adj", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.less_vat_adj,
            2
          )
    );

    tableInput("Net Sales WVAT", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.net_sales,
            2
          )
    );

    tableInput("Net Sales W/O VAT", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.vat_exempt_net,
            2
          )
    );

    tableInput("Total VAT Sales", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.total_vat_sales,
                2
          )
    );

    tableInput("Total VAT Amount", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.vat_amount,
            2
          )
    );

    tableInput("Local Tax 0%", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.localtax,
                2
          )
    );

    tableInput("Local VAT Exempt", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.total_vat_exempt,
                2
          )
    );

    tableInput("Total # of Transaction", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.total_numtrans,
                2
          )
    );

    tableInput("Total # of Pax", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.total_numpax,
            2
          )
    );

    tableInput("Total Quantity", 
        formatNumberWithCommasAndDecimals(
            _xreading.sales_summ.total_quantity,
            2
          )
    );

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)
    input("Discounts", ALIGNMENT.CENTER)
    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)
    lineBreak();

    _xreading.discounts.forEach((disc:{discde: any; qty: any; amtdis: number}) => {
        input(disc.discde, ALIGNMENT.LEFT);
        tableInput(disc.qty.toString(), formatNumberWithCommasAndDecimals(disc.amtdis, 2))
    });

    
    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    input("CASH", ALIGNMENT.LEFT);

    tableInput(_xreading.cash_tran_summ.cash.qty.toString(), formatNumberWithCommasAndDecimals(_xreading.cash_tran_summ.cash.cashsales, 2))

    tableInput("CASH FUND", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.cashfund,
        2
    ))

    tableInput("CASH IN", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.cash_in,
                2
    ))

    tableInput("CASH OUT", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.cash_out,
        2
    ))

    tableInput("CASH DRAWER", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.end_cash,
                2
    ))

    tableInput("POS CASH", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.pos_cash,
                2
    ))

    tableInput("DECLARATION", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.exp_cash,
                2
    ))

    tableInput("SHORT/OVER", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.shortover,
                2
    ))

    tableInput("EXCESS", formatNumberWithCommasAndDecimals(
        _xreading.cash_tran_summ.excess,
        2
    ))
    
    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    input("Card Sales", ALIGNMENT.CENTER)

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    _xreading.card_sales.forEach((card: {
        cardtype: string;
        cardList: {
            amount: number;
            cardclass: string;
            qty: number;
        }[]
    }) => {
        input(card.cardtype, ALIGNMENT.LEFT);
        card.cardList.forEach((item)=>{
            input(item.cardclass, ALIGNMENT.LEFT);
            tableInput(`${item.qty}`, formatNumberWithCommasAndDecimals(
                item.amount,
                2
              ))

        })
    });

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    input("Other MOP Sales", ALIGNMENT.CENTER)

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    _xreading.othermop.forEach((mop: {paymenttype: any; qty: any; amount: any; excess: any}) => {
        input(mop.paymenttype, ALIGNMENT.LEFT);
        tableInput(`${mop.qty}`, formatNumberWithCommasAndDecimals(
            mop.amount,
            2
          ))
    });

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    tableInput("Beginning OR", _xreading.docnum_summ.beg_or || "")
    tableInput("Ending OR", receiptDefiner(syspar.data[0].receipt_title || 0,_xreading.docnum_summ.end_or) || "");

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    input(dateNowFormatted(), ALIGNMENT.CENTER)
    bigInput("End of Cashier's Report", ALIGNMENT.CENTER, true)

    for(let i =0; i<5; i++){
        lineBreak();
    }

    fullCut();

    console.log('raw', encode());
    

    return encode();
    


}