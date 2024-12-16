import autoTable from "jspdf-autotable";
import moment from "moment";
import POSPdf from "../pdf/POSPdf";

export const headerBlock = (doc: POSPdf, company: string, address: {add1?:string; add2?:string; add3?:string}, dateFrom: string, dateTo: string, reportTitle?: string) => {

    let y = 10;

    doc.setFontSize(14);
    doc.text2(company, 16, y);
    doc.setFontSize(13);

    reportTitle && doc.text2(reportTitle, 16, y+=5);
    doc.setFontSize(8);
    address.add1 && doc.text2(address.add1, 16, y+=5);
    address.add2 && doc.text2(address.add2, 16, y+=5);
    address.add3 && doc.text2(address.add3, 16, y+=5);
    doc.text2(`Date From: ${moment(dateFrom).format('MM-DD-YYYY')} To: ${moment(dateTo).format('MM-DD-YYYY')}`, 16, y+=5);
    doc.text2(`Date Printed: ${moment(new Date()).format('MM-DD-YYYY hh:mm A')}`, 16, y+=5);
}


export const itemizedHeaderBlock = (doc: any, title: string, address: string, dateFrom: string, dateTo: string, hideOperated?: boolean, title2?: string, reportTitle?: string, business1?: string, business2?: string, address2?:string) => {

    doc.setFontSize(14);
    doc.text(title, 16, 10);
    
    doc.setFontSize(12);
    if (!hideOperated && title2) {
        reportTitle && doc.text(reportTitle, 16, 15);
        doc.setFontSize(8);
        doc.text(`${business1}`, 16, 20);
        doc.text(`${business2}`, 16, 25);
        doc.text(`${address}`, 16, 30);
        doc.text(`${address2}`, 16, 35);
        doc.text(`Date From: ${moment(dateFrom).format('MM-DD-YYYY')} To: ${moment(dateTo).format('MM-DD-YYYY')}`, 16, 40);
        doc.text(`Date Printed: ${moment(new Date()).format('MM-DD-YYYY hh:mm A')}`, 16, 45);
    }
    else {
        reportTitle && doc.text(reportTitle, 16, 15);
        doc.setFontSize(8);
        doc.text(`${business1}`, 16, 20);
        doc.text(`${business2}`, 16, 25);
        doc.text(`${address}`, 16, 30);
        doc.text(`${address2}`, 16, 35);
        doc.text(`Date From: ${moment(dateFrom).format('MM-DD-YYYY')} To: ${moment(dateTo).format('MM-DD-YYYY')}`, 16, 40);
        doc.text(`Date Printed: ${moment(new Date()).format('MM-DD-YYYY hh:mm A')}`, 16, 45);
    }
}

export const leftTitleBlock = (doc: any, content: string, x: number, y: number) => {
    doc.text(content, x, y)
}

// Creation of header block

export const titleBlock = (doc: any, content: string, position: number) => {

    console.log(doc);
    const center = doc.internal.pageSize.getWidth()/2;
    doc.setFontSize(12);
    doc.text2(content, center, position, 'center');

}

export const tableBlock = (doc: POSPdf, startY: number, columnStyles: any, headers: any[], body: any[], isLastRowBold?: boolean, headStyles?: any, isFirstColOnlyLeft?: boolean, headerLeft?:number[]) => {
    doc.autoTableCSVTextBody(headers, body);
    
    autoTable(doc, {
        startY: startY,
        columnStyles : columnStyles,
        styles: {overflow: 'linebreak', cellWidth: 'wrap'},
        head: [headers],
        body:body,
        headStyles: headStyles,
        // headStyles: {halign: 'right'},
        didParseCell: function(data: any) {
            const {table, row, cell, column} = data;
            if(isLastRowBold){
    
                if(row.index === table.body.length - 1){
                    cell.styles.fontStyle = 'bold';
                }
            }


            if(isFirstColOnlyLeft){
                if(column.index == 0){
                    cell.styles.halign = 'left'
                }
            }

        },
        willDrawPage: (data) => {

            const {table} = data;

            table.head[0].cells[0].styles.halign = "left";
            if(headerLeft && headerLeft?.length>0){
                
                headerLeft.forEach((el: number) => {
                    
                    table.head[0].cells[el].styles.halign = "left";
                });

            // Converting the quantity element to a string just to remove the trailing 0.
            // grandTotalArray[1] = grandTotalArray[1].toString().split(".")[0]
            }

        }
    })
}

export const horizontalTableBlock = (doc: any, startY: number, body: any[],columnStyles?: any, isLastRowBold?: boolean) => {
    doc.autoTableCSVTextBody([], body);
    autoTable(doc, {
        startY: startY,
        styles: {overflow: 'linebreak', cellWidth: 'wrap'},
        columnStyles : columnStyles,
        body:body,
        showHead: 'never',
        didParseCell: function(data: any) {

        const {table, row, cell, /*column*/} = data;

            if (data.row.index === 0) {
                cell.styles.fontStyle = 'bold';
            }

            if(isLastRowBold){
    
                if(row.index === table.body.length - 1){
                    cell.styles.fontStyle = 'bold';
                }
            }
        }
    });
}

// export const horizontalTableBlock = (doc: any, startY: number, headers: any[], body: any) => {

// }

export const summaryRow = (fontSize: number, contents: string[]) => {


    if(contents.length ===0 )
        return [];

    return contents.map(d => {
        return { content: d, fontSize: fontSize, fontStyle: 'bold' }
    })
}

