
import { ALIGNMENT, usePrinterCommands } from "../../enums/printerCommandEnums";
import { formatNumberWithCommasAndDecimals } from "../../helper/NumberFormat";
import { XZReportData } from "../../pages/reports/zreading/zreadingreport/xzreportBuilder";

export function zReadingReceiptPrintout(zReadingReportData:any){

    const {input, tableInput, lineBreak, fullCut, encode, bigInput} = usePrinterCommands();

    
    const data  = zReadingReportData

    const salesData = (data: XZReportData[]) => {

        lineBreak();
        input(`------------------------------------------------`, ALIGNMENT.LEFT);
        lineBreak()
        
        if(data){
            data.forEach((data: XZReportData) => {
                tableInput(data.label || "", data.value || "")
            })
        }
    }

    const discount = () => {
        lineBreak();
        input(`------------------------------------------------`, ALIGNMENT.LEFT);
    
        input("Discounts", ALIGNMENT.CENTER)
    
        if(data.discounts_data){
            data.discounts_data.forEach((data : XZReportData) => {
                input(data.label, ALIGNMENT.LEFT);
                tableInput(data.qty+"" || "", data.value || "");
            });
        }
    };

    const cash = () => {

        lineBreak();
        input(`------------------------------------------------`, ALIGNMENT.LEFT);

        input(data.cash_data && data.cash_data[0] && data.cash_data[0].label, ALIGNMENT.LEFT);

        tableInput(data.cash_data && data.cash_data[0] && data.cash_data[0].qty.toString() || "",data.cash_data && data.cash_data[0] && data.cash_data[0].value || "");

        if(data.all_cash_data){
            data.all_cash_data.forEach((data : XZReportData) => {
                tableInput(data.label || "", data.value || "");
            })
        }

        lineBreak();
        input(`------------------------------------------------`, ALIGNMENT.LEFT);

    }

    const cardSales = () => {
        input("Card Sales", ALIGNMENT.CENTER);

        lineBreak();
        input(`------------------------------------------------`, ALIGNMENT.LEFT);


        if(data.card_sales_data){
            data.card_sales_data.forEach((data: XZReportData) => {
                input(data.label, ALIGNMENT.LEFT);

                (data.subLbls as Array<any>).forEach((data: {amount: number; cardclass: string, qty: number}) => {
                    input(data.cardclass, ALIGNMENT.LEFT);
                    tableInput(`${data.qty.toString() || ""}`, data.amount+"" || "")
                });
            });
        }
    }
   
    const otherMOP = () => {

        input("Other MOP Sales", ALIGNMENT.CENTER);

        lineBreak();
        input(`------------------------------------------------`, ALIGNMENT.LEFT);
        
        if(data.other_sales_data && data.other_sales_data){
            data.other_sales_data.forEach((data: XZReportData) => {
                input(data.label, ALIGNMENT.LEFT);
                tableInput(`${data.qty?.toString()|| ""}`, data.value+""|| "")
            });
        }

    }

    if(data.header){
        Object.keys(data.header).forEach((key) => {

            if(key!=="title" && key!=="date"){
                input(data.header[key], ALIGNMENT.CENTER)
            }

        })
    }

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    lineBreak();

    bigInput(data.header ? data.header.title : "Z-Reading", ALIGNMENT.CENTER, true)

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    lineBreak();

    bigInput(data.header ? data.header.date : "", ALIGNMENT.CENTER, true)

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    lineBreak();

    input(`CASHIER: ${data.cashier}`, ALIGNMENT.CENTER)

    salesData(data.sales_data);
    discount();
    cash();
    cardSales();
    otherMOP();
    
    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    bigInput("ITEMIZED SALES", ALIGNMENT.CENTER, true);

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    if(data.itemized_sales_data){
        data.itemized_sales_data.forEach((data: XZReportData) => {
            input(data.label, ALIGNMENT.LEFT);
            tableInput(data.qty+""|| "", data.value|| "");
        });
    }

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    bigInput("CATEGORY SALES", ALIGNMENT.CENTER, true);

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);


    if(data.category_sales_data){
        data.category_sales_data.forEach((data: XZReportData) => {
            input(data.label, ALIGNMENT.LEFT);
            tableInput(data.qty+""|| "", data.value|| "");
        });
    }

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    bigInput("SALES BY DINE-TYPE", ALIGNMENT.CENTER, true);

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);


    if(data.sales_by_dine_type_data){
        data.sales_by_dine_type_data.forEach((data: XZReportData) => {
            input(data.label, ALIGNMENT.LEFT);
            tableInput(data.qty+""|| "", data.value|| "");

            (data.subLbls as any[]).forEach((d:{
                itmqty: any;
                extprc: any;
                postypcde: any;
                postypdsc: any;
              }) => {
                input("   " + d.postypdsc|| "", ALIGNMENT.LEFT);
                tableInput("   " + d.itmqty+""|| "", formatNumberWithCommasAndDecimals(d.extprc, 2)|| "");
              });
        });
    }

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    bigInput("SUMMARY", ALIGNMENT.CENTER);

    salesData(data.summary_data);
    discount();
    cash();
    cardSales();
    otherMOP();


    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    input("Post Void", ALIGNMENT.CENTER);


    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    if(data.postvoids){
        data.postvoids.forEach((data: XZReportData) => {
            tableInput(data.label+""|| "", data.value || "");
        });
    }

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    tableInput(data.beg_void && data.beg_void.label || "", data.beg_void && data.beg_void.value || "")
    tableInput(data.end_void && data.end_void.label || "", data.end_void && data.end_void.value || "")

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    input("Post Refund", ALIGNMENT.CENTER);

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    if(data.postrefunds){
        data.postrefunds.forEach((data: XZReportData) => {
            tableInput(data.label || "", data.value || "")
        });
    }

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    if(data.post_refund_data){
        data.post_refund_data.forEach((data: XZReportData) => {
            tableInput(data.label || "", data.value || "")
        });
    }

    lineBreak();
    input(`------------------------------------------------`, ALIGNMENT.LEFT)

    input(data.datetime && data.datetime, ALIGNMENT.CENTER)
    bigInput("End of Z - Reading Report", ALIGNMENT.CENTER, true)

    for(let i =0; i<5; i++){
        lineBreak();
    }

    fullCut();

    console.log('raw', encode());
    

    return encode();

}
