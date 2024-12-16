




export function formatTableData(arr: any[], except: number){

    
    return arr.map((item: any, index) => {
        if( typeof item === 'number' && index !== except){
            return item.toFixed(2);
        }
        return item;
    })

}

export function formatNumberData(number: any){

    if(typeof number === 'number'){
        return number.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    }

    return number;
}

export function sumTableData(data: any, pastAccumulatedValue: any = {}){
    const tempData = {...pastAccumulatedValue}

    const flag = Object.keys(pastAccumulatedValue).length === 0;
    
    if(flag){
        tempData.gross = data.gross;
        tempData.qty = data.qty;
        tempData.vatadj = data.vatadj;
        tempData.discount = data.discount;
        tempData.vatExemptSales = data.vatExemptSales;
        tempData.vatExemptLessDisc = data.vatExemptLessDisc;
        tempData.vatableSales = data.vatableSales;
        tempData.vatAmount = data.vatAmount;
        tempData.netSalesWVat = data.netSalesWVat;
        tempData.netSalesWoVat = data.netSalesWoVat;
    }
    else{
        
        tempData.gross += data.gross;
        tempData.qty += data.qty;
        tempData.vatadj += data.vatadj;
        tempData.discount += data.discount;
        tempData.vatExemptSales += data.vatExemptSales;
        tempData.vatExemptLessDisc += data.vatExemptLessDisc;
        tempData.vatableSales += data.vatableSales;
        tempData.vatAmount += data.vatAmount;
        tempData.netSalesWVat += data.netSalesWVat;
        tempData.netSalesWoVat += data.netSalesWoVat;

    }

    return tempData;

}

// itemName: itemFind?.itmdsc, 
// qty: his.itmqty*1, 
// amount: his.untprc*his.itmqty, 
// vatadj: his.lessvat*1, 
// discount: his.amtdis*1, 
// totalAmount: his.extprc*1,
// itmcde: his.itmcde,
// orderType: his.ordertyp

export function sumTableDailyDineType(data: any, pastAccumulatedValue: any = {}){
    const tempData = {...pastAccumulatedValue};
    

    const flag = Object.keys(pastAccumulatedValue).length === 0;
    
    if(flag){
        tempData.qty = data.qty;
        tempData.vatadj = data.vatadj;
        tempData.discount = data.discount;
        tempData.amount = data.amount
        tempData.totalAmount = data.totalAmount;
    }
    else{
        
        tempData.qty += data.qty;
        tempData.vatadj += data.vatadj;
        tempData.discount += data.discount;
        tempData.amount += data.amount
        tempData.totalAmount += data.totalAmount;
    }

    const returnObj = {
        itemName: data.itemName, 
        qty: tempData.qty, 
        amount: tempData.amount,
        vatadj: tempData.vatadj,
        discount: tempData.discount,
        totalAmount: tempData.totalAmount
    }

    return returnObj;

}

function generateHourlyIntervals(): string[] {
    const intervals: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        const start = hour.toString().padStart(2, '0') + ":00";
        const end = hour.toString().padStart(2, '0') + ":59";
        intervals.push(start + " - " + end);
    }
    return intervals;
}

export function groupDataIntoIntervals(data: any[]): Map<string, any[]> {
    const intervals = generateHourlyIntervals();
    const groupedData: Map<string, any[]> = new Map();
    intervals.forEach(interval => groupedData.set(interval, []));
  
    data.forEach(item => {
      const hour = item.logtim.split(":")[0].padStart(2, '0');
      const interval = intervals.find(i => i.startsWith(hour));
      if (interval) {
        groupedData.get(interval)?.push(item);
      }
    });
  
    return groupedData;
}

export function dateChecker(date: any) {
    return !isNaN(new Date(date).getTime()) || !isNaN(new Date('2000-01-01T' + date).getTime());
}

export const separateByTransaction = (posfileGroup: any[]) => {

    console.log('posfile group', posfileGroup);

    const x = posfileGroup.reduce((acc: any, cur: any) => {
        let indexName = cur.postrntyp;
        
        if(indexName.toLowerCase() == "less vat adj."){
                console.log("HAHAHA less vat");
                indexName = "LESSVATADJ"

        }

        if(!acc[indexName])
            acc[indexName] = [];
        

        acc[indexName].push(cur);

        return acc;
    }, {});

    console.log("Check please",x);

    return x;
}

export const separateByTransactionByCode = (posfileGroup: any[]) => {
    // CASH, CHANGE, EXCESS
    return posfileGroup.reduce((acc: any, cur: any) => {

        if(!acc[cur.itmcde])
            acc[cur.itmcde] = [];

        acc[cur.itmcde].push(cur);

        return acc;
    }, {});
}

export const groupBatchnum = (posfileGroup: any[]) => {
    return posfileGroup.reduce((acc: any, cur: any) => {
        
        if(cur.batchnum == "")
            return acc;

        if(!acc[cur.batchnum])
            acc[cur.batchnum] = [];

        acc[cur.batchnum].push(cur);

        return acc;

    }, {});
}

export const separateDiscount = (posfileGroup: any) => {

    let All = 0;

    const filteredNonVoidDiscs = posfileGroup?.filter((d:any) => d.void == 0 && d.refund == 0);
    // const filteredRefundsDiscs = posfileGroup.filter((d:any) => d.refund ==1);

    const reducedDiscs = filteredNonVoidDiscs?.reduce((acc: any, cur: any) => {
                

        if(!acc[cur.discde])
            acc[cur.discde] = [];

        acc[cur.discde].push(cur);
        All+=cur.amtdis

        return acc;

    }, {});

    // const allRefDiscount = filteredRefundsDiscs.reduce((acc: any, cur: any) => acc+=cur.amtdis,0)

    return {...reducedDiscs, All}
}