/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import autoTable from "jspdf-autotable";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { useModal } from "../../../../hooks/modalHooks";
import { formatTableData, groupDataIntoIntervals, sumTableDailyDineType, sumTableData, formatNumberData, dateChecker, groupBatchnum, separateByTransaction, separateDiscount, separateByTransactionByCode } from "../helpers";
import { headerBlock, horizontalTableBlock, tableBlock, titleBlock } from "../helpers/report-block";
import { formatNumberWithCommasAndDecimals, numberPadFormatter } from "../../../../helper/NumberFormat";
import { DailySales, DailysalesHistoryData } from "../interfaces/dailySales";
import { FreeTransaction } from "../interfaces/freeTransaction";
import { previousZRead, zReadCount } from "../../../../store/actions/posfile.action";
import { PosfileModel } from "../../../../models/posfile";
import { PricelistModel } from "../../../../models/pricelist";
import { PriceDetailModel } from "../../../../models/pricedetail";
import moment from "moment";
import { receiptDefiner } from "../../../../helper/ReceiptNumberFormatter";
import POSPdf from "../pdf/POSPdf";
import { formatTimeTo12Hour } from "../../../../helper/Date";
export const useReportHooks = () => {

    
    const {header, itemClassification, itemSubclassification, item, priceList, syspar} = useAppSelector(state => state.masterfile);
    const {dispatch: modalDispatch} = useModal();

    const dispatch = useAppDispatch();

    const generateItemizedReport = (doc:POSPdf, history: any, report: any) => {

        let headers: string[] = ["Item Name", "Gross", "Qty", "Vat Adjustment", "Discount", "Vat Exempt Sales", "Vat Exempt Less Discount", "Vatable Sales","Vat Amount","Net Sales w/ Vat", "Net Sales w/o Vat"];
        let tempObj: any = {}

        const columnStyles = {
            0: {cellWidth: 'auto'},
            1: {cellWidth: 30, halign: 'right'},
            2: {cellWidth: 30, halign: 'right'},
            3: {cellWidth: 30, halign: 'right'},
            4: {cellWidth: 30, halign: 'right'},
            5: {cellWidth: 30, halign: 'right'},
            6: {cellWidth: 30, halign: 'right'},
            7: {cellWidth: 30, halign: 'right'},
            8: {cellWidth: 30, halign: 'right'},
            9: {cellWidth: 30, halign: 'right'},
            10: {cellWidth: 30, halign: 'right'},
        }
        
        
        console.log(history);
        if(history){
            
            const findAllSeparate = history.reduce((acc: any, cur: any) => {

                if(cur.refund ==1)
                  acc.refund.push(cur);
                else
                  acc.nonRefund.push(cur);
          
                return acc;
            }, {refund: [], nonRefund: []});

            const {refund, nonRefund} = findAllSeparate;

            
            const mainPosfile: any[] = [];

            nonRefund.forEach((d: any) => {

                const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);

                let item = {...d};

                if(refundFind){
                    item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
                    console.log("refundFind success", refundFind);
                }

                if(item.itmqty != 0)
                    mainPosfile.push(item);

            });


            const orderitmidComboItemList = [] as any[] // list of orderitmids that are combo items
            history = mainPosfile.map((his: any) => {

                const itemFind = item.data.find((itm: any) => itm.itmcde === his.itmcde)
                const itemClassFind = itemClassification.data.find(is => is.itmclacde === itemFind?.itmclacde)
                const itemSubClassFind = itemSubclassification.data.find(isc => isc.itemsubclasscde === itemFind?.itemsubclasscde);

                const orderitemdiscount = his.orderitemdiscountfiles;

                let govDiscs = 0;
                let overallDiscs = 0;

                if(orderitemdiscount){
                  if (his.chkcombo === 1) {
                    orderitmidComboItemList.push(his.orderitmid)
                  }

                    orderitemdiscount.forEach((d:any) => {

                        console.log("meron bang laman?", d, d.amtdis);
                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            console.log("pumasok ako here hehe");
                            govDiscs+= d.amtdis*1
                        }
                    });

                }

                const vatExemptSalesLessDisc = (his.vatexempt*1) - govDiscs;
                const netSalesWOVat = (his.netvatamt*1) +vatExemptSalesLessDisc; 

                const isComboItemPartner = his.chkcombo === 0 && orderitmidComboItemList.includes(his.orderitmid);

                return {
                    itemName: itemFind?.itmdsc, 
                    gross: his.groext*1, //his.grossprc*his.itmqty, 
                    qty: his.itmqty*1, 
                    vatadj: his.lessvat*1, 
                    discount: isComboItemPartner ? 0 : overallDiscs, 
                    vatExemptSales: his.vatexempt*1, 
                    vatExemptLessDisc: isComboItemPartner ? 0 : vatExemptSalesLessDisc, 
                    vatableSales: his.netvatamt*1, 
                    vatAmount:his.vatamt*1,
                    netSalesWVat: his.extprc*1,
                    netSalesWoVat: isComboItemPartner ? 0 : netSalesWOVat, 
                    trndte: his.trndte, 
                    itmcladsc: itemClassFind?.itmcladsc, 
                    itemsubclassdsc:itemSubClassFind?.itemsubclassdsc,
                    itmcde: his.itmcde,
                    postrntyp: his.postrntyp
                }

            });

            tempObj = history.reduce((accumulator: any = {}, currentValue: any) => {
                if(report.reportRepresentation == "detailed"){

                    if(!accumulator[currentValue.trndte]){
                        accumulator[currentValue.trndte] = {}
                    }


                    if(!accumulator[currentValue.trndte][currentValue.itmcladsc]){
                        accumulator[currentValue.trndte][currentValue.itmcladsc] = {}
                    }

                    if(!accumulator[currentValue.trndte][currentValue.itmcladsc][currentValue.itemsubclassdsc]){
                        accumulator[currentValue.trndte][currentValue.itmcladsc][currentValue.itemsubclassdsc] = {}
                    }


                    
                    if(accumulator[currentValue.trndte][currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde]){
                        const itm = accumulator[currentValue.trndte][currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde];

                        itm.gross += currentValue.gross;
                        itm.qty += currentValue.qty;
                        itm.vatadj += currentValue.vatadj;
                        itm.discount += currentValue.discount;
                        itm.vatExemptSales += currentValue.vatExemptSales;
                        itm.vatExemptLessDisc += currentValue.vatExemptLessDisc;
                        itm.vatableSales += currentValue.vatableSales;
                        itm.vatAmount += currentValue.vatAmount;
                        itm.netSalesWVat += currentValue.netSalesWVat;
                        itm.netSalesWoVat += currentValue.netSalesWoVat;

                    }
                    else{
                        accumulator[currentValue.trndte][currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde] = currentValue
                    }
            
                }
                else if(report.reportRepresentation == "summarized"){
                    
                    if(!accumulator[currentValue.itmcladsc]){
                        accumulator[currentValue.itmcladsc] = {}
                    }
                    console.log("dapat summarized to");

                    if(!accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc]){
                        accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc] = {}
                    }

                    if(accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde]){
                        const itm = accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde];

                        itm.gross += currentValue.gross;
                        itm.qty += currentValue.qty;
                        itm.vatadj += currentValue.vatadj;
                        itm.discount += currentValue.discount;
                        itm.vatExemptSales += currentValue.vatExemptSales;
                        itm.vatExemptLessDisc += currentValue.vatExemptLessDisc;
                        itm.vatableSales += currentValue.vatableSales;
                        itm.vatAmount += currentValue.vatAmount;
                        itm.netSalesWVat += currentValue.netSalesWVat;
                        itm.netSalesWoVat += currentValue.netSalesWoVat;

                    }
                    else{
                        accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde] = currentValue
                    }
            
                }
                return accumulator;
            }, {}) 

            console.log("temporary object", tempObj);
        }
            
        if(report.reportRepresentation == "detailed"){
            const date = Object.keys(tempObj)
            let idx = 0;
            date.forEach(dte => {
    
                let firstFlag = true;
    
                const itemClass = Object.keys(tempObj[dte]);
                // const finalY = doc.previousAutoTable.finalY;
    
                let grandTotal = {};
                let grandTotalArray: any = [];
                
                headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Itemized Report - Detailed");
                
                doc.setFontSize(12);
                doc.text2(dte, 16, firstFlag?50:20)

                let finalY = doc.previousAutoTable.finalY;
                const tempBodyToPrint: any[] = [];
                itemClass.forEach(ic => {
                    let subTotal = {};

                    doc.setFontSize(12);
                    tempBodyToPrint.push([
                      { 
                        content: ic, 
                        colSpan: 11, 
                        styles: { 
                          halign: 'center', 
                          fontSize: 16, 
                          fontStyle: "bold", 
                          fillColor: [182, 222, 249]
                        } 
                      }
                    ])
                    
                    const itemSubClass = Object.keys(tempObj[dte][ic]);
                    itemSubClass.forEach(isc => {
    
                        tempBodyToPrint.push([{ content: isc, colSpan: 11, styles: { halign: 'center', fontSize: 14} }])
                        const items = tempObj[dte][ic][isc];
    
                        const convertItems = Object.values(items)
    
                        convertItems.forEach((d: any) => {
                            const formattedValues = Object.values(d).map(val => formatNumberData(val))

                            // Converting the quantity element to a string just to remove the trailing 0.
                            formattedValues[2] = formattedValues[2].toString().split(".")[0]
                            formattedValues.splice(11, formattedValues.length-1);

                            tempBodyToPrint.push(formattedValues);
                            subTotal = sumTableData(d,subTotal);
                        })
    
                    })
    
                    // Implementation of subtotal
                    const subTotalArray: any = Object.values(subTotal).map(val => formatNumberData(val));
                    subTotalArray.unshift("Subtotal")

                    // Converting the quantity element to a string just to remove the trailing 0.
                    subTotalArray[2] = subTotalArray[2].toString().split(".")[0]
    
                    tempBodyToPrint.push(formatTableData(subTotalArray, 2));
    
                    // tableBlock(doc, firstFlag?60:finalY,columnStyles,headers,tempBodyToPrint, false, {halign: 'right'});
                    // tableBlock(doc, 30,columnStyles,headers,tempBodyToPrint);
    
                    // Implementation of grand total
                    grandTotal = sumTableData(subTotal, grandTotal)
    
                    const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));

                    console.log(formattedGrandTotal);

    
                    grandTotalArray = formattedGrandTotal;
                    grandTotalArray.unshift({content: "GRAND TOTAL", styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} })

                    // Converting the quantity element to a string just to remove the trailing 0.
                    grandTotalArray[2] = grandTotalArray[2].toString().split(".")[0]
                    finalY = doc.previousAutoTable.finalY;
                });
                
                doc.setFontSize(18);

                tempBodyToPrint.push([{ content: "", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
                tempBodyToPrint.push([{ content: "GRAND TOTAL", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
                tempBodyToPrint.push(grandTotalArray);
                tableBlock(doc, firstFlag?55:finalY,columnStyles,headers,tempBodyToPrint, false, {halign: 'right'});
                
                idx++;
                firstFlag = false;
                if(idx < date.length)
                  doc.addPage();
    
            });
            
            if (!history || history.length === 0) {
              headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Itemized Report - Detailed");

              const bodyToPrint = [];
              bodyToPrint.push(["N/A", "0.00", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"]);
              bodyToPrint.push([{ content: "", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
              bodyToPrint.push([{ content: "GRAND TOTAL", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
              bodyToPrint.push([{content: "GRAND TOTAL", styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} }, "0.00", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"]);
              tableBlock(doc, 50,columnStyles,headers,bodyToPrint, false, {halign: 'right'});
            }

        }
        else if(report.reportRepresentation == "summarized"){

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Itemized Report - Summarized");

            if (!history || history.length === 0) {
              const bodyToPrint = [];
              bodyToPrint.push(["N/A", "0.00", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"]);
              bodyToPrint.push([{ content: "", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
              bodyToPrint.push([{ content: "GRAND TOTAL", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
              bodyToPrint.push([{content: "GRAND TOTAL", styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} }, "0.00", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"]);
              tableBlock(doc, 50,columnStyles,headers,bodyToPrint, false, {halign: 'right'});
            }
            else {
              const itmclass = Object.keys(tempObj)
              let grandTotal = {};
              let grandTotalArray: any = [];

              let firstFlag = true;
              const tempBodyToPrint: any[] = [];
              let finalY = doc.previousAutoTable.finalY;
              itmclass.forEach((ic: any) => {
      
                  const itemSubclass = Object.keys(tempObj[ic]);
                  
                  doc.setFontSize(12);
                  // doc.text2(dte, 16, firstFlag?50:20)
                  // doc.text2(dte, 16, 20)
                  
                  // const finalY = doc.previousAutoTable.finalY;
                  let subTotal = {};


                  doc.setFontSize(12);
                  tempBodyToPrint.push([
                    { 
                      content: ic, 
                      colSpan: 11, 
                      styles: { 
                        halign: 'center', 
                        fontSize: 16, 
                        fontStyle: "bold", 
                        fillColor: [182, 222, 249]
                      } 
                    }
                  ])
                  // doc.text2(ic, 16, firstFlag?55:25)
      
                  itemSubclass.forEach(isc => {

                      tempBodyToPrint.push([{ content: isc, colSpan: 11, styles: { halign: 'center', fontSize: 14, fontStyle: "bold"} }])
                      const items = tempObj[ic][isc];

                      const convertItems = Object.values(items)

                      convertItems.forEach((d: any) => {
                          const formattedValues = Object.values(d).map(val => formatNumberData(val))

                          
                          // Converting the quantity element to a string just to remove the trailing 0.
                          formattedValues[2] = formattedValues[2].toString().split(".")[0]
                          formattedValues.splice(11, formattedValues.length-1);
                          tempBodyToPrint.push(formattedValues);
                          subTotal = sumTableData(d,subTotal);
                      })
      
                    
                  });

                  // Implementation of subtotal
                  const subTotalArray: any = Object.values(subTotal).map(val => formatNumberData(val));
                  subTotalArray.unshift("Subtotal")
                  
                  // Converting the quantity element to a string just to remove the trailing 0.
                  subTotalArray[2] = subTotalArray[2].toString().split(".")[0]
  
                  tempBodyToPrint.push(formatTableData(subTotalArray, 2));
  
                  // Implementation of grand total
                  grandTotal = sumTableData(subTotal, grandTotal)
                  // doc.addPage();
              });

              const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));

              grandTotalArray = formattedGrandTotal;
              grandTotalArray.unshift({content: "GRAND TOTAL", styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} })

              tempBodyToPrint.push([{ content: "", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
              tempBodyToPrint.push([{ content: "GRAND TOTAL", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
              tempBodyToPrint.push(grandTotalArray);
              tableBlock(doc, firstFlag?55:finalY,columnStyles,headers,tempBodyToPrint, false, {halign: 'right'});

              firstFlag = false;
            }
        }

        MRSaving(report, doc);
    }

    const generateClassAndSubclassReport = (doc: POSPdf, history: any, report: any, ) => {
        let headers: any[] = ["Item Name", "Gross", "Qty", "Vat Adjustment", "Discount", "Vat Exempt Sales", "Vat Exempt Less Discount", "Vatable Sales","Vat Amount","Net Sales w/ Vat", "Net Sales w/o Vat"]

        const columnStyles = {
            0: { cellWidth: 25 },
            1: {cellWidth: 25, halign: "right"},
            2: {cellWidth: 35, halign: "right"},
            3: {cellWidth: 35, halign: "right"},
            4: {cellWidth: 35, halign: "right"},
            5: {cellWidth: 35, halign: "right"},
            6: {cellWidth: 35, halign: "right"},
            7: {cellWidth: 35, halign: "right"},
            8: {cellWidth: 35, halign: "right"},
            9: {cellWidth: 35, halign: "right"},
            10: {cellWidth: 35, halign: "right"},
        };

        let tempObj: any = {}


        if(history){


            const findAllSeparate = history.reduce((acc: any, cur: any) => {

                if(cur.refund ==1)
                  acc.refund.push(cur);
                else
                  acc.nonRefund.push(cur);
          
                return acc;
            }, {refund: [], nonRefund: []});

            const {refund, nonRefund} = findAllSeparate;

            
            const mainPosfile: any[] = [];

            nonRefund.forEach((d: any) => {
                const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);



                let item = {...d};

                if(refundFind){
                    item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
                    console.log("refundFind success", refundFind);
                }
                else{
                    console.log("refundFind failed", item);
                }

                if(item.itmqty != 0)
                    mainPosfile.push(item);
                else{
                    console.log("empty", item);
                }

            });

            history = mainPosfile.map((his: any) => {

                const itemFind = item.data.find((itm: any) => itm.itmcde === his.itmcde)
                const itemClassFind = itemClassification.data.find(is => is.itmclacde === itemFind?.itmclacde)
                const itemSubClassFind = itemSubclassification.data.find(isc => isc.itemsubclasscde === itemFind?.itemsubclasscde)

                const orderitemdiscount = his.orderitemdiscountfiles;
                let govDiscs = 0;
                let overallDiscs = 0;

                if(orderitemdiscount){
                    orderitemdiscount.forEach((d:any) => {

                        console.log("meron bang laman?", d, d.amtdis);
                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            console.log("pumasok ako here hehe");
                            govDiscs+= d.amtdis*1
                        }
                    });

                }

                
                const vatExemptSalesLessDisc = (his.vatexempt*1) - govDiscs;
                const netSalesWOVat = (his.netvatamt*1) +vatExemptSalesLessDisc; 

                return {
                    itemName: itemFind?.itmdsc, 
                    gross: his.untprc*his.itmqty, 
                    qty: his.itmqty*1, 
                    vatadj: his.lessvat*1, 
                    discount: overallDiscs, 
                    vatExemptSales: his.vatexempt*1, 
                    vatExemptLessDisc: (his.vatexempt*1) - (govDiscs), 
                    vatableSales: his.netvatamt*1, 
                    vatAmount:his.vatamt*1,
                    netSalesWVat: his.extprc*1,
                    netSalesWoVat:netSalesWOVat, 
                    trndte: his.trndte, 
                    itmcladsc: itemClassFind?.itmcladsc, 
                    itemsubclassdsc:itemSubClassFind?.itemsubclassdsc,
                    itmcde: his.itmcde, 
                }

            })

            console.log('clean', history);
            

            

            tempObj = history.reduce((accumulator: any = {}, currentValue: any) => {

                // if(!accumulator[currentValue.trndte]){
                //     accumulator[currentValue.trndte] = {}
                // }

                if(!accumulator[currentValue.itmcladsc]){
                    accumulator[currentValue.itmcladsc] = {}
                }

                if(!accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc]){
                    accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc] = {}
                }


                
                if(accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde]){
                    const itm = accumulator
                [currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde]

                    itm.gross += currentValue.gross;
                    itm.qty += currentValue.qty;
                    itm.vatadj += currentValue.vatadj;
                    itm.discount += currentValue.discount;
                    itm.vatExemptSales += currentValue.vatExemptSales;
                    itm.vatExemptLessDisc += currentValue.vatExemptLessDisc;
                    itm.vatableSales += currentValue.vatableSales;
                    itm.vatAmount += currentValue.vatAmount;
                    itm.netSalesWVat += currentValue.netSalesWVat;
                    itm.netSalesWoVat += currentValue.netSalesWoVat;

                }
                else{
                    accumulator[currentValue.itmcladsc][currentValue.itemsubclassdsc][currentValue.itmcde] = currentValue
                }


                return accumulator;
            }, {})                                                                   
        }

        headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Itemclass and Itemsubclass Report");
        if (!history || history.length === 0) {
          const bodyToPrint = [];
          bodyToPrint.push(["N/A", "0.00", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"]);
          bodyToPrint.push(["Subtotal", "0.00", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"]);
          bodyToPrint.push([""]);
          bodyToPrint.push([{ content: "GRAND TOTAL", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
          bodyToPrint.push([{content: "GRAND TOTAL", styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} }, "0.00", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"]);

          tableBlock(doc, 50,columnStyles,headers,bodyToPrint, false, {halign: 'right'});
        }
        else {
          const itemClass = Object.keys(tempObj);
          let grandTotal = {};
          let grandTotalArray: any= [];

          const tempBodyToPrint: any[] = [];
          itemClass.forEach(itmClass => {

              const itemSubClass = Object.keys(tempObj[itmClass]);
              
              let subTotal = {};
              let itemSubclassTotal = {};

              itemSubClass.forEach(is => {
                      
                  let itemSubclassTotal2 = {};

                  tempBodyToPrint.push([
                    { 
                      content: is, 
                      colSpan: 11, 
                      styles: { 
                        halign: 'center', 
                        fontSize: 16, 
                        fontStyle: "bold", 
                        fillColor: [182, 222, 249]
                      } 
                    }
                  ])
                  const items = tempObj[itmClass][is];

                  const convertItems = Object.values(items)

                  convertItems.forEach((d: any) => {
                      itemSubclassTotal = sumTableData(d,itemSubclassTotal);
                      itemSubclassTotal2 = sumTableData(d, itemSubclassTotal2)
                  });

                  const formattedValues = Object.values(itemSubclassTotal2).map((val: any) => formatNumberData(val));
                  // Converting the quantity element to a string just to remove the trailing 0.
                  formattedValues[1] = formattedValues[1].toString().split(".")[0]

                  const itemSubClassArray: any = Object.values(formattedValues);
                  itemSubClassArray.unshift(is)

                  tempBodyToPrint.push(itemSubClassArray);                
              });

              subTotal = sumTableData(itemSubclassTotal,subTotal);

              const subTotalArray: any = Object.values(subTotal).map((val: any) => formatNumberData(val));
              subTotalArray.unshift("Subtotal")

              
              // Converting the quantity element to a string just to remove the trailing 0.
              subTotalArray[2] = subTotalArray[2].toString().split(".")[0]

              tempBodyToPrint.push(formatTableData(subTotalArray, 2));

              grandTotal = sumTableData(subTotal, grandTotal)
              const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));
              grandTotalArray = formattedGrandTotal
              grandTotalArray.unshift({ content: "GRAND TOTAL", styles: { halign: 'left', fontSize: 13, fontStyle: "bold"} })
              
              // Converting the quantity element to a string just to remove the trailing 0.
              grandTotalArray[2] = grandTotalArray[2].toString().split(".")[0]
              // doc.addPage();
          })
              
          doc.setFontSize(18);
          tempBodyToPrint.push([""]);
          tempBodyToPrint.push([{ content: "GRAND TOTAL", colSpan: 11, styles: { halign: 'left', fontSize: 16, fontStyle: "bold"} }]);
          tempBodyToPrint.push(grandTotalArray);

          // GENERATE TABLE
          tableBlock(doc, 60,columnStyles,headers,tempBodyToPrint,true,{halign: 'right'});
        }

        MRSaving(report, doc);
    }

    const generateDailyDineType = (doc: POSPdf, history: any, report: any, ) => {
        let headers: any[] = ["Item Name", "Qty", "Amount", "Vat Adjustment", "Discount", "Total Amount"]
        const columnStyles = {
          0: {cellWidth: 50},
          1: {cellWidth: 50, halign: 'right'},
          2: {cellWidth: 60, halign: 'right'},
          3: {cellWidth: 70, halign: 'right'},
          4: {cellWidth: 70, halign: 'right'},
          5: {cellWidth: 70, halign: 'right'}  
        }
        let tempObj: any = {}

        if(history){

            const findAllSeparate = history.reduce((acc: any, cur: any) => {

                if(cur.refund ==1)
                  acc.refund.push(cur);
                else
                  acc.nonRefund.push(cur);
          
                return acc;
            }, {refund: [], nonRefund: []});

            const {refund, nonRefund} = findAllSeparate;

            
            const mainPosfile: any[] = [];

            nonRefund.forEach((d: any) => {
                const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);



                let item = {...d};

                if(refundFind){
                    item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
                    console.log("refundFind success", refundFind);
                }
                else{
                    console.log("refundFind failed", item);
                }

                if(item.itmqty != 0)
                    mainPosfile.push(item);
                else{
                    console.log("empty", item);
                }

            });

            history = mainPosfile.map((his: any) => {

                const orderitemdiscount = his.orderitemdiscountfiles;
                let govDiscs = 0;
                let overallDiscs = 0;

                if(orderitemdiscount){
                    orderitemdiscount.forEach((d:any) => {

                        console.log("meron bang laman?", d, d.amtdis);
                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            console.log("pumasok ako here hehe");
                            govDiscs+= d.amtdis*1
                        }
                    });

                }

                const itemFind = item.data.find((itm: any) => itm.itmcde === his.itmcde)

                return {
                    itemName: itemFind?.itmdsc, 
                    qty: his.itmqty*1, 
                    amount: his.groext*1, 
                    vatadj: his.lessvat*1, 
                    discount: overallDiscs, 
                    totalAmount: his.extprc*1,
                    itmcde: his.itmcde,
                    orderType: his.ordertyp
                }
            })

            tempObj = history.reduce((accumulator: any = {}, currentValue: any) => {

                if(!accumulator[currentValue.orderType]){
                    accumulator[currentValue.orderType] = {}
                }

                if(!accumulator[currentValue.orderType][currentValue.itmcde]){
                    accumulator[currentValue.orderType][currentValue.itmcde] = {}
                }


                const dailyDineTypeRecord = sumTableDailyDineType(currentValue, accumulator[currentValue.orderType][currentValue.itmcde]);


                accumulator[currentValue.orderType][currentValue.itmcde] = dailyDineTypeRecord;

                return accumulator;
            }, {}) 

        }

        // const reportHeader = "Sales Report Dine Type"
        // const center = (doc.internal.pageSize.getWidth() - doc.getTextWidth(reportHeader))/2;
        
        let grandTotal = {};
        let grandTotalArray: any= [];

        const orderTypeKeys = Object.keys(tempObj);
        // const orderTypeValue = Object.keys(tempObj);
        
        // doc.setFontSize(14);
        // doc.text2(header.data[0].comdsc || "", 16, 10)
        
        doc.setFontSize(8);
        headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Sales Report Dine Type");

        if (!history || history.length === 0) {
          const bodyToPrint = [];
          bodyToPrint.push(["N/A", "0", "0.00", "0.00", "0.00", "0.00"]);
          bodyToPrint.push(["Subtotal", "0", "0.00", "0.00", "0.00", "0.00"]);
          bodyToPrint.push(["Grand Total", "0", "0.00", "0.00", "0.00", "0.00"]);

          // tableBlock(doc, 50,columnStyles,headers,bodyToPrint, false, {halign: 'right'});
          autoTable(doc, {
              startY: 50,
              styles: {overflow: 'linebreak', cellWidth: 'wrap'},
              columnStyles : columnStyles as any,
              head: [headers],
              body:bodyToPrint,
              headStyles: {halign: 'right'},
              didParseCell: function(data: any) {

                  const {table, row, cell} = data;

                  if(row.index === table.body.length - 1){
                      cell.styles.fontStyle = 'bold';
                      cell.styles.fontSize = 12; // Set the font size for the last row

                  }
              },
              willDrawPage: (data) => {
      
                  const {table} = data;
      
                  table.head[0].cells[0].styles.halign = "left";
      
              }
          })
        }
        else {
          let firstFlag = true;
        
          let idx = 0;
          orderTypeKeys.forEach(orderT => {
              
              let bodyToPrint:any = [];
              let subtotal = {};

              const dailySalesReportKeys = Object.keys(tempObj[orderT]);

              bodyToPrint.push([{ content: orderT, colSpan: 6, styles: { halign: 'center', fontSize: 14, fontStyle: "bold"} }])

              dailySalesReportKeys.forEach((d:any) => {
                  const dailySalesReport = tempObj[orderT][d];
                  // const toArray = Object.values(dailySalesReport);
                  const formattedValues = Object.values(dailySalesReport).map((val: any) => formatNumberData(val));

                  
                  // Converting the quantity element to a string just to remove the trailing 0.
                  formattedValues[1] = formattedValues[1].toString().split(".")[0]

                  bodyToPrint.push(formattedValues);
                  subtotal = sumTableDailyDineType(dailySalesReport,subtotal);
              });
              
              const printSubtotal = Object.values(subtotal).map(val => formatNumberData(val));
              printSubtotal[0]= "Subtotal"
              
              // Converting the quantity element to a string just to remove the trailing 0.
              printSubtotal[1] = printSubtotal[1].toString().split(".")[0]
              bodyToPrint.push(printSubtotal);

              grandTotal = sumTableDailyDineType(subtotal,grandTotal);
              const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));
              
              // Converting the quantity element to a string just to remove the trailing 0.
              formattedGrandTotal[1] = formattedGrandTotal[1].toString().split(".")[0]
              grandTotalArray = formattedGrandTotal;
              grandTotalArray[0] = "Grand Total"
              bodyToPrint.push(grandTotalArray);

              doc.autoTableCSVTextBody(headers, bodyToPrint);
              autoTable(doc, {
                  startY: firstFlag?50:20,
                  styles: {overflow: 'linebreak', cellWidth: 'wrap'},
                  columnStyles : columnStyles as any,
                  head: [headers],
                  body:bodyToPrint,
                  headStyles: {halign: 'right'},
                  didParseCell: function(data: any) {

                      const {table, row, cell} = data;

                      if(row.index === table.body.length - 1){
                          cell.styles.fontStyle = 'bold';
                          cell.styles.fontSize = 12; // Set the font size for the last row

                      }
                  },
                  willDrawPage: (data) => {
          
                      const {table} = data;
          
                      table.head[0].cells[0].styles.halign = "left";
          
                  }
              })

              firstFlag = false;
              idx++;

              if (idx < orderTypeKeys.length)
                doc.addPage();
          });
        }

        // doc.setFontSize(12);
        // doc.text2(reportHeader, center, 40)

        // adjusted sa taas yung grand total
        // autoTable(doc, {
        //     startY: firstFlag?45:20,
        //     styles: {overflow: 'linebreak', cellWidth: 'wrap'},
        //     columnStyles : {
        //         0: {cellWidth: 50},
        //         1: {cellWidth: 50, halign: 'right'},
        //         2: {cellWidth: 60, halign: 'right'},
        //         3: {cellWidth: 70, halign: 'right'},
        //         4: {cellWidth: 70, halign: 'right'},
        //         5: {cellWidth: 70, halign: 'right'}  
        //     },
        //     head: [headers],
        //     body:[grandTotalArray],
        //     headStyles: {halign: 'right'},
        //     didParseCell: function(data: any) {

        //         const {table, row, cell} = data;

        //         if(row.index === table.body.length - 1){
        //             cell.styles.fontStyle = 'bold';
        //         }
        //     },
        //     willDrawPage: (data) => {
    
        //         const {table} = data;
    
        //         table.head[0].cells[0].styles.halign = "left";
    
        //     }
        // })
        MRSaving(report, doc);
    }

    const generateVoidTransactions = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = ["Date/Time", syspar.data[0].receipt_title?"OR #":"Invoice #", "Gross", "Net", "Reason"]
        let tempObj: any = {}

        if(history){

            history = history.map((his: any) => {

                return {
                    dateTime: his.trndte + " " + his.logtim,
                    ordocnum: receiptDefiner(syspar.data[0].receipt_title || 0,his.ordocnum),
                    gross: his.groext*1,
                    net: his.extprc*1,
                    reason: his.voidreason
                }
            })

            tempObj = history.reduce((accumulator: any = {}, currentValue: any) => {

                if(!accumulator[currentValue.ordocnum]){
                    accumulator[currentValue.ordocnum] = currentValue;
                }
                else{
                    
                    const voidTran = accumulator[currentValue.ordocnum];
                    voidTran.gross +=currentValue.gross
                    voidTran.net +=currentValue.net
                }

                return accumulator;
            }, {}) 

        }

        const voidTransactionKey = Object.keys(tempObj);
        headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Post Void Transactions Report");
        if (!history || history.length === 0) {
          const bodyToPrint = [];
          bodyToPrint.push(["N/A", "N/A", "0.00", "0.00", "N/A"]);
          bodyToPrint.push(["Grand Total", null, "0.00", "0.00", null]);
          doc.autoTableCSVTextBody(headers, bodyToPrint);
          autoTable(doc, {
              startY: 50,
              styles: {overflow: 'linebreak', cellWidth: 'wrap'},
              columnStyles : {
                  0: {cellWidth: 'auto'},
                  1: {cellWidth: 'auto'},
                  2: {cellWidth: 'auto'},
                  3: {cellWidth: 'auto'},
                  4: {cellWidth: 'auto'}
              },
              head: [headers],
              body:bodyToPrint,
              didParseCell: function(data: any) {

                  const {table, row, cell} = data;

                  if(row.index === table.body.length - 1){
                      cell.styles.fontStyle = 'bold';
                  }
              }
          })
        }
        else {
          let firstFlag = true;
          let grandTotal:any = {};
          const bodyToPrint: any = [];

          voidTransactionKey.forEach(d=> {
              const or = tempObj[d];

              const grandTotalLength = Object.keys(grandTotal).length;

              if(grandTotalLength == 0){
                  grandTotal = or;
              }
              else{
                  grandTotal.net += or.net;
                  grandTotal.gross += or.gross;
              }

              const formattedValues = Object.values(or).map((val: any) => formatNumberData(val))

              bodyToPrint.push(formattedValues);
          });
          
          const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val)).slice(0,4);
          
          const grandTotalArray = formattedGrandTotal;
          grandTotalArray[0] = "Grand Total"
          grandTotalArray[1] = ""
          bodyToPrint.push(grandTotalArray);

          doc.autoTableCSVTextBody(headers, bodyToPrint);
          autoTable(doc, {
              startY: firstFlag?50:20,
              styles: {overflow: 'linebreak', cellWidth: 'wrap'},
              columnStyles : {
                  0: {cellWidth: 'auto'},
                  1: {cellWidth: 'auto'},
                  2: {cellWidth: 'auto'},
                  3: {cellWidth: 'auto'},
                  4: {cellWidth: 'auto'}
              },
              head: [headers],
              body:bodyToPrint,
              didParseCell: function(data: any) {

                  const {table, row, cell} = data;

                  if(row.index === table.body.length - 1){
                      cell.styles.fontStyle = 'bold';
                  }
              }
          })
        }

        MRSaving(report, doc);
    }

    const generateHourlySales = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = ["Order type", "Qty", "Amount", "Vat Adjustment", "Discount", "Total Amount"]

        if(history){

            const findAllSeparate = history.reduce((acc: any, cur: any) => {

                if(cur.refund ==1)
                  acc.refund.push(cur);
                else
                  acc.nonRefund.push(cur);
          
                return acc;
            }, {refund: [], nonRefund: []});

            const {refund, nonRefund} = findAllSeparate;

            
            const mainPosfile: any[] = [];

            nonRefund.forEach((d: any) => {
                const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);



                let item = {...d};

                if(refundFind){
                    item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
                    console.log("refundFind success", refundFind);
                }
                else{
                    console.log("refundFind failed", item);
                }

                if(item.itmqty != 0)
                    mainPosfile.push(item);
                else{
                    console.log("empty", item);
                }

            });


            history = mainPosfile.map((his: any) => {


                const orderitemdiscount = his.orderitemdiscountfiles;

                let govDiscs = 0;
                let overallDiscs = 0;

                if(orderitemdiscount){
                    orderitemdiscount.forEach((d:any) => {

                        console.log("meron bang laman?", d, d.amtdis);
                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            console.log("pumasok ako here hehe");
                            govDiscs+= d.amtdis*1
                        }
                    });

                }

                return {
                    orderType: his.ordertyp,
                    qty: his.itmqty*1, 
                    amount: his.groext*1, 
                    vatadj: his.lessvat*1, 
                    discount: overallDiscs, 
                    totalAmount: his.extprc*1,
                    itmcde: his.itmcde,
                    logtim: his.logtim
                }
            })

            const groupedData = groupDataIntoIntervals(history);

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Hourly Sales Report");
            
            let firstFlag = true;

            let bodyToPrint: any = [];

            let grandTotal:any = {
                qty: 0, amount: 0, vatadj: 0, discount: 0, totalAmount: 0 
            };


            groupedData.forEach((value, key) => {

                const dineInSum = value.reduce((acc, obj) => {

                    if(obj.orderType == "DINEIN"){

                        acc.qty += obj.qty;
                        acc.amount += obj.amount;
                        acc.vatadj += obj.vatadj;
                        acc.discount += obj.discount;
                        acc.totalAmount += obj.totalAmount;

                    }
                    return acc;
                }, { qty: 0, amount: 0, vatadj: 0, discount: 0, totalAmount: 0 });

                const takeoutSum =  value.reduce((acc, obj) => {

                    if(obj.orderType == "TAKEOUT"){

                        acc.qty += obj.qty;
                        acc.amount += obj.amount;
                        acc.vatadj += obj.vatadj;
                        acc.discount += obj.discount;
                        acc.totalAmount += obj.totalAmount;

                    }
                    return acc;
                }, { qty: 0, amount: 0, vatadj: 0, discount: 0, totalAmount: 0 });

                

                grandTotal.qty +=takeoutSum.qty + dineInSum.qty
                grandTotal.amount += takeoutSum.amount + dineInSum.amount;
                grandTotal.vatadj += takeoutSum.vatadj + dineInSum.vatadj;
                grandTotal.discount += takeoutSum.discount + dineInSum.discount;
                grandTotal.totalAmount += takeoutSum.totalAmount + dineInSum.totalAmount;

                

                bodyToPrint.push([{ content: key, colSpan: 6, styles: { halign: 'left', fontSize: 12, fontStyle: "bold"} }])

                const takeoutValues = Object.values(takeoutSum).map((val: any) => formatNumberData(val));
                const dineinValues = Object.values(dineInSum).map((val: any) => formatNumberData(val));

                
                // Converting the quantity element to a string just to remove the trailing 0.
                takeoutValues[0] = takeoutValues[0].toString().split(".")[0]
                
                // Converting the quantity element to a string just to remove the trailing 0.
                dineinValues[0] = dineinValues[0].toString().split(".")[0]

                takeoutValues.unshift("TAKEOUT")
                dineinValues.unshift("DINEIN")

                bodyToPrint.push(dineinValues);
                bodyToPrint.push(takeoutValues);

            })

            

            const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));
            const grandTotalArray = formattedGrandTotal as any[];
            grandTotalArray.unshift({ content: "GRAND TOTAL", styles: { halign: 'left', fontSize: 12, fontStyle: "bold"}})

        
            // Converting the quantity element to a string just to remove the trailing 0.
            grandTotalArray[1] = grandTotalArray[1].toString().split(".")[0]
            bodyToPrint.push(formatTableData(grandTotalArray, 0));

            doc.autoTableCSVTextBody(headers, bodyToPrint);
            autoTable(doc, {
                startY: firstFlag?50:20,
                styles: {overflow: 'linebreak', cellWidth: 'wrap'},
                columnStyles : {
                    0: {cellWidth: 'auto', halign: 'right'},
                    1: {cellWidth: 'auto', halign: 'right'},
                    2: {cellWidth: 'auto', halign: 'right'},
                    3: {cellWidth: 'auto', halign: 'right'},
                    4: {cellWidth: 'auto', halign: 'right'},
                    5: {cellWidth: 'auto', halign: 'right'}
                },
                head: [headers],
                body:bodyToPrint,
                didParseCell: function(data: any) {

                const {table, row, cell, /*column*/} = data;

                    if(row.index === table.body.length - 1){
                        cell.styles.fontStyle = 'bold';
                    }
                },
                headStyles: {
                    valign: 'middle',
                    halign : 'right'
                }
            })

            MRSaving(report, doc);

        }

    }

    const generateRefundByDate = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = ["Refund. Date/Time", "Tran. Date/Time", "Customer", syspar.data[0].receipt_title ==0?"OR#":"Invoice#", syspar.data[0].receipt_title ==0?"OR Amount":"INV Amount", "Refund Amount", "Reason", "Payment", "Cashier"]

        const columnStyles = {
            0: {cellWidth: 'auto'},
            1: {cellWidth: 'auto'},
            2: {cellWidth: 'auto'},
            3: {cellWidth: 'auto'},
            4: {cellWidth: 'auto'},
            5: {cellWidth: 'auto'},
            6: {cellWidth: 'auto'},
            7: {cellWidth: 'auto'},
            8: {cellWidth: 'auto'},
        }
        const totalByPayment: any = {};

        if(history){

            history = history.map((his: any) => {


                const findHistory = history.find((d: any) => d.ordocnum == his.ordocnum && d.postrntyp == "PAYMENT");

                return {
                    refundDateTime: his.refunddte + " " + his.refundlogtim,
                    tranDateTime: his.trndte + " " + his.logtim, 
                    customer: "WALK-IN", 
                    ordocnum: receiptDefiner(syspar.data[0].receipt_title || 0,his.ordocnum), 
                    orAmount: findHistory.extprc*1, 
                    refundAmount: his.extprc*1 + his.scharge*1 - his.scharge_disc*1,
                    reason: his.refundreason,
                    transactionType: findHistory.itmcde,
                    cashier: his.cashier,
                    itmcde: his.itmcde,
                    trndte: his.trndte,
                    extprc: his.extprc,
                    postrntyp: his.postrntyp
                }
            });

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Refund By Date Report");
            let bodyToPrint: any = [];
            if (history.length === 0) {
              bodyToPrint.push(["N/A", "N/A", "N/A", "N/A", "0.00       ", "0.00        ", "N/A", "N/A", "N/A"]);
              bodyToPrint.push(["Subtotal", "", "", "", "", "0.00       ", "", "", ""]);
              bodyToPrint.push(["GRANDTOTAL", "", "", "", "", "0.00       ", "", "", ""]);
              tableBlock(doc, 60, columnStyles, headers, bodyToPrint);
              doc.text2("SUMMARY", 16, doc.previousAutoTable.finalY+ 30); 
              doc.text2("N/A", 16, doc.previousAutoTable.finalY+35)
              doc.text2("0.00", 50, doc.previousAutoTable.finalY+35)
            }
            else {
              history = history.reduce((acc:any, cur:any) => {

                  if(!acc[cur.trndte]){
                      acc[cur.trndte] = {};
                      totalByPayment[cur.transactionType] = 0;
                  }

                  if(cur.postrntyp == "ITEM"){
                      if (!totalByPayment[cur.transactionType]) {
                        totalByPayment[cur.transactionType] = 0;
                      }

                      totalByPayment[cur.transactionType] += cur.refundAmount; //cur.extprc*1;

                  }


                  if(acc[cur.trndte][cur.ordocnum]){

                      let currentOrdocnum = acc[cur.trndte][cur.ordocnum]

                      if(cur.postrntyp === "PAYMENT"){

                          if(!cur.itemcde)
                              currentOrdocnum.paymentType = cur.transactionType;

                          return acc;
                      }

                      

                      currentOrdocnum.orAmount = cur.orAmount;
                      currentOrdocnum.refundAmount += cur.refundAmount;

                  }
                  else{
                      const currentDoc:any = acc[cur.trndte][cur.ordocnum] = {};

                      currentDoc.refundDateTime = cur.refundDateTime;
                      currentDoc.tranDateTime = cur.tranDateTime;
                      currentDoc.customer = cur.customer;
                      currentDoc.ordocnum = cur.ordocnum;
                      currentDoc.orAmount = cur.orAmount;
                      currentDoc.refundAmount = cur.refundAmount;
                      currentDoc.reason = cur.reason;
                      currentDoc.postrntyp = cur.transactionType;
                      currentDoc.cashier = cur.cashier;
                      currentDoc.trndte = cur.trndte;
                  }

                  return acc;

              }, {})
              
              const dateGrouped = Object.keys(history);

              let grandTotal: any = {
                  refundDateTime:"",tranDateTime: "", customer: "", ordocnum: "",  orAmount: 0 , refundAmount:0, reason: ""
              };

              dateGrouped.forEach(dte => {

                  // Initialize subtotal
                  let subTotal: any = {refundDateTime:"",tranDateTime: "", customer: "", ordocnum: "",  orAmount: 0, refundAmount: 0, reason: ""}
                  //COLSPAN WITH DATE
                  bodyToPrint.push([{ content: dte, colSpan: 9, styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} }]);

                  const orDocsArray = Object.values(history[dte]);

                  orDocsArray.forEach((oda: any) => {
                      

                      const formattedValue = Object.values(oda).map((val: any) => formatNumberData(val));
                      formattedValue.splice(9);
                      // main array of refund data
                      bodyToPrint.push(formattedValue);
                      
                      subTotal = {refundDateTime:"",tranDateTime: "", customer: "", ordocnum: "",  orAmount: subTotal.orAmount +=oda.orAmount, refundAmount: subTotal.refundAmount +=oda.refundAmount, reason: ""}
                      
                  })

                  const subTotalArray = Object.values(subTotal).map((val: any) => formatNumberData(val));
                  subTotalArray[0] = "Subtotal"
                  bodyToPrint.push(subTotalArray);

                  grandTotal =  {...grandTotal, orAmount: grandTotal.orAmount +=subTotal.orAmount, refundAmount: grandTotal.refundAmount +=subTotal.refundAmount, reason: ""}


              });

              
              const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));
              const grandTotalArray = formattedGrandTotal;
              grandTotalArray[0] = "GRANDTOTAL";
              
              bodyToPrint.push(grandTotalArray);

              tableBlock(doc,60, columnStyles, headers, bodyToPrint);

              const paymentValues = Object.keys(totalByPayment);

              let y = doc.previousAutoTable.finalY+ 30;
              doc.text2("SUMMARY", 16, y); 

              paymentValues.forEach((d: any) => {
                  let addedY = y += 5
                  
                  doc.text2(d, 16, addedY)
                  doc.text2(formatNumberData(parseFloat(totalByPayment[d])), 50, addedY)
              })
            }
            // titleBlock(doc,"Post Refund Transactions" ,40)

            MRSaving(report, doc);
        }
    }

    const generateRefundByPayment = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = ["Refund. Date/Time", "Tran. Date/Time", "Customer", syspar.data[0].receipt_title == 0?"OR#":"Invoice#", syspar.data[0].receipt_title == 0?"OR Amount":"INV Amount", "Refund Amount", "Reason", "Payment", "Cashier"];

        const columnStyles = {
            0: {cellWidth: 'auto'},
            1: {cellWidth: 'auto'},
            2: {cellWidth: 'auto'},
            3: {cellWidth: 'auto'},
            4: {cellWidth: 'auto', halign: 'right'},
            5: {cellWidth: 'auto', halign: 'right'},
            6: {cellWidth: 'auto'},
            7: {cellWidth: 'auto'},
            8: {cellWidth: 'auto'},
        }
        
        const totalByPayment: any = {};

        if(history){
            history = history.map((his: any) => {
                
                const findHistory = history.find((d: any) => d.ordocnum == his.ordocnum && d.postrntyp == "PAYMENT");

                return {
                    refundDateTime: his.refunddte + " " + his.refundlogtim,
                    tranDateTime: his.trndte + " " + his.logtim, 
                    customer: "WALK-IN", 
                    ordocnum: receiptDefiner(syspar.data[0].receipt_title || 0,his.ordocnum), 
                    orAmount: findHistory.extprc*1, 
                    refundAmount: his.extprc*1 + his.scharge*1 - his.scharge_disc*1,
                    reason: his.refundreason,
                    // paymentType: his.logtim,
                    transactionType: findHistory.itmcde,
                    cashier: his.cashier,
                    itmcde: his.itmcde,
                    trndte: his.trndte,
                    extprc: his.extprc*1,
                    postrntyp: his.postrntyp
                }
            });

            console.log(history);

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Refund By Payment Report");
            let bodyToPrint: any = [];
            if (history.length === 0) {
              bodyToPrint.push(["N/A", "N/A", "N/A", "N/A", "0.00       ", "0.00        ", "N/A", "N/A", "N/A"]);
              bodyToPrint.push(["Subtotal", "", "", "", "", "0.00       ", "", "", ""]);
              bodyToPrint.push(["GRANDTOTAL", "", "", "", "", "0.00       ", "", "", ""]);
              tableBlock(doc, 60, columnStyles, headers, bodyToPrint);
              doc.text2("SUMMARY", 16, doc.previousAutoTable.finalY+ 30); 
              doc.text2("N/A", 16, doc.previousAutoTable.finalY+35)
              doc.text2("0.00", 50, doc.previousAutoTable.finalY+35)
            }
            else {
              history = history.reduce((acc:any, cur:any) => {

                  if(!acc[cur.transactionType]){
                      acc[cur.transactionType] = [];
                      totalByPayment[cur.transactionType] = 0;
                  }

                  if(cur.postrntyp == "ITEM"){
                      acc[cur.transactionType].push(cur);
                      totalByPayment[cur.transactionType] += cur.refundAmount; //cur.extprc
                  }

                  return acc;

              }, {})

              const paymentGrouped = Object.keys(history);

              let grandTotal: any = {
                  refundDateTime:"",tranDateTime: "", customer: "", ordocnum: "",  orAmount: "" , refundAmount:0, reason: ""
              };

              paymentGrouped.forEach(dte => {

                  let subTotal: any ={refundDateTime:"",tranDateTime: "", customer: "", ordocnum: "",  orAmount: 0, refundAmount: 0, reason: ""}
                  //COLSPAN WITH DATE
                  bodyToPrint.push([{ content: dte, colSpan: 9, styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} }]);

                  const orDocsArray = history[dte];
                  console.log(orDocsArray);
                  orDocsArray.forEach((oda: any) => {

                      console.log("odaaa", oda);

                      const formattedValue = Object.values(oda).map((val: any) => formatNumberData(val));
                      formattedValue.splice(9);
                      // main array of refund data
                      bodyToPrint.push(formattedValue);
                      
                      subTotal = {refundDateTime:"",tranDateTime: "", customer: "", ordocnum: "",  orAmount: "", refundAmount: subTotal.refundAmount +=oda.refundAmount, reason: ""}

                      console.log("Sumatutal pero sub", subTotal);
                      
                  })

                  const subTotalArray = Object.values(subTotal).map((val: any) => formatNumberData(val));
                  subTotalArray[0] = "Subtotal"
                  bodyToPrint.push(subTotalArray);

                  grandTotal =  {...grandTotal, orAmount: "", refundAmount: grandTotal.refundAmount +=subTotal.refundAmount, reason: ""}


              });

              const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));
              const grandTotalArray = formattedGrandTotal;
              grandTotalArray[0] = "GRANDTOTAL";
              
              bodyToPrint.push(grandTotalArray);

              tableBlock(doc,60, columnStyles, headers, bodyToPrint);

              const paymentValues = Object.keys(totalByPayment);
              console.log(paymentValues);

              let y = doc.previousAutoTable.finalY+ 30;
              doc.text2("SUMMARY", 16, y); 

              console.log(totalByPayment, paymentValues);

              paymentValues.forEach((d: any) => {
                  let addedY = y += 5
                  doc.text2(d, 16, addedY)
                  doc.text2(formatNumberData(parseFloat(totalByPayment[d])), 50, addedY)
              })
            }

            // titleBlock(doc,"Post Refund Transactions" , 40)
          
        MRSaving(report, doc);

        }

    }

    const generateRefundTransactions = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = ["Refund. Date/Time", "Tran. Date/Time", "Customer", "Item",syspar.data[0].receipt_title == 0?"Invoice#":"OR#", "Gross"];

        const columnStyles = {
            0: {cellWidth: 'auto', halign: 'right'},
            1: {cellWidth: 'auto', halign: 'right'},
            2: {cellWidth: 'auto', halign: 'right'},
            3: {cellWidth: 'auto', halign: 'right'},
            4: {cellWidth: 'auto', halign: 'right'},
            5: {cellWidth: 'auto', halign: 'right'},
        }

        if(history){

            history = history.map((his: any) => {

                return {
                    refundDateTime: his.refunddte + " " + his.refundlogtim,
                    tranDateTime: his.trndte + " " + his.logtim, 
                    customer: "WALK-IN",
                    itmdsc: his.itmdsc, 
                    ordocnum: receiptDefiner(syspar.data[0].receipt_title || 0,his.ordocnum),
                    gross: his.extprc*1 + his.scharge*1 - his.scharge_disc*1,
                    transactionType: his.itmcde
                }
            });

            console.log(history);

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Refund Transactions Report");
            let bodyToPrint: any = [];
            if (history.length === 0) {
              bodyToPrint.push([{ content: "N/A", styles: { halign: 'left'} }, "N/A", "N/A", "N/A", "N/A", "0.00"]);
              bodyToPrint.push([{ content: "Grand Total: 0.00", colSpan: 6, styles: { halign: 'right', fontSize: 14, fontStyle: "bold"} }])
              tableBlock(doc,60, columnStyles, headers, bodyToPrint, false, {
                  valign: 'middle',
                  halign : 'right'
              });
            }
            else {
              let grandTotal: number = 0;

              history.forEach((d: any) => {
                  const refundValues = Object.values(d).map((val:any) => formatNumberData(val));
                  grandTotal += d.gross;

                  bodyToPrint.push(refundValues);
              });
              
              bodyToPrint.push([{ content: "Grand Total: "+ formatNumberData(grandTotal), colSpan: 6, styles: { halign: 'right', fontSize: 14, fontStyle: "bold"} }])

              
              tableBlock(doc,60, columnStyles, headers, bodyToPrint, false, {
                  valign: 'middle',
                  halign : 'right'
              });
            }
           
            MRSaving(report, doc);
        }

    }

    const generatePerDayHourly = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = ["Day type", "# of trans", "Total sales charge", "Vat adjustment", "Government discount", "Reg discount", "Total items sales Amount"]

        const columnStyles = {
            0: {cellWidth: 'auto'},
            1: {cellWidth: 'auto', halign: 'right'},
            2: {cellWidth: 'auto', halign: 'right'},
            3: {cellWidth: 'auto', halign: 'right'},
            4: {cellWidth: 'auto', halign: 'right'},
            5: {cellWidth: 'auto', halign: 'right'},
            6: {cellWidth: 'auto', halign: 'right'},
            7: {cellWidth: 'auto', halign: 'right'},
        }

        if(history){

            const itemTransaction = history.filter((d: any) => d.postrntyp == "ITEM");
            const totalTransaction = history.filter((d: any) => d.postrntyp == "TOTAL" && d.refund==0);

            const findAllSeparate = itemTransaction.reduce((acc: any, cur: any) => {

                if(cur.refund ==1)
                  acc.refund.push(cur);
                else
                  acc.nonRefund.push(cur);
          
                return acc;
            }, {refund: [], nonRefund: []});

            const {refund, nonRefund} = findAllSeparate;
            
            const mainPosfile: any[] = [];

            nonRefund.forEach((d: any) => {
                const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);

                let item = {...d};

                if(refundFind){
                    item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
                    console.log("refundFind success", refundFind);
                }
                else{
                    console.log("refundFind failed", item);
                }

                if(item.itmqty != 0)
                    mainPosfile.push(item);
                else{
                    console.log("empty", item);
                }

            });

            history = itemTransaction.map((his: any) => {

                const orderitemdiscount = his.orderitemdiscountfiles;
                const findTotalTrntyp = totalTransaction.find((trn: any) => trn.ordocnum === his.ordocnum)

                console.log('ben 10', findTotalTrntyp);
                
                

                let govDiscs = 0;
                let overallDiscs = 0;
                let realGovDiscs = 0;

                if(orderitemdiscount){

                    console.log('dito may laman', orderitemdiscount);
                    

                    orderitemdiscount.forEach((d:any) => {

                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            govDiscs+= d.amtdis*1
                        }

                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat" || d.discde == "Athlete" || d.discde == "MOV"){
                            realGovDiscs+=d.amtdis*1;
                        }

                    });

                }

                // noOfTrans = totalTransaction.length

                return {
                    dayType: new Date(his.trndte).toLocaleString('en-us', {  weekday: 'long' }),
                    noOfTrans: totalTransaction.length, 
                    totalSalesCharge: his.groext*1, 
                    vatadj: his.lessvat*1, 
                    govDiscount: realGovDiscs, 
                    regDiscount: overallDiscs - realGovDiscs,
                    totalItemSales: his.extprc*1,
                    // logtim: his.logtim,
                    logtim: findTotalTrntyp.logtim,
                    trndte: his.trndte,
                    ordocnum: his.ordocnum

                }
            });

            const reducedHistory = history.reduce((acc: any, current: any) => {
                if(!acc[current.dayType])
                    acc[current.dayType] = [];
                
                acc[current.dayType].push(current);
                return acc;

            },{Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []});

            const fromDate = new Date(report.from);
            const toDate = new Date(report.to);
            const selDays = [] as string[];
            const weekdayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };

            while (fromDate <= toDate) {
                selDays.push(fromDate.toLocaleString('en-us', weekdayOptions));
                fromDate.setDate(fromDate.getDate() + 1);  // Increment date by one day
            }

            // Generate the keys as array from reduced history
            const reducedHistoryKeys = Object.keys(reducedHistory).filter((d: any) => selDays.includes(d));
            const bodyToPrint: any = [];

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Sales Report Per Day / Hour");

            // titleBlock(doc,"Sales report per Day / Hour" ,40)

            // Declaration of grandtotal
            const grandTotal =  {
                noOfTrans: 0,
                totalSalesCharge: 0,
                vatadj: 0,
                govDiscount: 0,
                regDiscount: 0,
                totalItemSales: 0,
            };


            // Traverse through the reduced history for dates
            reducedHistoryKeys.forEach(rh => {

                // Declaration of subtotal
                const subTotal =  {
                    noOfTrans: 0,
                    totalSalesCharge: 0,
                    vatadj: 0,
                    govDiscount: 0,
                    regDiscount: 0,
                    totalItemSales: 0,
                };

                // Get the data from the history through indexing and group the data in hours of a day per loop
                console.log('oras', reducedHistory[rh]);
                
                const groupedData = groupDataIntoIntervals(reducedHistory[rh]);
                console.log('wat is dis', groupedData);

                // Convert the trndte into day like 'Monday', 'Tuesday' and so on
                const dateToDay = rh


                // Initialize the day and push the data to bodyToPrint
                // Use a colspan because it is the label for that day.
                bodyToPrint.push([{ content: dateToDay, colSpan:8, styles: { halign: 'left', fontSize: 14, fontStyle: "bold"} }]);

                

                // Loop the grouped data by day in date and ready to print it.
                groupedData.forEach((value: any, key: any) => {

                    // Initial object for reducing on the summation
                    const initialObj = {
                        noOfTrans: 0,
                        totalSalesCharge: 0,
                        vatadj: 0,
                        govDiscount: 0,
                        regDiscount: 0,
                        totalItemSales: 0,
                    };

                    const findTotal: any = {}
                    console.log("value", value);

                    // Reduce the array of objects for the summation per day.

                    
                    const sumPerDay = value.reduce((acc: any, cur: any) => {

                        const findT = mainPosfile.find((d: any) => d.ordocnum == cur.ordocnum);
                        if(findT){
                            findTotal[findT.ordocnum] = findT;
                        }

                        console.log("ft", findTotal);
                        console.log("haba", Object.values(findTotal).length);


                        acc.totalSalesCharge += cur.totalSalesCharge
                        acc.vatadj += cur.vatadj
                        acc.govDiscount += cur.govDiscount
                        acc.regDiscount +=cur.regDiscount
                        acc.totalItemSales += cur.totalItemSales
                        acc.noOfTrans = Object.values(findTotal).length

                        // For subtotal
                        subTotal.totalSalesCharge +=cur.totalSalesCharge,
                        subTotal.vatadj += cur.vatadj,
                        subTotal.govDiscount += cur.govDiscount,
                        subTotal.regDiscount += cur.regDiscount,
                        subTotal.totalItemSales += cur.totalItemSales
                        return acc;

                    }, initialObj);

                    console.log('lapit na', sumPerDay);
                    
                    subTotal.noOfTrans+=sumPerDay.noOfTrans

                    console.log("subtotal", subTotal);

                    
                    
                    
                    // Make the object an array because only array is accepted in autotable
                    const sumPerDayAsArray = Object.values(sumPerDay).map((val: any) => formatNumberData(val));
                    console.log('tanggal', sumPerDayAsArray);
                    
                    sumPerDayAsArray.unshift(key);
                    
                    // Converting the quantity element to a string just to remove the trailing 0.
                    sumPerDayAsArray[1] = sumPerDayAsArray[1].toString().split(".")[0]
                    

                    bodyToPrint.push(sumPerDayAsArray);
                    

                    
                });
                
                //Subtotal
                const subTotalArray: any = Object.values(subTotal).map((val: any) => formatNumberData(val));

                
                subTotalArray.unshift("Subtotal")

                // Converting the quantity element to a string just to remove the trailing 0.
                subTotalArray[1] = subTotalArray[1].toString().split(".")[0]

                bodyToPrint.push(subTotalArray)

                // Adding an empty row for space
                bodyToPrint.push([]);

                grandTotal.totalSalesCharge +=subTotal.totalSalesCharge,
                grandTotal.vatadj += subTotal.vatadj,
                grandTotal.govDiscount += subTotal.govDiscount,
                grandTotal.regDiscount += subTotal.regDiscount,
                grandTotal.totalItemSales += subTotal.totalItemSales,
                grandTotal.noOfTrans += subTotal.noOfTrans

                console.log(bodyToPrint);

            });

            // Putting the print in the end because it is the grandtotal
            const formattedGrandTotal = Object.values(grandTotal).map(val => formatNumberData(val));

            
            const grandTotalArray: any = formattedGrandTotal;
            
            grandTotalArray.unshift("Grandtotal")
            // Converting the quantity element to a string just to remove the trailing 0.
            grandTotalArray[1] = grandTotalArray[1].toString().split(".")[0]
            bodyToPrint.push(grandTotalArray)
        
            // (doc: any, startY: number, columnStyles: any, headers: any[], body: any[], isLastRowBold?: boolean, headStyles?: any, isFirstColOnlyLeft?: boolean)
            tableBlock(doc, 60, columnStyles, headers, bodyToPrint, true, {
                halign: 'right'
            }, false);

            
            MRSaving(report, doc);
        }

    }

    const generateCostAndProfit = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = ["Items", "Qty", "Total sales", "Vat adj", "Gov discount", "Reg discount", "Total item sales amount", "Average sales amount", "Cost", "Average profit", "% profit"]

        const columnStyles = {
            0: {cellWidth: 'auto'},
            1: {cellWidth: 30, halign: 'right'},
            2: {cellWidth: 30, halign: 'right'},
            3: {cellWidth: 30, halign: 'right'},
            4: {cellWidth: 30, halign: 'right'},
            5: {cellWidth: 30, halign: 'right'},
            6: {cellWidth: 30, halign: 'right'},
            7: {cellWidth: 30, halign: 'right'},
            8: {cellWidth: 30, halign: 'right'},
            9: {cellWidth: 30, halign: 'right'},
            10: {cellWidth: 30, halign: 'right'}
        }

        if(history){

            console.log("first history", history);

            

            history = history.map((his: any) => {

                const itemFind = item.data.find((itm: any) => itm.itmcde === his.itmcde)

                const orderitemdiscount = his.orderitemdiscountfiles;

                let govDiscs = 0;
                let overallDiscs = 0;
                let realGovDiscs = 0;

                if(orderitemdiscount){
                    orderitemdiscount.forEach((d:any) => {

                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            govDiscs+= d.amtdis*1
                        }

                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat" || d.discde == "Athlete" || d.discde == "MOV"){
                            realGovDiscs+=d.amtdis*1;
                        }

                    });

                }
                


                // his.extprc / his.itmqty - his.
                return {
                    itemName: itemFind?.itmdsc,
                    qty: his.itmqty*1, 
                    totalSales: his.groext*1, 
                    vatadj: his.lessvat*1, 
                    govDiscount: realGovDiscs, 
                    regDiscount: overallDiscs - realGovDiscs,
                    totalItemSales: his.extprc*1,
                    averageSales: (his.extprc*1) / (his.itmqty*1),
                    // averageSales: parseFloat(his.extprc) / parseFloat(his.itmqty),
                    cost: 0,
                    averageProfit: his.untprc*1,
                    percentProfit: 100,
                    itmcde: his.itmcde,
                }
            });

            console.log('fetchedHistory', history);


            const reducedHistory = history.reduce((acc: any, current: any) => {                
                if(!acc[current.itmcde]){
                    acc[current.itmcde] = {
                        itemName: current?.itemName,
                        qty: 0,
                        totalSales: 0,
                        vatadj: 0,
                        govDiscount: 0, 
                        regDiscount: 0,
                        totalItemSales: 0,
                        averageSales: current.averageSales,
                        cost: 0,
                        averageProfit: current.averageProfit,
                        percentProfit: current.percentProfit

                    };
                }
                
                
                acc[current.itmcde].qty += current.qty
                acc[current.itmcde].totalSales += current.totalSales
                acc[current.itmcde].vatadj += current.vatadj
                acc[current.itmcde].govDiscount += current.govDiscount
                acc[current.itmcde].regDiscount += current.regDiscount
                acc[current.itmcde].totalItemSales += current.totalItemSales
                acc[current.itmcde].cost += current.cost

                return acc;
            }, {});



            for (const key in reducedHistory) {
                const item = reducedHistory[key]
                item.averageSales = parseFloat(item.totalItemSales) / parseInt(item.qty)
            }


            // Generate the keys as array from reduced history
            const reducedHistoryKeys = Object.keys(reducedHistory);

            const bodyToPrint: any = [];
            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Cost and Profit Analysis by Item Report");
            if (history.length === 0) {
              bodyToPrint.push(["N/A", "0", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0%"]);
              tableBlock(doc, 60, columnStyles, headers, bodyToPrint, false, {
                  halign: 'right'
              }, true);
            }
            else {
              // Traverse through the reduced history for items
              reducedHistoryKeys.forEach(rh => {

                  const valArr = Object.values(reducedHistory[rh]).map((val: any) => formatNumberData(val));

                  
                  // Converting the quantity element to a string just to remove the trailing 0.
                  valArr[1] = valArr[1].toString().split(".")[0]

                  bodyToPrint.push(valArr);
                  console.log(bodyToPrint);

              });

              // // Putting the print in the end because it is the grandtotal
              // const grandTotalArray: any = Object.values(grandTotal);
              // grandTotalArray.unshift("Grandtotal")
              // bodyToPrint.push(grandTotalArray)
          
              // (doc: any, startY: number, columnStyles: any, headers: any[], body: any[], isLastRowBold?: boolean, headStyles?: any, isFirstColOnlyLeft?: boolean)

              tableBlock(doc, 60, columnStyles, headers, bodyToPrint, false, {
                  halign: 'right'
              }, true);
            }
            
        MRSaving(report, doc);
        }

    }

    const generateESales = (doc: POSPdf, history: any, report: any) => {

        let headers: any[] = ["Date", "Total daily gross sales", "(-) Vat adj", "(-) Gov discount", "(-) Other discount", "Total sales", "Vatable sales", "VAT", "Vat zero rated sales", "Vat exempt sales", "Beg INV", "End INV"]

        const columnStyles = {
            0: {cellWidth: 30},
            1: {cellWidth: 30},
            2: {cellWidth: 30},
            3: {cellWidth: 30},
            4: {cellWidth: 30},
            5: {cellWidth: 30},
            6: {cellWidth: 30},
            7: {cellWidth: 30},
            8: {cellWidth: 30},
            9: {cellWidth: 30},
            10: {cellWidth: 'auto'},
            11: {cellWidth: 'auto'},
        }

        if(history){
            if (history.length === 0) {
              const bodyToPrint: any = [];
              bodyToPrint.push(["N/A", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "N/A", "N/A"]);
              headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "E-Sales Report");
              tableBlock(doc, 60, columnStyles, headers, bodyToPrint, false);
              MRSaving(report, doc);
              return;
            }

            const findAllSeparate = history.reduce((acc: any, cur: any) => {

                if(cur.refund ==1)
                  acc.refund.push(cur);
                else
                  acc.nonRefund.push(cur);
          
                return acc;
            }, {refund: [], nonRefund: []});

            const {refund, nonRefund} = findAllSeparate;
            const mainPosfile: any[] = [];

            nonRefund.forEach((d: any) => {
                const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);



                let item = {...d};

                if(refundFind){
                    item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
                    console.log("refundFind success", refundFind);
                }
                else{
                    console.log("refundFind failed", item);
                }

                if(item.itmqty != 0)
                    mainPosfile.push(item);
                else{
                    console.log("empty", item);
                }

            });

            history = mainPosfile.map((his: any) => {

                const orderitemdiscount = his.orderitemdiscountfiles;

                let govDiscs = 0;
                let overallDiscs = 0;
                let realGovDiscs = 0;

                if(orderitemdiscount){
                    orderitemdiscount.forEach((d:any) => {

                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            govDiscs+= d.amtdis*1
                        }

                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat" || d.discde == "Athlete" || d.discde == "MOV"){
                            realGovDiscs+=d.amtdis*1;
                        }

                    });

                }

                const selectedDate = new Date(his.trndte);
                const selectedSplitDate = his.trndte.split('-');
                const day = parseInt(selectedSplitDate[2])
                const month = selectedDate.getMonth();
                const year =  selectedDate.getFullYear();

                return {
                    date: day,
                    totalDailyGross: his.groext*1, 
                    vatAdj: his.lessvat*1, 
                    govDiscount: realGovDiscs, 
                    otherDiscount: overallDiscs - realGovDiscs,
                    totalSales: his.extprc*1,
                    vatableSales: his.netvatamt*1,
                    vat: his.vatamt*1, 
                    vatZeroRated: 0,
                    vatExemptSales: his.vatexempt*1,
                    begOr: his.trndte,
                    endOr: his.trndte,
                    day: day,
                    month: month,
                    year: year,
                    sortDate: String(month+1).padStart(2, '0') + "-"+year,
                    ordocnum: his.ordocnum
                }
            });

            history = history.reduce((acc: any, cur: any)=> {

                const currentDay = cur.day;

                if(!acc[cur.sortDate])
                    acc[cur.sortDate] = {}

                if(!acc[cur.sortDate][currentDay]){
                    acc[cur.sortDate][currentDay] = {
                        date: currentDay,
                        totalDailyGross: 0, 
                        vatAdj: 0, 
                        govDiscount: 0, 
                        otherDiscount: 0,
                        totalSales: 0,
                        vatableSales:0,
                        vat: 0, 
                        vatZeroRated: 0,
                        vatExemptSales: 0,
                        begOr: cur.ordocnum,
                        endOr: "",
                        
                    };
                }
                
                const monthToReport = acc[cur.sortDate][currentDay];

                monthToReport.totalDailyGross += cur.totalDailyGross; 
                monthToReport.vatAdj +=cur.vatAdj;
                monthToReport.govDiscount+=cur.govDiscount;
                monthToReport.otherDiscount+=cur.otherDiscount;
                monthToReport.totalSales+=cur.totalSales;
                monthToReport.vatableSales+=cur.vatableSales;
                monthToReport.vat+=cur.vat;
                monthToReport.vatZeroRated+=cur.vatZeroRated;
                monthToReport.vatExemptSales+=cur.vatExemptSales;
                monthToReport.endOr = cur.ordocnum

                return acc;

            }, {})

            const transDateKeys = Object.keys(history);
            let idx = 0;
            transDateKeys.forEach((key: any) => {

                const bodyToPrint: any =[];
                const dateSplit = key.split('-');

                // headerBlock(doc, 'E-Sales Report', header.data[0].address1 || "", report.from, report.to);

                // doc.setFontSize(18);
                // doc.text2('E-Sales Report', 16, 10);
                // doc.setFontSize(15);
                // doc.text2(`${header.data[0].address1}`, 16, 15);
                // doc.text2(`TIN No.: ${header.data[0].tin}`, 16, 20);
                // doc.text2(`Machine No.: ${header.data[0].machineno}`, 16, 25);
                // doc.text2(`Branch: ${header.data[0].brhdsc}`, 16, 30);
                headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "E-Sales Report");
            
                titleBlock(doc,`MONTH OF: ${dateSplit[0]}` ,50)
                titleBlock(doc,`YEAR OF: ${dateSplit[1]}` ,55)

                const value = Object.values(history[key]);
                const mappedValues: any = value.map((val:any) => Object.values(val).map((val: any,index:number) => {

                    if(index == 0)
                        return val;

                    return formatNumberData(val)
                }));

                // Converting the quantity element to a string just to remove the trailing 0.

                console.log(mappedValues); 

                bodyToPrint.push(...mappedValues);

                tableBlock(doc, 60, columnStyles, headers, bodyToPrint, false);
                idx++;
                if(idx < transDateKeys.length)
                  doc.addPage();
            })

            // tableBlock(doc, 60, columnStyles, headers, bodyToPrint);

            
        MRSaving(report, doc);

        }

    }

    const generateSalesSummary = async (doc: POSPdf, history: any, report: any, isManagersReport?: boolean) => {
        console.log(isManagersReport);
        if(history){

            history = history.map((his: any) => {

                const orderitemdiscount = his.orderitemdiscountfiles;

                let govDiscs = 0;
                let overallDiscs = 0;

                if(orderitemdiscount){
                    orderitemdiscount.forEach((d:any) => {

                        console.log("meron bang laman?", d, d.amtdis);
                        overallDiscs+= d.amtdis*1
                        if(d.discde == "Senior" || d.discde == "PWD" || d.discde == "Diplomat"){
                            console.log("pumasok ako here hehe");
                            govDiscs+= d.amtdis*1
                        }
                    });

                }

                return {
                    trndte: his.trndte,
                    groext: his.groext*1, 
                    lessvat: his.lessvat*1, 
                    extprc: his.extprc*1, 
                    amtdis: his.amtdis*1,
                    logtim: his.logtim,
                    netvatamt: his.netvatamt*1,
                    vatamt: his.vatamt*1,
                    vatexempt: his.vatexempt*1,
                    discde: his.discde,
                    ordocnum: his.ordocnum,
                    postrntyp: his.postrntyp,
                    batchnum: his.batchnum,
                    void: his.void,
                    refund: his.refund,
                    untprc: his.untprc*0,
                    taxcde: his.taxcde,
                    itmcde: his.itmcde
                }
            });

            // Grouped by batchnum
            const groupedByBatchnum = groupBatchnum(history);

            const keyBatchnum = Object.keys(groupedByBatchnum);
            const filteredKeyBatchnum = keyBatchnum.filter((d:any) => d!="")
            
            const headers = [
              syspar.data[0].receipt_title == 0?"Beginning OR.":"Beginning INV.", 
              syspar.data[0].receipt_title == 0?"Ending OR.":"Ending INV.", 
              "Grand Accum. Sales Ending Balance", 
              "Grand Accum. Sales Begining Balance", 
              "Gross Sales for the Day", 
              "Sales Issued with Manual SI/OR (per RR-16-2018)", 
              "Gross Sales From POS", 
              "VATable Sales", 
              "NON-VATable Sales", 
              "VAT Amount", 
              "VAT-Exempt Sales", 
              "Zero Rated Sales", 
              "Service Charge", 
              "Other Discount", 
              "Senior", 
              "PWD", 
              "Service Charge Discount", 
              "Returns/Refunds", 
              "Void/Cancelled", 
              "Total Deductions", 
              "VAT on Special Discounts", 
              "VAT on Returns", 
              "Others", 
              "Total VAT Adj.", 
              "VAT Payable", 
              "Net Sales w/ VAT", 
              "Net Sales w/o VAT", 
              "Other Income", 
              "Sales Overrun / Overflow", 
              "Total Net Sales", 
              "Reset Counter", 
              "Z-Counter", 
              "Remarks"
            ];

            if(filteredKeyBatchnum.length ==  0) {
              const bodyToPrint:any = [];
              bodyToPrint.push([null, null]);
              headers.forEach((d: any, idx) => {
                if (idx === 0 || idx === 1 || idx === headers.length - 1) {
                  bodyToPrint.push([{ content: d, styles: { fontStyle: "bold"} }, "N/A"]);
                  return;
                }

                if (idx === headers.length - 2) {
                  bodyToPrint.push([{ content: d, styles: { fontStyle: "bold"} }, "0"]);
                  return;
                }

                bodyToPrint.push([{ content: d, styles: { fontStyle: "bold"} }, "0.00"]);
              });
              headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Sales Summary Report");
              horizontalTableBlock(doc, 45, bodyToPrint, {
                  1: {halign: 'right'},
                  2: {halign: 'right'},
                  3: {halign: 'right'},
              });
              MRSaving(report, doc);
              // toast.error("Report empty", {
              //     hideProgressBar: true,
              //     position: toast.POSITION.TOP_CENTER
              // });
              return;
            }

            const finalOutput: any = {};

            for(const key of filteredKeyBatchnum){

                // Holder for the data that will be pushed to the final output
                const payload: any = {};

                // Data per batchnum (in array form)
                const perGroup = groupedByBatchnum[key];
                
                // When group is received, separate it by transaction (eg. {CASHFUND: [], ITEM: []})
                const {NOTRANSACTION, DISCOUNTABLE, ITEM, GRANDTOTAL, TOTAL, "VAT 0 RATED": VAT0RATED, "SERVICE CHARGE": SERVICECHARGE, DISCOUNT, LESSVATADJ, CASHIN, DECLARATION, CASHFUND, CASHOUT } = separateByTransaction(perGroup);
                const {CASH, CHANGE, EXCESS} = separateByTransactionByCode(perGroup)
                
                if (NOTRANSACTION) {
                  const currentDate = GRANDTOTAL[0].trndte;

                  payload.beginningOr = 'N/A';
                  payload.endOr = 'N/A';
                  payload.grandAccumSalesEndingBalance = 0;
                  payload.grandAccumSalesBeginningBalance = 0;
                  payload.grossSalesDay = 0;
                  payload.salesIssuedWithManualSIOR = 0;
                  payload.grossSalesPOS = 0;
                  payload.vatableSales = 0;
                  payload.nonVatableSales = 0;
                  payload.vatAmount = 0;
                  payload.vatExempt = 0;
                  payload.zeroRated = 0;
                  payload.serviceCharge = 0;
                  payload.otherDiscounts = 0;
                  payload.senior = 0;
                  payload.PWD = 0;
                  payload.serviceChargeDiscount = 0;
                  payload.refunds = 0;
                  payload.void = 0;
                  payload.totalDeductions = 0;
                  payload.vatSpecialDiscounts = 0;
                  payload.vatReturns = 0;
                  payload.others = 0;
                  payload.totalVatAdj = 0;
                  payload.vatPayable = 0;
                  payload.netSalesWVat = 0;
                  payload.netSalesWOVat = 0;
                  payload.otherIncome = 0;
                  payload.salesOverrun = 0;
                  payload.totalNetSales = 0;
                  payload.resetCounter = 0;
                  payload.zCounter = 0;
                  payload.remarks = ``;

                  finalOutput[currentDate] = payload;
                  continue;
                }
                
                // Get the date and its going to be the key for the final output
                const currentDate = ITEM?.[0].trndte;

                const filteredServiceCharge = SERVICECHARGE?.filter((d: any) => d.void === 0 && d.refund === 0) || []
                const filteredServiceChargeVoid = SERVICECHARGE?.filter((d: any) => d.void === 1) || []
                const filteredItem = ITEM?.filter((d: any) => d.void === 0 && d.refund === 0) || []
                const filteredTotal = TOTAL?.filter((d: any) => d.void === 0 && d.refund === 0) || []
                const filteredTotalRefund = TOTAL?.filter((d: any) => d.refund === 1) || []
                const filteredTotalVoid = TOTAL?.filter((d: any) => d.void === 1) || []
                const filteredCash = CASH?.filter((d: any) => d.itmcde === 'CASH' && d.void === 0 && d.refund === 0) || []
                const filteredChange = CHANGE?.filter((d: any) => d.itmcde === 'CHANGE' && d.void === 0 && d.refund === 0) || []
                const filteredExcess = EXCESS?.filter((d: any) => d.itmcde === 'EXCESS' && d.void === 0 && d.refund === 0) || []
                const filteredDiscountable = DISCOUNTABLE?.filter((d: any) => d.void === 0 && d.refund === 0) || []

                // Beginning OR
                const firstOrdocnum = ITEM[0].ordocnum;
                // Ending OR
                const endOrdocnum = ITEM[ITEM.length-1].ordocnum;
                // Total of gross sales
                const grossSales = ITEM?.reduce((acc:any, cur:any) => acc+=cur.groext, 0) || 0;
                const grossSalesWOVoid = ITEM?.filter((a: PosfileModel) => a.void === 0).reduce((acc:any, cur:any) => acc+=cur.groext, 0) || 0;

                // Total of vatable sales
                const vatableSales = filteredTotal?.reduce((acc: any, cur: any) => acc+=cur.netvatamt, 0) || 0;
                // Total of VAT 0 Rated
                const nonVatableSales = VAT0RATED?.reduce((acc: any, cur: any) => acc+=cur.netvatamt,0)  || 0
                // Total of VAT Amount
                const vatAmount = filteredTotal?.reduce((acc: any, cur: any) => acc+=cur.vatamt, 0) || 0
                // Total of VAT Exempt
                const vatExempt = filteredItem?.reduce((acc: any, cur: any) => acc+=cur.vatexempt, 0) || 0
                // Total of Service Charge
                const serviceCharge = filteredServiceCharge?.reduce((acc: any, cur: any) => acc+=cur.extprc*1, 0) || 0
                // Separation of discounts from posfile
                const {All, PWD, Senior} = separateDiscount(DISCOUNT);
                // PWD Discount
                const PWDDiscount = PWD?.reduce((acc: any,cur: any)=> acc+=cur.amtdis, 0) || 0
                // Senior Discount
                const SeniorDiscount = Senior?.reduce((acc: any,cur: any)=> acc+=cur.amtdis, 0) || 0
                // Total of Service Charge Disc
                const serviceChargeDisc = filteredServiceCharge?.reduce((acc: any, cur: any) => acc+=cur.amtdis*1, 0) || 0
                // Total of Returns/refunds
                const refunds = filteredTotalRefund?.reduce((acc: any, cur: any) => acc+=cur.groext, 0) || 0
                const voidPrice = filteredTotalVoid?.reduce((acc: any, cur: any) => acc+=cur.extprc, 0) || 0
                const voidSchargePrice = filteredServiceChargeVoid?.reduce((acc: any, cur: any) => acc+=cur.extprc, 0) || 0

                // Total of void/cancelled
                // const voids = TOTAL?.reduce((acc: any, cur: any) => acc+=cur.void!=0?cur.void:0, 0) || 0
                const voids = TOTAL?.filter((a: PosfileModel) => a.void === 1).reduce((acc: any, cur: any) => acc + cur.extprc, 0) || 0;
                // Total of VAT Adj

                console.log("What is happening here?",LESSVATADJ);
                const vatAdj = LESSVATADJ?.reduce((acc: any, cur: any) => acc+= (cur.void ==0 && cur.refund ==0 ?cur.extprc:0), 0) || 0
                // Total of VAT Adj
                // const netSalesWVat = grossSales - vatAdj - All;
                // // Total of VAT Adj
                // const netSalesWOVat = filteredTotal?.reduce((acc: any, cur: any) => 
                //     acc+= cur.netvatamt + cur.vatexempt, 0) || 0 - All;
                // // Total of refund discounts
                // const refDiscounts = AllRefDiscount;


                // Cash
                const cash = filteredCash?.reduce((acc:any, cur:any) => acc+=cur.extprc, 0) || [];
                // Change
                const change =  filteredChange?.reduce((acc:any, cur:any) => acc+=cur.extprc, 0) || [] +  filteredExcess?.reduce((acc:any, cur:any) => acc+=cur.extprc, 0) || []
                // Declaration
                const declaration = (DECLARATION && DECLARATION[0].extprc) || 0;
                // Cashfund
                const cashFund = CASHFUND?.reduce((acc:any, cur:any) => acc+=cur.extprc, 0)|| 0
                // Cashout
                const cashOut = CASHOUT?.reduce((acc:any, cur:any) => acc+=cur.extprc, 0)|| 0
                // Cashin
                const cashIn = CASHIN?.reduce((acc: any, cur: any) => 
                    acc+= cur.extprc, 0) || 0;

                //Main Cash
                const mainCash = cash - change - refunds;
                const discountable = filteredDiscountable?.reduce((acc: any, cur: any) => acc+=cur.extprc, 0) || 0
                // Validate if there is a previous zreading. If yes, set the beginning balance. Otherwise, set it to 0

                let transactionDate = "";
                
                if (!GRANDTOTAL) continue;

                if(GRANDTOTAL && GRANDTOTAL.length > 0)
                    transactionDate = GRANDTOTAL[0].trndte

                const prevPosfile: any = await dispatch(previousZRead(transactionDate));
                const countZread: any = await dispatch(zReadCount(transactionDate));
                
                // Setting the values for each field
                payload.beginningOr = receiptDefiner(syspar.data[0].receipt_title || 0,firstOrdocnum);
                payload.endOr = receiptDefiner(syspar.data[0].receipt_title || 0,endOrdocnum);
                payload.grandAccumSalesEndingBalance = GRANDTOTAL[0].extprc;
                payload.grandAccumSalesBeginningBalance = prevPosfile.payload.length == 0?0:parseFloat(prevPosfile.payload[0].extprc);
                payload.grossSalesDay = (grossSales - refunds) + serviceCharge - serviceChargeDisc;
                payload.salesIssuedWithManualSIOR = 0;
                payload.grossSalesPOS = (grossSales - refunds) + serviceCharge - serviceChargeDisc;
                payload.vatableSales = vatableSales - refunds;
                payload.nonVatableSales = nonVatableSales;
                payload.vatAmount = vatAmount;
                payload.vatExempt = vatExempt;
                payload.zeroRated = 0;
                payload.serviceCharge = serviceCharge - serviceChargeDisc;
                payload.otherDiscounts = All - PWDDiscount - SeniorDiscount
                payload.senior = SeniorDiscount;
                payload.PWD = PWDDiscount;
                payload.serviceChargeDiscount = serviceChargeDisc;
                payload.refunds = refunds;
                payload.void = voids;
                payload.totalDeductions = All + serviceCharge + vatAdj + voidPrice + voidSchargePrice;
                payload.vatSpecialDiscounts = 0;
                payload.vatReturns = 0;
                payload.others = 0;
                payload.totalVatAdj = vatAdj;
                payload.vatPayable = 0;
                payload.netSalesWVat = (grossSalesWOVoid + serviceCharge - serviceChargeDisc) - refunds - All - vatAdj;
                // payload.netSalesWOVat = (grossSalesWOVoid + serviceCharge - serviceChargeDisc) - refunds - All - vatAdj - vatAmount;
                payload.netSalesWOVat = header.data[0].chknonvat === 0 ? discountable - PWDDiscount - SeniorDiscount + vatableSales - refunds : discountable - All + vatableSales - refunds;
                payload.otherIncome = cashIn;
                payload.salesOverrun = declaration - mainCash - (cashFund + cashIn) - cashOut;
                payload.totalNetSales = (grossSalesWOVoid + serviceCharge - serviceChargeDisc) - refunds - All - vatAdj;
                payload.resetCounter = 0;
                payload.zCounter = countZread.payload.count;
                payload.remarks = ``;

                finalOutput[currentDate] = payload;
            }

            let byDateKeys = keyBatchnum.map(d=> history.find((data: any) => data.batchnum === d).trndte);
            byDateKeys.push("GRANDTOTAL");


            let tracker =0;

            // // Group the dates by 5 in a 2d array
            // let historyValues = Object.values(grou`p`ByBatchnum);
            // let historyKeys = Object.keys(groupByBatchnum);

            // const headers = [syspar.data[0].receipt_title == 0?"Beginning OR.":"Beginning INV.", syspar.data[0].receipt_title == 0?"Ending OR.":"Ending INV.", "Grand Accum. Sales Ending Balance", "Grand Accum. Sales Begining Balance", "Gross Sales for the Day", "Sales Issued with Manual SI/OR (per RR-16-2018)", "Gross Sales From POS", "VATable Sales", "NON-VATable Sales", "VAT Amount", "VAT-Exempt Sales", "Zero Rated Sales", "Service Charge", "Other Discount", "Senior", "PWD", "Service Charge Discount", "Returns/Refunds", "Void/Cancelled", "Total Deductions", "VAT on Special Discounts", "VAT on Returns", "Others", "Total VAT Adj.", "VAT Payable", "Net Sales w/ VAT", "Net Sales w/o VAT", "Other Income", "Sales Overrun / Overflow", "Total Net Sales", "Reset Counter", "Z-Counter", "Remarks"];

            const dateHeaders: any = []
            let groupings = -1;

            const finalOutputValues = Object.values(finalOutput)



            const grandTotal = finalOutputValues.reduce((acc:any, cur: any) => {

              if(Object.keys(acc).length == 0){
                acc = {...cur, beginningOr: "N/A", endOr: "N/A", grandAccumSalesBeginningBalance: "N/A", grandAccumSalesEndingBalance: "N/A", zCounter: 'N/A'};
                return acc;
              }
              else{
                acc.PWD += cur.PWD;
                acc.beginningOr = "N/A";
                acc.endOr = "N/A";
                acc.grandAccumSalesBeginningBalance = "N/A";
                acc.grandAccumSalesEndingBalance="N/A";
                acc.grossSalesDay += cur.grossSalesDay;
                acc.grossSalesPOS += cur.grossSalesPOS;
                acc.netSalesWOVat += cur.netSalesWOVat;
                acc.netSalesWVat += cur.netSalesWVat;
                acc.nonVatableSales += cur.nonVatableSales;
                acc.otherDiscounts += cur.otherDiscounts;
                acc.otherIncome += cur.otherIncome;
                acc.others += cur.others;
                acc.refunds += cur.refunds;
                acc.remarks ="N/A";
                acc.resetCounter += cur.resetCounter;
                acc.salesIssuedWithManualSIOR += cur.salesIssuedWithManualSIOR;
                acc.salesOverrun += cur.salesOverrun;
                acc.senior += cur.senior;
                acc.serviceCharge += cur.serviceCharge;
                acc.serviceChargeDiscount += cur.serviceChargeDiscount;
                acc.totalDeductions += cur.totalDeductions;
                acc.totalNetSales += cur.totalNetSales;
                acc.totalVatAdj += cur.totalVatAdj;
                acc.vatAmount += cur.vatAmount;
                acc.vatExempt += cur.vatExempt;
                acc.vatPayable+= cur.vatPayable;
                acc.vatReturns += cur.vatReturns;
                acc.vatSpecialDiscounts += cur.vatSpecialDiscounts;
                acc.vatableSales += cur.vatableSales;
                acc.void += cur.void;
                acc.zCounter = "N/A"
                acc.zeroRated += cur.zeroRated;

                
                return acc;
              }
            },{});

            finalOutputValues.push(grandTotal);


            const groupedValues: any = finalOutputValues.reduce((acc: any, cur: any, currentIndex: number) => {

                const currentObject = Object.values(cur);
                
                if(tracker % 3 == 0){

                    groupings++;
                    
                    let sideHeader = Array.from({length: currentObject.length});
                    sideHeader = sideHeader.map((_: any, index: number) => [{ content: headers[index], styles: { fontStyle: "bold"} }]);
    
                    acc.push(sideHeader)
                    dateHeaders.push([]);
                }

                dateHeaders[groupings].push(byDateKeys[currentIndex]);
                
                const index = acc.length - 1;


                currentObject.forEach((itm: any, i: number) => {
                    // console.log(index, i, itm);

                    let item = itm;

                    if(typeof itm === 'number'){
                        item = itm.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })
                    }

                    acc[index][i].push(item);
                })

                tracker++;

                return acc;


            }, []);

            console.log(groupedValues);

            
            // For encoding per page
            groupedValues.forEach((itm: any, index: number) => {

                
                console.log(dateHeaders);
                
                const bodyToPrint: any = [];

                const groupHeader = [null, ...dateHeaders[index]]
                
                // To print. It's in 2d array

                // headerBlock(doc, header.data[0].comdsc || "", header.data[0].address1 || "", report.from, report.to);
                // doc.setFontSize(14);
                // doc.text2(header.data[0].business1||'', 16, 10);
                // doc.setFontSize(12);
                // doc.text2("Sales Summary", 16, 15);
                
                // doc.setFontSize(8);
                // doc.text2(`Date Covered: ${report.from} to ${report.to}`, 16, 20);
                // doc.text2(`Date Printed: ${new Date().toString()}`, 16, 25);
                headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Sales Summary Report");

                // leftTitleBlock(doc, `${isManagersReport?"Managers Report":"BIR Report"}: Sales Summary`,16, 35)
                    
                bodyToPrint.push(groupHeader);
                bodyToPrint.push(...itm);
                
                horizontalTableBlock(doc, 45, bodyToPrint, {
                    1: {halign: 'right'},
                    2: {halign: 'right'},
                    3: {halign: 'right'},
                });
                
                if (index !== groupedValues.length - 1)
                  doc.addPage();
            });


            
        MRSaving(report, doc);

        }

    }

    const generateDailySales = (doc: POSPdf, history: DailySales[], report: any, ) => {
      if (!history) return;

      const headers =
        {
          begOr: syspar.data[0].receipt_title?"Beginning OR.":"Beginning INV.",
          endOr:syspar.data[0].receipt_title?"Ending OR.":"Ending INV." , 
          lessPostRefund: "Less Post Refund", 
          lessPostVoid: "Less Post Void", 
          lessDiscounts: "Less Discounts", 
          lessServiceCharge: "Less Service Charge", 
          lessVatAdj: "Less VAT Adj", 
          totalVatSales: "Total Vat Sales", 
          totalNonVatSales: "Total Non VAT Sales", 
          totalTransaction: "Total No. Of Transaction", 
          totalPax: "Total No. Of PAX", 
          totalQty: "Total Qty", 
          cash: "Cash", 
          otherMop: "Other MOP", 
          cashFund: "Cash Fund", 
          cashInDrawer: "Cash In Drawer", 
          posCash: "POS Cash", 
          declaration: "Declaration", 
          shortOver: "Short/Over", 
          netSales: "Net Sales", 
          grossSales: "Gross Sales"
        }

      if (history.length === 0) {
        const bodyToPrint: any = [];
        bodyToPrint.push([null, null]);
        Object.values(headers).forEach((d: any, idx) => {
          if (idx === 0 || idx === 1) {
            bodyToPrint.push([{ content: d, styles: { fontStyle: "bold"} }, "N/A"]);
            return;
          }

          if (idx === 9 || idx === 10 || idx === 11) {
            bodyToPrint.push([{ content: d, styles: { fontStyle: "bold"} }, "0"]);
            return;
          }

          bodyToPrint.push([{ content: d, styles: { fontStyle: "bold"} }, "0.00"]);
        });

        headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Daily Sales Report");
        horizontalTableBlock(doc, 45, bodyToPrint);
        MRSaving(report, doc);
        return;
      }

      const findAllSeparate = history.reduce((acc: any, cur: any) => {

        if(cur.refund ==1)
          acc.refund.push(cur);
        else
          acc.nonRefund.push(cur);
  
        return acc;
      }, {refund: [], nonRefund: []});

      const {refund, nonRefund} = findAllSeparate;

      const mainPosfile: any[] = [];

      nonRefund.forEach((d: any) => {
          const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);

          let item = {...d};

          if(refundFind){
              item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
          }

          if(item.itmqty != 0 || item.postrntyp != "ITEM")
              mainPosfile.push(item);

      });

      const historyDataByDate: {[index: string]: DailysalesHistoryData} = {};

      // group by [dates][ordocnum]
      const groupedByDates: {[index: string]: {[index: string]: DailySales[]}} = history.reduce((acc: any, cur: any) => {

        const ordocnum = cur.ordocnum === null ? 'null' : cur.ordocnum;
        // console.log("cur", ordocnum);
        
        if(!acc[cur.trndte]){
          acc[cur.trndte] = {};
        }

        if (!acc[cur.trndte][ordocnum]) {
          acc[cur.trndte][ordocnum] = [];
        }
        
        acc[cur.trndte][ordocnum].push(cur);

        return acc;

      }, {});
      
      for (const dateKey in groupedByDates) {
        const dateGrp = groupedByDates[dateKey];

        const historyData = {
          begOr: '',
          endOr: '',
          lessPostRefund: 0,
          lessPostVoid: 0,
          lessDiscounts: 0,
          lessServiceCharge: 0,
          lessVatAdj: 0,
          totalVatSales: 0,
          totalNonVatSales: 0,
          totalTransaction: 0,
          totalPax: 0,
          totalQty: 0,
          cash: 0,
          otherMop: 0,
          cashFund: 0,
          cashInDrawer: 0,
          posCash: 0,
          declaration: 0,
          shortOver: 0,
          netSales: 0,
          grossSales: 0,
        };

        // set the beginning OR and ending OR
        const keys = Object.keys(dateGrp).filter(a => a !== 'null');
        console.log('xxxDateGrp', keys);
        const begOrDefiner = receiptDefiner(syspar.data[0].receipt_title || 0,keys[0]);
        const endOrDefiner = receiptDefiner(syspar.data[0].receipt_title || 0,keys[keys.length - 1]);
        historyData.begOr = begOrDefiner === "" ? "N/A" : begOrDefiner; 
        historyData.endOr = endOrDefiner === "" ? "N/A" : endOrDefiner;

        for (const key in dateGrp) {
          // if (key === 'null') continue;

          const element = dateGrp[key];

          // get less post refund
          const refund = element.find((e) => e.itmcde === 'TOTAL' && e.refund === 1);
          if(refund){
            historyData.lessPostRefund += parseFloat(refund.groext as string);
          }

          // get less post void
          const voided1 = element.find((e) => e.itmcde === 'TOTAL' && e.void === 1);
          const voided2 = element.find((e) => e.itmcde === 'SERVICE CHARGE' && e.void === 1);

          if (voided1 && voided2){
            historyData.lessPostVoid += parseFloat(voided1.extprc as string) + parseFloat(voided2.extprc as string);
          }

          // get less discounts
          const discount = element.filter((e) => e.postrntyp === 'DISCOUNT' && e.void === 0 && e.refund === 0);
          const reflessDiscount = element.filter((e) => e.itmcde === 'ITEM' && e.refund === 1);
          if (discount) {
            const reflessDiscSum = reflessDiscount.reduce((acc: number, cur: any) => {
              return acc + parseFloat(cur.amtdis);
            }, 0);

            historyData.lessDiscounts += discount.reduce((acc: number, cur: any) => {
              return acc + (parseFloat(cur.amtdis) - reflessDiscSum);
            }, 0);
          }

          // get less service charge
          const serviceCharge = element.find((e) => e.itmcde === 'SERVICE CHARGE' && e.void === 0 && e.refund === 0);
          if (serviceCharge) {
            historyData.lessServiceCharge += parseFloat(serviceCharge.extprc as string) - parseFloat(serviceCharge.amtdis as string);
          }

          // get less vat adj
          const vatAdj = element.find((e) => e.itmcde.toLowerCase() === ('Less Vat Adj.').toLowerCase() && e.void === 0 && e.refund === 0);
          if (vatAdj) {
            historyData.lessVatAdj += parseFloat(vatAdj.extprc as string);
          }

          // get total vat sales
          const vatSales = element.find((e) => e.itmcde === 'TOTAL' && e.void === 0 && e.refund === 0);
          const post_refund = element.find((e) => e.itmcde === 'TOTAL' && e.refund === 1);
          if (vatSales) {
            historyData.totalVatSales += parseFloat(vatSales.netvatamt as string) - (post_refund ? parseFloat(post_refund.extprc as string) : 0);
          }

          // get total non vat sales
          const nonVatSales = element.find((e) => e.itmcde === 'VAT 0 RATED' && e.void === 0 && e.refund === 0);
          if (nonVatSales) {
            historyData.totalNonVatSales += parseFloat(nonVatSales.extprc as string);
          }

          // get total transaction
          const totalTransaction = element.filter((e) => e.trncde === 'POS');
          // group by ordocnum
          const groupedByOrdocnum: {[index: string]: DailySales[]} = totalTransaction.reduce((acc: any, cur: any) => {
            if(!acc[cur.ordocnum]){
              acc[cur.ordocnum] = [];
            }

            acc[cur.ordocnum].push(cur);

            return acc;
          }, {});
          historyData.totalTransaction += Object.keys(groupedByOrdocnum).length;

          // get total pax
          const pos = element.filter((e) => e.trncde === 'POS' && e.void === 0 && e.refund === 0);
          // group by billdocnum
          const groupedByBilldocnum: {[index: string]: DailySales[]} = pos.reduce((acc: any, cur: any) => {
            if(!acc[cur.billdocnum]){
              acc[cur.billdocnum] = [];
            }

            acc[cur.billdocnum].push(cur);

            return acc;
          }, {});
          // get the numpax of each billdocnum
          for (const key in groupedByBilldocnum) {
            if (key === 'null') continue;

            const element = groupedByBilldocnum[key][0];
            historyData.totalPax += element.numpax;
          }

          // get total qty
          const totalQty = element.filter((e) => e.trncde === 'POS' && e.postrntyp === 'ITEM' && e.void === 0 && e.refund === 0);
          historyData.totalQty += totalQty.reduce((acc: number, cur: any) => {
            return acc + parseFloat(cur.itmqty);
          }, 0);

          // get cash
          const cash = element.filter((e) => e.itmcde === 'CASH' && e.void === 0 && e.refund === 0);
          const change = element.filter((e) => (e.itmcde === 'CHANGE' || e.itmcde === 'EXCESS') && e.void === 0 && e.refund === 0);
          const lessRefundCash = post_refund;


          historyData.cash += cash.reduce((acc: number, cur: any) => {
            return acc + parseFloat(cur.extprc);
          }, 0) - change.reduce((acc: number, cur: any) => {
            return acc + parseFloat(cur.extprc);
          }, 0) - (lessRefundCash ? parseFloat(lessRefundCash.extprc as string) : 0);

          console.log("asdcashx", historyData.cash);
          

          // get other mop
          const otherMop = element.filter((e) => e.postrntyp === 'PAYMENT' && e.itmcde !== 'CASH' && e.void === 0 && e.refund === 0);
          historyData.otherMop += otherMop.reduce((acc: number, cur: any) => {
            return acc + parseFloat(cur.extprc);
          }, 0);

          // get cash fund
          console.log("asdelement", element);
          
          const cashFund = element.filter((e) => e.postrntyp === 'CASHFUND');

          console.log("asdcashFund", cashFund);
          
          
          historyData.cashFund += cashFund.reduce((acc: number, cur: any) => {
            return acc + parseFloat(cur.extprc);
          }, 0);

          console.log("asdcashFund2", historyData.cashFund);

          // get declaration
          const declaration = element.filter((e) => e.postrntyp === 'DECLARATION');
          historyData.declaration += declaration.reduce((acc: number, cur: any) => {
            return acc + parseFloat(cur.extprc);
          }, 0);

          // gross sales
          const grossSales = element.filter((e) => (e.itmcde === 'TOTAL' || e.itmcde === 'SERVICE CHARGE') && e.refund === 0  && e.void ===0);
          const schargeDisc = element.find((e) => e.itmcde === 'SERVICE CHARGE' && e.void === 0 && e.refund === 0);
          
          historyData.grossSales += grossSales.reduce((acc: number, cur: any) => {
            return acc + (cur.itmcde === 'TOTAL' ? parseFloat(cur.groext) : parseFloat(cur.extprc));
          }, 0) - (schargeDisc ? parseFloat(schargeDisc.amtdis as string) : 0);

        }

        // get cash in drawer
        const cashIn = dateGrp['null'].filter((e) => e.postrntyp === 'CASHIN');
        const cashOut = dateGrp['null'].filter((e) => e.postrntyp === 'CASHOUT');

        const reducedCashIn = cashIn.reduce((acc: number, cur: any) => {
          return acc + parseFloat(cur.extprc);
        }, 0);

        const reducedCashOut = cashOut.reduce((acc: number, cur: any) => {
          return acc + parseFloat(cur.extprc);
        }, 0);

        historyData.cashInDrawer = historyData.cash + ((historyData.cashFund + reducedCashIn) - reducedCashOut);
        console.log("asdcashInDrawer", historyData.cashInDrawer);

        // get pos cash
        const posCash = (historyData.cashInDrawer*1) //- (historyData.lessPostRefund*1) - (historyData.lessPostVoid*1);
        historyData.posCash = posCash;

        // get short over
        const shortOver = historyData.declaration - historyData.cashInDrawer;
        historyData.shortOver = shortOver;

        // get net sales
        const netSales = header.data[0].chknonvat === 0 ? 
        historyData.grossSales - historyData.lessPostRefund - historyData.lessDiscounts  - historyData.lessVatAdj
        :
        0;
        historyData.netSales = netSales;


        if (!historyDataByDate[dateKey]) historyDataByDate[dateKey] = {} as any;
        historyDataByDate[dateKey] = historyData;

      }

      
      console.log("historyData:", historyDataByDate);

      const historyValues = Object.values(historyDataByDate);
      const historyKeys = Object.keys(historyDataByDate);

      const dateHeaders = [historyKeys];

      const groupedValues: any = [];
      for (const key in historyValues[0]) {
        const docData = [
          {content: headers[key as keyof typeof headers], styles: {fontStyle: 'bold'}},
          ...historyValues.map((d: DailysalesHistoryData) => {
            if (key === 'begOr' || key === 'endOr') {
              return d[key as keyof typeof headers];
              
            } else if (key === 'totalTransaction' || key === 'totalPax' || key === 'totalQty') {
              return formatNumberWithCommasAndDecimals(d[key as keyof typeof headers], 0);
            }
            else {
              return formatNumberWithCommasAndDecimals(d[key as keyof typeof headers], 2);
            }
          })
        ]

        groupedValues.push(docData);
      }

      // const grpValues = [groupedValues];


      let mainArr: any = {};

      console.log(groupedValues);
      groupedValues.forEach((d: any[]) => {

          const dividedBy = d.length / 4;
          let slice = [];
          let counter = 1;

          for(let i =0; i< dividedBy; i++){

              slice = d.slice(counter, counter+4);

              if(slice.length >0){

                  if(!mainArr[i]){
                      mainArr[i] = [];
                  }
                  mainArr[i].push([d[0], ...slice]);
              }
              
              counter+=4;
          }

          // d.forEach((el: any[], index: number) => {
          //     const slice = el.slice(counter, counter+5);
          //     tempArr.push(groupedValues[0][index])
          //     tempArr.push(slice);
          // });

      });

      console.log("Feeling MC", Object.values(mainArr), dateHeaders);

      let idx1 = 0;
      let idx2 = 0;
      const _arr = Object.values(mainArr);
      _arr.forEach((el: any) => {
          console.log("El gamma penumbra", el);
          [el].forEach((itm: any) => {
              const bodyToPrint: any = [];
  
              const groupHeader = [null, ...dateHeaders[0].slice(idx1, idx1+4)];

              console.log(groupHeader);
              
              // To print. It's in 2d array
              headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Daily Sales Report");
                  
              bodyToPrint.push(groupHeader);
              bodyToPrint.push(...itm);
              console.log("check item", itm);
              
              horizontalTableBlock(doc, 45, bodyToPrint);
              idx2++;

              if (idx2 !== _arr.length) {
                doc.addPage();
              }

              idx1+=4
          });
      });
        
      MRSaving(report, doc);
    }

    const generatePaymentType = (doc: POSPdf, history: any, report: any, ) => {

        let headers: any[] = [syspar.data[0].receipt_title == 0?"OR NO.":"INV NO.", "BILL NO.", "DATE", "TIME", "Payment Type", "Amount", "Cashier"]

        const columnStyles = {
            0: {cellWidth: 'auto'},
            1: {cellWidth: 'auto', halign: "right"},
            2: {cellWidth: 'auto', halign: "right"},
            3: {cellWidth: 'auto', halign: "right"},
            4: {cellWidth: 'auto', halign: "right"},
            5: {cellWidth: 'auto', halign: "right"},
            6: {cellWidth: 'auto', halign: "right"},
        }

        if(history){
            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Payment Type Report");

            if (history.length === 0) {
              const bodyToPrint: any = [];
              bodyToPrint.push(["N/A", "N/A", "N/A", "N/A", "N/A", "0.00", "N/A"]);
              tableBlock(doc, 55, columnStyles, headers, bodyToPrint, false, {
                  halign: 'right'
              }, true);

              let finalY = doc.previousAutoTable.finalY;
              doc.text2("SUMMARY", 16, finalY+=10)
            
              finalY+=5;

              doc.text2("PAYMENT TYPE", 16, finalY)
              doc.text2("AMOUNT", 40, finalY);
              doc.text2("N/A", 16, finalY+5);
              doc.text2("0.00", 40, finalY+5);

              MRSaving(report, doc);
              return;
            }
          
            const findAllSeparate = history.reduce((acc: any, cur: any) => {


                if(cur.postrntyp == "CHANGE")
                    acc.change.push(cur);
                else if(cur.refund ==1)
                  acc.refund.push(cur);
                else
                  acc.nonRefund.push(cur);
          
                return acc;
            }, {refund: [], nonRefund: [], change: []});

            const {refund, nonRefund, change} = findAllSeparate;
            const mainPosfile: any[] = [];

            nonRefund.forEach((d: any) => {

                const refundFind = refund.find((data: any) => data.ordocnum == d.ordocnum && d.itmcde == data.itmcde);

                const changeFind = change.find((data: any) => data.ordocnum == d.ordocnum)

                let item = {...d};



                if(changeFind){
                    item = {...item, extprc: item.itmcde === 'CASH' ? (item.extprc - changeFind.extprc) : item.extprc}
                }
                else if(refundFind){
                    item = {...item, itmqty: (item.itmqty*1)-(refundFind.refundqty*1)}
                    console.log("refundFind success", refundFind);
                }
                else{
                    console.log("refundFind failed", item);
                }

                if(item.itmqty != 0)
                    mainPosfile.push(item);
                else{
                    console.log("empty", item);
                }

            });

            history = mainPosfile.map((his: any) => {

                return {
                    ordocnum: receiptDefiner(syspar.data[0].receipt_title || 0,his.ordocnum),
                    billdocnum: his.billdocnum,
                    trndte: his.trndte,
                    logtim: his.logtim,
                    itmcde: his.itmcde,
                    extprc: numberPadFormatter(his.extprc, 2),
                    cashier: his.cashier
                }
            });

            const arrToObj = history.map((d: any) => Object.values(d).map((val: any) => {

                const isDate = dateChecker(val); 

                if(isDate){
                    return val;
                }

                const parsedValue = parseFloat(val);
                return parsedValue?formatNumberData(parsedValue):val; 

            }));


            const paymentSummation = history.reduce((acc: any, cur: any) => {

                if(!acc[cur.itmcde])
                    acc[cur.itmcde] = 0;

                acc[cur.itmcde] += parseFloat(cur.extprc);
                return acc;

            }, {});

            // (doc: any, startY: number, columnStyles: any, headers: any[], body: any[], isLastRowBold?: boolean, headStyles?: any, isFirstColOnlyLeft?: boolean)
            
            tableBlock(doc, 55, columnStyles, headers, arrToObj, false, {
                halign: 'right'
            }, true);

            let finalY = doc.previousAutoTable.finalY;
            let total = 0;

            if(finalY > 165.80646){
              doc.addPage();
              finalY = 0;
            }

            const paymentSummationKeys = Object.keys(paymentSummation);

            // doc.setFont(undefined, 'bold')

            finalY+=10;
            doc.text2("SUMMARY", 16, finalY)
            
            finalY+=5;

            doc.text2("PAYMENT TYPE", 16, finalY)
            doc.text2("AMOUNT", 40, finalY);

            finalY+=5;

            console.log(paymentSummation, paymentSummationKeys);

            // doc.setFont(undefined, 'normal')

            paymentSummationKeys.forEach((key: string) => {
                const val = paymentSummation[key];
                const valString = val+"";

                doc.text2(key, 16, finalY);
                doc.text2(formatNumberData(parseFloat(valString)), 40, finalY);
                
                finalY+=5;
                total+= val;

            });

            // doc.setFont(undefined, 'bold')

            
            doc.text2("TOTAL", 16, finalY)
            doc.text2(formatNumberData(total)+"", 40, finalY);


            
        MRSaving(report, doc);

        }

    }

    const generateFreeTransaction = (doc: POSPdf, history: FreeTransaction[], report: any) => {
      if (history) {

        const columnStyles = {
          0: {cellWidth: 'auto'},
          1: {cellWidth: 'auto', halign: "right"},
          2: {cellWidth: 'auto', halign: "right"},
          3: {cellWidth: 'auto', halign: "right"},
          4: {cellWidth: 'auto', halign: "right"},
          5: {cellWidth: 'auto', halign: "right"},
          6: {cellWidth: 'auto', halign: "right"},
        }

        const headers = [null, null, 'AMOUNT', 'QTY', 'TOTAL'];
        headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Free Items / Transactions Report");
        if (history.length === 0) {
          const bodyPrint = [];
          bodyPrint.push(["N/A", null, "0.00", "0", "0.00"]);
          bodyPrint.push([
            {content: 'GRANDTOTAL', styles: {fontStyle: 'bold', fontSize: 11.5}}, 
            null,
            {content: "0.00", styles: {fontStyle: 'bold', fontSize: 11.5}}, 
            {content: "0", styles: {fontStyle: 'bold', fontSize: 11.5}}, 
            {content: "0.00", styles: {fontStyle: 'bold', fontSize: 11.5}},
          ]);
          tableBlock(doc, 47, columnStyles, headers, bodyPrint, false, {
            halign: 'right'
          }, true);
        }
        else {
          // group by trndte
          const groupedByTrndte: {[index: string]: FreeTransaction[]} = history.reduce((acc: any, cur: PosfileModel) => {
            if (!acc[cur.trndte!]) {
              acc[cur.trndte!] = [];
            }

            cur.itmdsc = priceList.data.find((d: PricelistModel) => d.prccde === cur.warcde)?.pricecodefile2s.find((d: PriceDetailModel) => d.itmcde === cur.itmcde)?.itmdsc || cur.itmdsc;
            cur.untprc = priceList.data.find((d: PricelistModel) => d.prccde === cur.warcde)?.pricecodefile2s.find((d: PriceDetailModel) => d.itmcde === cur.itmcde)?.untprc || cur.untprc || cur.grossprc;
            
            acc[cur.trndte!].push(cur);

            return acc;
          }, {});

          // if no selected dinetype
          const trndteValues = Object.values(groupedByTrndte);
          //#region: NO SELECTED DINETYPE
          if (trndteValues.length > 0 && !trndteValues[0][0].postypefile) {

            // formatItemGrpByDate
            //   {
            //     "2024-05-09": {
            //         "1-pc Chickenjoy": {
            //             "amt": 200,
            //             "qty": 2,
            //             "total": 200
            //         },
            //         "1-pc Chickenjoy Meal": {
            //             "amt": 95,
            //             "qty": 1,
            //             "total": 95
            //         }
            //     }
            // }
            const formatItemGrpByDate = Object.values(groupedByTrndte).reduce((acc: any, cur: any) => {
              cur.forEach((itm: FreeTransaction) => {
    
                if (!acc[itm.trndte]) {
                  acc[itm.trndte] = {};
                }
    
                if (!acc[itm.trndte][itm.itmdsc]) {
                  acc[itm.trndte][itm.itmdsc] = {amt: 0, qty: 0, total: 0};
                }
    
                acc[itm.trndte][itm.itmdsc].amt += itm.untprc*1;
                acc[itm.trndte][itm.itmdsc].qty += itm.itmqty*1;
                acc[itm.trndte][itm.itmdsc].total += (itm.untprc*1) * (itm.itmqty*1);
              });
    
              return acc;
            }, {});

            let formatORGrpByDate = Object.values(groupedByTrndte).reduce((acc: any, cur: any) => {

              const dateOrdocnumGrp = cur.reduce((acc2: any, cur2: any) => {
                if (!acc2[cur2.trndte]) {
                  acc2[cur2.trndte] = {};
                }

                if (!acc2[cur2.trndte][cur2.ordocnum]) {
                  acc2[cur2.trndte][cur2.ordocnum] = [];
                }
    
                acc2[cur2.trndte][cur2.ordocnum].push(cur2);
    
                return acc2;
              }, {});
    
              return {...acc, ...dateOrdocnumGrp};
            }, {});

            // formatORGrpByDate sample data
            // {
            //   "2024-05-09": {
            //       "OR-0000000000000005": {
            //           "amt": 100,
            //           "qty": 1,
            //           "total": 100
            //       },
            //        ...
            //  }

            formatORGrpByDate = Object.keys(formatORGrpByDate).reduce((acc:any, date:any) => {
              acc[date] = Object.keys(formatORGrpByDate[date]).reduce((orderAcc:any, orderNum:any) => {
                const orderSummary = formatORGrpByDate[date][orderNum].reduce((summary:any, item:FreeTransaction) => {
                  summary.amt += item.untprc*1;
                  summary.qty += item.itmqty*1;
                  summary.total += (item.untprc*1) * (item.itmqty*1);
                  return summary;
                }, { amt: 0, qty: 0, total: 0 });
          
                orderAcc[orderNum] = orderSummary;
                return orderAcc;
              }, {});
          
              return acc;
            }, {});
    
            //#region: PRINTING PDF
            const bodyPrint: any = [];
    
            let GRANDTOTALAmt = 0;
            let GRANDTOTALQty = 0;
            let GRANDTOTALTotal = 0;
            for (const date in formatItemGrpByDate) {
              const element = formatItemGrpByDate[date];
    
              bodyPrint.push([{content: date, styles: {fontStyle: 'bold'}}]); // date
              bodyPrint.push(['\tOthers']);

              let amtTotal = 0;
              let qtyTotal = 0;
              let totalTotal = 0;
    
              for (const itmdsc in element) {
                const element2 = element[itmdsc];
                const row = [`\t\t${itmdsc}`, null, formatNumberData(element2.amt), element2.qty, formatNumberData(element2.total)];

                // console.log('xxxElement2', element2);
                

                amtTotal += element2.amt;
                qtyTotal += element2.qty;
                totalTotal += element2.total;

                bodyPrint.push(row);
              }

              GRANDTOTALAmt += amtTotal;
              GRANDTOTALQty += qtyTotal;
              GRANDTOTALTotal += totalTotal;

              bodyPrint.push([]);

              bodyPrint.push([
                {content: '\tOthers', styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                null,
                {content: formatNumberData(amtTotal), styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: qtyTotal, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: formatNumberData(totalTotal), styles: {fontStyle: 'bold', fontSize: 11.5}},
              ]);

              bodyPrint.push([
                {content: date, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                null,
                {content: formatNumberData(amtTotal), styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: qtyTotal, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: formatNumberData(totalTotal), styles: {fontStyle: 'bold', fontSize: 11.5}},
              ]);

              bodyPrint.push([]);
            }

            bodyPrint.push([
              {content: 'GRANDTOTAL', styles: {fontStyle: 'bold', fontSize: 11.5}}, 
              null,
              {content: formatNumberData(GRANDTOTALAmt), styles: {fontStyle: 'bold', fontSize: 11.5}}, 
              {content: GRANDTOTALQty, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
              {content: formatNumberData(GRANDTOTALTotal), styles: {fontStyle: 'bold', fontSize: 11.5}},
            ]);
            bodyPrint.push([]);

            GRANDTOTALAmt = 0;
            GRANDTOTALQty = 0;
            GRANDTOTALTotal = 0;
            for (const date in formatORGrpByDate) {
              const element = formatORGrpByDate[date];
    
              bodyPrint.push([{content: 'Others', styles: {fontStyle: 'bold'}}, ]);
              bodyPrint.push([{content: '\t'+date, styles: {fontStyle: 'bold'}}]); // date

              let amtTotal = 0;
              let qtyTotal = 0;
              let totalTotal = 0;
    
              for (const ordocnum in element) {
                const element2 = element[ordocnum];
                const row = [`\t\t${receiptDefiner(syspar.data[0].receipt_title!, ordocnum)}`, null, formatNumberData(element2.amt), element2.qty, formatNumberData(element2.total)];

                amtTotal += element2.amt;
                qtyTotal += element2.qty;
                totalTotal += element2.total;

                bodyPrint.push(row);
              }

              GRANDTOTALAmt += amtTotal;
              GRANDTOTALQty += qtyTotal;
              GRANDTOTALTotal += totalTotal;

              bodyPrint.push([]);

              bodyPrint.push([
                {content: '\t'+date, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                null,
                {content: formatNumberData(amtTotal), styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: qtyTotal, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: formatNumberData(totalTotal), styles: {fontStyle: 'bold', fontSize: 11.5}},
              ]);

              bodyPrint.push([
                {content: 'Others', styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                null,
                {content: formatNumberData(amtTotal), styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: qtyTotal, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
                {content: formatNumberData(totalTotal), styles: {fontStyle: 'bold', fontSize: 11.5}},
              ]);

              bodyPrint.push([]);
            }
            
            bodyPrint.push([
              {content: 'GRANDTOTAL', styles: {fontStyle: 'bold', fontSize: 11.5}}, 
              null,
              {content: formatNumberData(GRANDTOTALAmt), styles: {fontStyle: 'bold', fontSize: 11.5}}, 
              {content: GRANDTOTALQty, styles: {fontStyle: 'bold', fontSize: 11.5}}, 
              {content: formatNumberData(GRANDTOTALTotal), styles: {fontStyle: 'bold', fontSize: 11.5}},
            ]);

            tableBlock(doc, 47, columnStyles, headers, bodyPrint, false, {
              halign: 'right'
            }, true);
            //#endregion
          }
          //#endregion

          //#region: HAS SELECTED DINETYPE
          if (trndteValues.length > 0 && trndteValues[0][0].postypefile) {

            // formatItemGrpByDate sample data
            //   {
            //     "2024-05-09": {
            //         "DINE IN": {
            //             "1-pc Chickenjoy": {
            //                 "amt": 200,
            //                 "qty": 2,
            //                 "total": 200
            //             },
            //             "1-pc Chickenjoy Meal": {
            //                 "amt": 95,
            //                 "qty": 1,
            //                 "total": 95
            //             },
            //             "1-pc Chickenjoy w/ Jolly Spaghetti": {
            //                 "amt": 298.5,
            //                 "qty": 3,
            //                 "total": 298.5
            //             }
            //         }
            //     },
            // }

            const formatItemGrpByDate = Object.keys(groupedByTrndte).reduce((acc:any, date:any) => {
              acc[date] = groupedByTrndte[date].reduce((orderAcc:any, item:any) => {
                const postypdsc = item.postypefile.postypdsc;
                const itemName = item.itmdsc;
                const itemQty = item.itmqty*1;
                const itemPrice = item.untprc*1;
            
                if (!orderAcc[postypdsc]) {
                  orderAcc[postypdsc] = {};
                }
            
                if (!orderAcc[postypdsc][itemName]) {
                  orderAcc[postypdsc][itemName] = { amt: 0, qty: 0, total: 0 };
                }
            
                orderAcc[postypdsc][itemName].amt += itemPrice;
                orderAcc[postypdsc][itemName].qty += itemQty;
                orderAcc[postypdsc][itemName].total += itemPrice * itemQty;
            
                return orderAcc;
              }, {});
            
              return acc;
            }, {});

            // group by postrntyp - ordocnum
            const grpByPosOrdocnum: Record<string, Record<string, Record<string, { amt: number; qty: number; total: number }>>> = {};
            Object.keys(groupedByTrndte).forEach(date => {
              groupedByTrndte[date].forEach((entry: any) => {
                const postypdsc = entry.postypefile.postypdsc;
                const orderNum = receiptDefiner(syspar.data[0].receipt_title!, entry.ordocnum);
                const quantity = entry.itmqty*1;
                const amount = entry.untprc*1;

                if (!grpByPosOrdocnum[postypdsc]) {
                  grpByPosOrdocnum[postypdsc] = {};
                }
          
                if (!grpByPosOrdocnum[postypdsc][date]) {
                  grpByPosOrdocnum[postypdsc][date] = {};
                }
          
                if (!grpByPosOrdocnum[postypdsc][date][orderNum]) {
                  grpByPosOrdocnum[postypdsc][date][orderNum] = { amt: 0, qty: 0, total: 0 };
                  console.log("xxxgrpByPosOrdocnum", quantity, amount);
                }

                grpByPosOrdocnum[postypdsc][date][orderNum].amt += amount;
                grpByPosOrdocnum[postypdsc][date][orderNum].qty += quantity;
                grpByPosOrdocnum[postypdsc][date][orderNum].total += amount * quantity;
              });
            });

            // PRINTING DATA TO PDF
            const bodyPrint: any = [];
            let grandAmtTotal = 0;
            let grandQtyTotal = 0;
            let grandTotalTotal = 0;
            Object.keys(formatItemGrpByDate).forEach(date => {
              // Add date header
              bodyPrint.push([
                {
                  "content": date,
                  "styles": { "fontStyle": "bold" }
                }
              ]);
          
              Object.keys(formatItemGrpByDate[date]).forEach(orderType => {
                // Add order type header
                bodyPrint.push([
                  {
                    "content": `\t${orderType}`,
                    "styles": { "fontStyle": "bold" }
                  }
                ]);

                bodyPrint.push([
                  {
                    "content": `\tOthers`,
                    "styles": { "fontStyle": "bold" }
                  }
                ]);
          
                let orderTypeTotalAmt = 0;
                let orderTypeTotalQty = 0;
                let orderTypeTotal = 0;
          
                Object.keys(formatItemGrpByDate[date][orderType]).forEach(itemName => {
                  const item = formatItemGrpByDate[date][orderType][itemName];
                  orderTypeTotalAmt += item.amt;
                  orderTypeTotalQty += item.qty;
                  orderTypeTotal += item.total;
          
                  // Add item details
                  bodyPrint.push([
                    `\t\t${itemName}`,
                    null,
                    item.amt.toFixed(2),
                    item.qty,
                    item.total.toFixed(2)
                  ]);
                });
          
                // Add subtotal for order type
                bodyPrint.push([
                  {
                    "content": `\tOthers`,
                    "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                  },
                  null,
                  {
                    "content": orderTypeTotalAmt.toFixed(2),
                    "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                  },
                  {
                    "content": orderTypeTotalQty,
                    "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                  },
                  {
                    "content": orderTypeTotal.toFixed(2),
                    "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                  }
                ]);
              });
          
              // Add grand total for the date
              const dateTotals: any = Object.values(formatItemGrpByDate[date]).reduce((totals:any, orderType:any) => {
                Object.values(orderType).forEach((item:any) => {
                  totals.amt += item.amt;
                  totals.qty += item.qty;
                  totals.total += item.total;
                });
                return totals;
              }, { amt: 0, qty: 0, total: 0 });

              grandAmtTotal += dateTotals.amt;
              grandQtyTotal += dateTotals.qty;
              grandTotalTotal += dateTotals.total;

              bodyPrint.push([
                {
                  "content": date,
                  "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                },
                null,
                {
                  "content": dateTotals.amt.toFixed(2),
                  "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                },
                {
                  "content": dateTotals.qty,
                  "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                },
                {
                  "content": dateTotals.total.toFixed(2),
                  "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                }
              ]);

              bodyPrint.push([]);
            });

            // Add grand total for all dates
            bodyPrint.push([
              {
                "content": "GRANDTOTAL",
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              null,
              {
                "content": grandAmtTotal.toFixed(2),
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              {
                "content": grandQtyTotal,
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              {
                "content": grandTotalTotal.toFixed(2),
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              }
            ]);

            bodyPrint.push([]);
            bodyPrint.push([]);


            // PRINTING ORDOCNUM
            let grandAmtTotalOR = 0;
            let grandQtyTotalOR = 0;
            let grandTotalTotalOR = 0;
            Object.keys(grpByPosOrdocnum).forEach(orderType => {
              // Add order type header
              bodyPrint.push([
                {
                  "content": orderType,
                  "styles": { "fontStyle": "bold" }
                }
              ]);

              bodyPrint.push([
                {
                  "content": "\tOthers",
                  "styles": { "fontStyle": "bold" }
                }
              ]);
          
              Object.keys(grpByPosOrdocnum[orderType]).forEach(date => {

                // Add date header
                bodyPrint.push([
                  {
                    "content": "\t\t" + date,
                    "styles": { "fontStyle": "bold" }
                  }
                ]);
          
                Object.keys(grpByPosOrdocnum[orderType][date]).forEach(orderNum => {
                  const order = grpByPosOrdocnum[orderType][date][orderNum];
                  // Add order details
                  bodyPrint.push([
                    "\t\t\t" + orderNum,
                    null,
                    order.amt.toFixed(2),
                    order.qty,
                    order.total.toFixed(2)
                  ]);
                });

                // Add subtotal for the date
                const dateTotals: any = Object.values(grpByPosOrdocnum[orderType][date]).reduce((totals:any, order:any) => {
                  totals.amt += order.amt;
                  totals.qty += order.qty;
                  totals.total += order.total;
                  return totals;
                }, { amt: 0, qty: 0, total: 0 });

                grandAmtTotalOR += dateTotals.amt;
                grandQtyTotalOR += dateTotals.qty;
                grandTotalTotalOR += dateTotals.total;

                bodyPrint.push([
                  {
                    "content": "\t\t" + date,
                    "styles": { "fontStyle": "bold" }
                  },
                  null,
                  {
                    "content": dateTotals.amt.toFixed(2),
                    "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                  },
                  {
                    "content": dateTotals.qty,
                    "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                  },
                  {
                    "content": dateTotals.total.toFixed(2),
                    "styles": { "fontStyle": "bold", "fontSize": 11.5 }
                  }
                ]);
          
                // Add empty row for separation
                bodyPrint.push([]);
              });
            });

            // Others
            bodyPrint.push([
              {
                "content": "Others",
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              null,
              {
                "content": grandAmtTotalOR.toFixed(2),
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              {
                "content": grandQtyTotalOR,
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              {
                "content": grandTotalTotalOR.toFixed(2),
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              }
            ]);

            // Add grand total for all dates
            bodyPrint.push([
              {
                "content": "GRANDTOTAL",
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              null,
              {
                "content": grandAmtTotalOR.toFixed(2),
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              {
                "content": grandQtyTotalOR,
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              },
              {
                "content": grandTotalTotalOR.toFixed(2),
                "styles": { "fontStyle": "bold", "fontSize": 11.5 }
              }
            ]);

            tableBlock(doc, 47, columnStyles, headers, bodyPrint, false, {
              halign: 'right'
            }, true);
            
          }
          //#endregion

        }
        
        // titleBlock(doc, "Free Items / Transactions", 43);
        MRSaving(report, doc);
      }
    }

    const generateSeniorCitizen = (doc: any, history: any, report: any) => {
        let headers: any[] = ["Date", "Name of Senior Citizen(SC)", "OSCA ID No./SC ID No.", "SC Tin", "SI/INV Number", "Sales (inclusive of VAT)", "VAT Amount", "Vat Exempt Sales","Discount", "Net Sales"]

        const columnStyles = {
            0: {cellWidth: 25},
            1: {cellWidth: 'auto', halign: "right"},
            2: {cellWidth: 20, halign: "right"},
            3: {cellWidth: 'auto', halign: "right"},
            4: {cellWidth: 'auto', halign: "right"},
            5: {cellWidth: 20, halign: "right"},
            6: {cellWidth: 'auto', halign: "right"},
            7: {cellWidth: 'auto', halign: "right"},
            8: {cellWidth: 'auto', halign: "right"},
            9: {cellWidth: 'auto', halign: "right"},
        }

        if(history){

            const filterTotal = history.filter((his: any) => his.postrntyp == "TOTAL");
            
            history = history.filter((his: any) => his.itmcde == "Senior");

            if (history.length === 0) {
              const bodyPrint = [];
              bodyPrint.push(["N/A", "N/A", "N/A", "N/A", "N/A", "0.00", "0.00", "0.00", "0.00", "0.00"]);
              headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Senior Citizen Discounts Report");
              tableBlock(doc, 55, columnStyles, headers, bodyPrint, false, {
                  halign: 'right'
              }, true);
              MRSaving(report, doc);
              return;
            }

            history = history.reduce((acc: any, cur: any) => {
    
                const findTotal = filterTotal.find((d:any) => d.ordocnum == cur.ordocnum);
                console.log("tang", findTotal, cur.ordocnum);
                const ordocnum = receiptDefiner(syspar.data[0].receipt_title!, cur.ordocnum);
                if(!acc[ordocnum]){
                    acc[ordocnum] = {
                        trndte: cur.trndte,
                        cardholder: cur.cardholder,
                        cardno: cur.cardno,
                        tin: cur.tin,
                        ordocnum: ordocnum,
                        sales: findTotal.groext*1,
                        vatamt: 0,
                        vatexempt: 0,
                        amtdis: 0,
                        netSales: 0,
                        lessvat: 0
                    }
                }

                acc[ordocnum].vatamt += cur.vatamt*1;
                acc[ordocnum].vatexempt += cur.vatexempt*1;
                acc[ordocnum].amtdis += cur.amtdis*1;
                acc[ordocnum].lessvat += cur.lessvat*1;
                acc[ordocnum].netSales = (findTotal.groext*1) - acc[ordocnum].amtdis - acc[ordocnum].lessvat;

                return acc;

            },{});


            // history = history.map((his: any) => {


            //     const findTotal = filterTotal.find((d:any) => d.ordocnum == his.ordocnum);

            //     console.log("may nahanap ba?", findTotal);

            //     return {
            //         vatamt: his.vatamt*1,
            //         vatexempt: his.vatexempt*1,
            //         discount: his.amtdis*1,
            //         netSales: (findTotal.groext*1) - (his.amtdis * 1) - (his.lessvat * 1)
            //     }
            // });

            console.log('fetchedHistory', history);

            // const formattedValues = 

            //-------------------------------------------------
            const returnHistory = Object.values(history);
            const mapObj = returnHistory.map((d: any) => Object.values(d));
            const returnObj = mapObj.map((d: any) => Object.values(d).map(data => formatNumberData(data)))

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Senior Citizen Discounts Report");

            tableBlock(doc, 55, columnStyles, headers, returnObj, false, {
                halign: 'right'
            }, true);

            
        MRSaving(report, doc);

        }


    } 
    
    const generatePWD = (doc: any, history: any, report: any) => {
        let headers: any[] = ["Date", "Name of Person with Disablity(PWD)", "PWD ID No.", "PWD Tin", "SI/INV Number", "Sales (inclusive of VAT)", "VAT Amount", "Vat Exempt Sales","Discount", "Net Sales"]

        const columnStyles = {
            0: {cellWidth: 25},
            1: {cellWidth: 'auto', halign: "right"},
            2: {cellWidth: 20, halign: "right"},
            3: {cellWidth: 'auto', halign: "right"},
            4: {cellWidth: 'auto', halign: "right"},
            5: {cellWidth: 20, halign: "right"},
            6: {cellWidth: 'auto', halign: "right"},
            7: {cellWidth: 'auto', halign: "right"},
            8: {cellWidth: 'auto', halign: "right"},
            9: {cellWidth: 'auto', halign: "right"},
        }



        if(history){
            const filterTotal = history.filter((his: any) => his.postrntyp == "TOTAL");
            history = history.filter((his: any) => his.itmcde == "PWD");

            if (history.length === 0) {
              const bodyPrint = [];
              bodyPrint.push(["N/A", "N/A", "N/A", "N/A", "N/A", "0.00", "0.00", "0.00", "0.00", "0.00"]);
              headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "PWD Discounts Report");
              tableBlock(doc, 55, columnStyles, headers, bodyPrint, false, {
                  halign: 'right'
              }, true);
              MRSaving(report, doc);
              return;
            }

            history = history.reduce((acc: any, cur: any) => {
    
                const findTotal = filterTotal.find((d:any) => d.ordocnum == cur.ordocnum);
                console.log("tang", findTotal, cur.ordocnum);
                const ordocnum = receiptDefiner(syspar.data[0].receipt_title!, cur.ordocnum);
                if(!acc[ordocnum]){
                    acc[ordocnum] = {
                        trndte: cur.trndte,
                        cardholder: cur.cardholder,
                        cardno: cur.cardno,
                        tin: cur.tin,
                        ordocnum: ordocnum,
                        sales: findTotal.groext*1,
                        vatamt: 0,
                        vatexempt: 0,
                        amtdis: 0,
                        netSales: 0,
                        lessvat: 0
                    }
                }

                acc[ordocnum].vatamt += cur.vatamt*1;
                acc[ordocnum].vatexempt += cur.vatexempt*1;
                acc[ordocnum].amtdis += cur.amtdis*1;
                acc[ordocnum].lessvat += cur.lessvat*1;
                acc[ordocnum].netSales = (findTotal.groext*1) - acc[ordocnum].amtdis - acc[ordocnum].lessvat;

                return acc;

            },{});

            console.log('fetchedHistory', history);

            // const formattedValues = 
            const returnHistory = Object.values(history);
            const mapObj = returnHistory.map((d: any) => Object.values(d));
            const returnObj = mapObj.map((d: any) => Object.values(d).map(data => formatNumberData(data)))

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "PWD Discounts Report");

            tableBlock(doc, 55, columnStyles, headers, returnObj, false, {
                halign: 'right'
            }, true);

            
        MRSaving(report, doc);

        }  
    } 

    const generateAthletes = (doc: any, history: any, report: any) => {
        let headers: any[] = ["Date", "Name of National Athlete/Coach", "PNTSM ID. No.", "SI/INV Number", "Gross Sales", "Sales Discount", "Net Sales"]

        const columnStyles = {
            0: {cellWidth: 25},
            1: {cellWidth: 'auto', halign: "right"},
            2: {cellWidth: 20, halign: "right"},
            3: {cellWidth: 'auto', halign: "right"},
            4: {cellWidth: 'auto', halign: "right"},
            5: {cellWidth: 20, halign: "right"},
            6: {cellWidth: 'auto', halign: "right"},
        }

        if(history){

          const filterTotal = history.filter((his: any) => his.postrntyp == "TOTAL");
          history = history.filter((his: PosfileModel) => his.itmcde?.toLocaleLowerCase().includes("athlete"));

          if (history.length === 0) {
            const bodyPrint = [];
            bodyPrint.push(["N/A", "N/A", "N/A", "N/A", "N/A", "0.00", "0.00"]);
            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Athletes Discounts Report");
            tableBlock(doc, 55, columnStyles, headers, bodyPrint, false, {
                halign: 'right'
            }, true);
            MRSaving(report, doc);
            return;
          }

          // history = history.map((his: any) => {


          //     const findTotal = filterTotal.find((d:any) => d.ordocnum == his.ordocnum);

          //     console.log("may nahanap ba?", findTotal);

          //     return {
          //         trndte: his.trndte,
          //         cardholder: his.cardholder,
          //         cardno: his.cardno,
          //         ordocnum: his.ordocnum,
          //         sales: findTotal.groext*1,
          //         discount: his.amtdis * 1,
          //         netSales: (findTotal.groext*1) - (his.amtdis * 1) - (his.lessvat * 1)
          //     }
          // });

          history = history.reduce((acc: any, cur: any) => {
  
              const findTotal = filterTotal.find((d:any) => d.ordocnum == cur.ordocnum);
              const ordocnum = receiptDefiner(syspar.data[0].receipt_title!, cur.ordocnum);
              if(!acc[ordocnum]){
                  acc[ordocnum] = {
                      trndte: cur.trndte,
                      cardholder: cur.cardholder,
                      cardno: cur.cardno,
                      ordocnum: ordocnum,
                      sales: findTotal.groext*1,
                      amtdis: 0,
                      netSales: 0,
                      lessvat: 0
                  }
              }

              acc[ordocnum].amtdis += cur.amtdis*1;
              acc[ordocnum].lessvat += cur.lessvat*1;
              acc[ordocnum].netSales = (findTotal.groext*1) - acc[ordocnum].amtdis - acc[ordocnum].lessvat;

              return acc;

          },{});
          const returnHistory = Object.values(history);
          const mapObj = returnHistory.map((d: any) => Object.values(d));
          const returnObj = mapObj.map((d: any) => Object.values(d).map(data => formatNumberData(data)))

          headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Athletes Discounts Report");

          tableBlock(doc, 55, columnStyles, headers, returnObj, false, {
              halign: 'right'
          }, true);

        MRSaving(report, doc);

        }
    } 

    const generateDiplomat = (doc: any, history: any, report: any) => {
        let headers: any[] = ["Date", "Name of Diplomat", "Diplomat ID. No.", "SI/INV Number", "Gross Sales", "Sales Discount", "Net Sales"]

        const columnStyles = {
            0: {cellWidth: 25},
            1: {cellWidth: 'auto', halign: "right"},
            2: {cellWidth: 20, halign: "right"},
            3: {cellWidth: 'auto', halign: "right"},
            4: {cellWidth: 'auto', halign: "right"},
            5: {cellWidth: 20, halign: "right"},
            6: {cellWidth: 'auto', halign: "right"},
        }


        if(history){

            const filterTotal = history.filter((his: any) => his.postrntyp == "TOTAL");

            history = history.filter((his: any) => his.itmcde == "Diplomat");

            if (history.length === 0) {
              const bodyPrint = [];
              bodyPrint.push(["N/A", "N/A", "N/A", "N/A", "0.00", "0.00", "0.00"]);
              headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Diplomat Discounts Report");
              tableBlock(doc, 55, columnStyles, headers, bodyPrint, false, {
                  halign: 'right'
              }, true);
              MRSaving(report, doc);
              return;
            }

            history = history.reduce((acc: any, cur: any) => {
    
                const findTotal = filterTotal.find((d:any) => d.ordocnum == cur.ordocnum);
                const ordocnum = receiptDefiner(syspar.data[0].receipt_title!, cur.ordocnum);
                if(!acc[ordocnum]){
                    acc[ordocnum] = {
                        trndte: cur.trndte,
                        cardholder: cur.cardholder,
                        cardno: cur.cardno,
                        ordocnum: ordocnum,
                        sales: findTotal.groext*1,
                        amtdis: 0,
                        netSales: 0,
                        lessvat: 0
                    }
                }

                acc[ordocnum].amtdis += cur.amtdis*1;
                acc[ordocnum].lessvat += cur.lessvat*1;
                acc[ordocnum].netSales = (findTotal.groext*1) - acc[ordocnum].amtdis - acc[ordocnum].lessvat;

                return acc;

            },{});

            const returnHistory = Object.values(history);
            const mapObj = returnHistory.map((d: any) => Object.values(d));
            const returnObj = mapObj.map((d: any) => Object.values(d).map(data => formatNumberData(data)))

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Diplomat Discounts Report");

            tableBlock(doc, 55, columnStyles, headers, returnObj, false, {
                halign: 'right'
            }, true);

            
        MRSaving(report, doc);
        }
    } 

    const generatePerOrderTakerV2 = (doc: POSPdf, history: any, report: any) => {
      let headers: any[] = ["Date", "Order Type","Item Desc.", "Unit Price", "Qty", "Amount"]

        const columnStyles = {
            0: {cellWidth: 'auto'},
            1: {cellWidth: 'auto', halign: 'left'},
            2: {cellWidth: 'auto', halign: 'left'},
            3: {cellWidth: 'auto', halign: 'left'},
            4: {cellWidth: 'auto', halign: 'left'},
            5: {cellWidth: 'auto', halign: 'left'},
        }

        if (history) {
          if (history.length === 0) {
            const bodyToPrint = [];
            bodyToPrint.push(["N/A", "N/A", "N/A", "0.00", "0", "0.00"]);
            bodyToPrint.push([
              {content: 'SUBTOTAL', styles: {fontStyle: 'bold', fontSize: 10}},
              null,
              null,
              null,
              {content: "0", styles: {fontStyle: 'bold', fontSize: 10}},
              {content: "0.00", styles: {fontStyle: 'bold', fontSize: 10}},
            ]);
            bodyToPrint.push([]);
            bodyToPrint.push([
              {content: 'GRANDTOTAL', styles: {fontStyle: 'bold', fontSize: 11.5}},
              null,
              null,
              null,
              {content: "0", styles: {fontStyle: 'bold', fontSize: 11.5}},
              {content: "0.00", styles: {fontStyle: 'bold', fontSize: 10}},
            ]);

            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Per Order Taker Report");
            // titleBlock(doc,"Sales report per Day / Hour (Detailed)" ,40);
            tableBlock(doc, 50, columnStyles, headers, bodyToPrint, false, {
              halign: 'left'
            }, true);
            
            MRSaving(report, doc);
            return;
          }

          if (report.reportRepresentation == "detailed") {
            /*
              SAMPLE MOCK DATA
              {
                "2024-05-09": {
                  "USER_CODE" : [
                    {date: ... , ordertyp: ..., itmdsc: ..., untprc: ..., itmqty: ..., total: ...},
                  ]
                },
              }
            */

            // group by date
            const groupedByDate = history.reduce((acc: any, cur: PosfileModel) => {
              if (!acc[cur.trndte!]) {
                acc[cur.trndte!] = {};
              }
        
              if (!acc[cur.trndte!][cur.cashier!]) {
                acc[cur.trndte!][cur.cashier!] = [];
              }
        
              acc[cur.trndte!][cur.cashier!].push(cur);
              acc[cur.trndte!][cur.cashier!].sort((a: PosfileModel, b: PosfileModel) => {
                const aDate = new Date(a.trndte! + " " + a.logtim!);
                const bDate = new Date(b.trndte! + " " + b.logtim!);
                return aDate.getTime() - bDate.getTime();
              });
              return acc;
            }, {});

            // console.log("xxxgroupedByDate", groupedByDate);
            
            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            const bodyPrint: any = [];
            let grandTotal = 0;
            let grandQty = 0;
            for (const date of sortedDates) {
              const dateGroup = groupedByDate[date];
              const cashiers = Object.keys(dateGroup);

              let subTotal = 0;
              let subTotalQty = 0;

              for (const cashier of cashiers) {
                const cashierItems = dateGroup[cashier];

                bodyPrint.push([
                  {content: cashier, styles: {fontStyle: 'bold', fontSize: 10}},
                ]);

                for (const item of cashierItems) {
                  const row = [
                    moment(new Date(date + " " + item.logtim)).format("YYYY-MM-DD hh:mm:ss A"),
                    item.ordertyp,
                    item.itemfile.itmdsc,
                    formatNumberData(item.untprc*1),
                    parseInt(item.itmqty),
                    formatNumberData((item.untprc*1) * (item.itmqty*1)),
                  ];
                  
                  subTotal += row[5]*1;
                  subTotalQty += row[4];
                  bodyPrint.push(row);
                }
              }

              grandTotal += subTotal;
              grandQty += subTotalQty;

              bodyPrint.push([
                {content: 'SUBTOTAL', styles: {fontStyle: 'bold', fontSize: 10}},
                null,
                null,
                null,
                {content: subTotalQty, styles: {fontStyle: 'bold', fontSize: 10}},
                {content: formatNumberData(subTotal), styles: {fontStyle: 'bold', fontSize: 10}},
              ]);
              bodyPrint.push([]);
            }

            bodyPrint.push([
              {content: 'GRANDTOTAL', styles: {fontStyle: 'bold', fontSize: 11.5}},
              null,
              null,
              null,
              {content: grandQty, styles: {fontStyle: 'bold', fontSize: 11.5}},
              {content: formatNumberData(grandTotal), styles: {fontStyle: 'bold', fontSize: 10}},
            ]);

            // printing
            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Per Order Taker Report - Detailed");
            // titleBlock(doc,"Sales report per Day / Hour (Detailed)" ,40);
            tableBlock(doc, 50, columnStyles, headers, bodyPrint, false, {
              halign: 'left'
            }, true);
            
            MRSaving(report, doc);
          }

          else {
            // SUMMARY REPORT
            /*
              SAMPLE MOCK DATA
              {
                "2024-05-09": {
                  "USER_CODE" : {
                    "1-pc Chickenjoy": {date: ..., ordertyp: ..., itmdsc: ..., untprc: ..., qty: ..., total: ...},
                  }
                },
              }
            */

            // group by date
            const groupedByDate = history.reduce((acc: any, cur: PosfileModel) => {
              if (!acc[cur.trndte!]) {
                acc[cur.trndte!] = {};
              }
        
              if (!acc[cur.trndte!][cur.cashier!]) {
                acc[cur.trndte!][cur.cashier!] = {};
              }
        
              if (!acc[cur.trndte!][cur.cashier!][cur.itemfile!.itmdsc!]) {
                acc[cur.trndte!][cur.cashier!][cur.itemfile!.itmdsc!] = {
                  date: cur.trndte,
                  ordertyp: cur.ordertyp,
                  itmdsc: cur.itemfile!.itmdsc,
                  untprc: formatNumberData(cur.untprc!*1),
                  qty: 0,
                  total: 0,
                };
              }
        
              acc[cur.trndte!][cur.cashier!][cur.itemfile!.itmdsc!].qty += cur.itmqty!*1;
              acc[cur.trndte!][cur.cashier!][cur.itemfile!.itmdsc!].total += (cur.untprc!*1) * (cur.itmqty!*1);
              return acc;
            }, {});

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            const bodyPrint: any = [];
            let grandTotal = 0;
            let grandQty = 0;
            for (const date of sortedDates) {
              const dateGroup = groupedByDate[date];
              const cashiers = Object.keys(dateGroup);

              let subTotal = 0;
              let subTotalQty = 0;

              for (const cashier of cashiers) {
                const cashierItems = dateGroup[cashier];
                const items = Object.values(cashierItems) as any;

                bodyPrint.push([
                  {content: cashier, styles: {fontStyle: 'bold', fontSize: 10}},
                ]);

                for (const item of items) {
                  bodyPrint.push([
                    date,
                    item.ordertyp,
                    item.itmdsc,
                    item.untprc,
                    item.qty,
                    formatNumberData(item.total),
                  ]);

                  subTotal += item.total*1;
                  subTotalQty += item.qty;
                }
              }

              grandTotal += subTotal;
              grandQty += subTotalQty;

              bodyPrint.push([
                {content: 'SUBTOTAL', styles: {fontStyle: 'bold', fontSize: 10}},
                null,
                null,
                null,
                {content: subTotalQty, styles: {fontStyle: 'bold', fontSize: 10}},
                {content: formatNumberData(subTotal), styles: {fontStyle: 'bold', fontSize: 10}},
              ]);
              bodyPrint.push([]);
            }

            bodyPrint.push([
              {content: 'GRANDTOTAL', styles: {fontStyle: 'bold', fontSize: 11.5}},
              null,
              null,
              null,
              {content: grandQty, styles: {fontStyle: 'bold', fontSize: 11.5}},
              {content: formatNumberData(grandTotal), styles: {fontStyle: 'bold', fontSize: 10}},
            ]);

            // printing
            headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Per Order Taker Report - Summarized");
            // titleBlock(doc,"Sales report per Day / Hour (Summary)" ,40);
            tableBlock(doc, 50, columnStyles, headers, bodyPrint, false, {
              halign: 'left'
            }, true);
            
            MRSaving(report, doc);
          }
        }
    }

    const generatePaymentByDinetype = (doc: POSPdf, history: any, report: any) => {
      console.log("xxxgeneratePaymentByDinetype:", history);
      
      if (history) {
        const columnStyles = {
          0: {cellWidth: 'auto'},
          1: {cellWidth: 'auto', halign: "right"},
          2: {cellWidth: 'auto', halign: "right"},
          3: {cellWidth: 'auto', halign: "right"},
          4: {cellWidth: 'auto', halign: "right"},
          5: {cellWidth: 'auto', halign: "right"},
          6: {cellWidth: 'auto', halign: "right"},
        }

        let headers: any[] = [syspar.data[0].receipt_title == 0?"OR NO.":"INV NO.", "DATE", "TIME" , syspar.data[0].receipt_title == 0?"OR AMOUNT":"INV AMOUNT", "PAYMENT TYPE", "POS TRMNL", "CASHIER"];

        if (history.length === 0) {
          const bodyToPrint = [];
          bodyToPrint.push(["N/A", "N/A", "N/A", "0.00", "N/A", "N/A", "N/A"]);
          headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Payment By Dinetype Report");
          tableBlock(doc, 50, columnStyles, headers, bodyToPrint, false, {
            halign: 'right'
          }, true);
          
          MRSaving(report, doc);
          return;
        }

        //#region WITH DINE TYPE
        if (history[0].postypefile) {
          // group by dine type
          // MOCK DATA
          // {
          //   "DINEIN": [{...}, {...}],
          // }
          history = history.reduce((acc: any, cur: any) => {
            const dineType = cur.postypefile.postypdsc;
            if (!acc[dineType]) {
              acc[dineType] = [];
            }

            acc[dineType].push(cur);
            return acc;
          }, {});

          headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Payment By Dinetype Report");
          
          let bodyPrint = [];
          for (const [dineType, dineTypeItems] of Object.entries(history)) {
            bodyPrint.push([
              {content: dineType, colSpan: 7, styles: {fontStyle: 'bold', fontSize: 10}},
              {content: ''}, {content: ''}, {content: ''}, {content: ''}, {content: ''}, {content: ''},
            ]);
            
            for (const item of dineTypeItems as PosfileModel[]) {
              bodyPrint.push([
                receiptDefiner(syspar.data[0].receipt_title!, item.ordocnum!),
                item.trndte,
                formatTimeTo12Hour(item.logtim!),
                formatNumberData(item.extprc!*1),
                item.itmcde,
                item.postrmno,
                item.cashier,
              ]);
            }
          }

          tableBlock(doc, 55, columnStyles, headers, bodyPrint, false, {
            halign: 'right'
          }, true);

          MRSaving(report, doc);
        }
        //#endregion
        else {
          //#region WITHOUT DINE TYPE
          headerBlock(doc, header.data[0].business1 || "", {add1:header.data[0].address1,add2:header.data[0].address2,add3:header.data[0].address3}, report.from, report.to, "Payment By Dinetype Report");

          let bodyPrint = [];
          for (const item of history) {
            bodyPrint.push([
              receiptDefiner(syspar.data[0].receipt_title!, item.ordocnum!),
              item.trndte,
              formatTimeTo12Hour(item.logtim!),
              formatNumberData(item.extprc!*1),
              item.itmcde,
              item.postrmno,
              item.cashier,
            ]);
          }

          tableBlock(doc, 55, columnStyles, headers, bodyPrint, false, {
            halign: 'right'
          }, true);

          MRSaving(report, doc);
          //#endregion
        }
      }
    }
    
    const MRSaving = (report: any, doc: any) => {

        

        if(report.isView){

            doc.output("dataurlnewwindow")

   
          }
  
          if(report.isSave){
            doc.save2(report.reportType+" "+report.from+" "+report.to);
          }
          
        
        modalDispatch();
    }

    // const generateSoloParent = (doc: any, history: any, report: any) => {
        
    // } 
    
    return {
        generatePaymentByDinetype,
        generateFreeTransaction,
        generateItemizedReport, 
        generateClassAndSubclassReport, 
        generateDailyDineType, 
        generateVoidTransactions,
        generateHourlySales,
        generatePerDayHourly,
        generateRefundByDate,
        generateRefundByPayment,
        generateRefundTransactions,
        generateCostAndProfit,
        generatePerOrderTakerV2,
        generateESales, 
        generateSalesSummary, // PARTIALLY DONE
        generateDailySales, // PARTIALLY DONE
        generatePaymentType, // DOIN
        generateSeniorCitizen,
        generatePWD,
        generateAthletes,
        generateDiplomat,
        // generateSoloParent
        // generateFree
    };

}

