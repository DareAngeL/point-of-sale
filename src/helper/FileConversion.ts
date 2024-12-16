import {saveAs} from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import moment from "moment";

export const convertCSV = (data: any, filename: string) => {
  
  const csvContent = data.map((row: any) => {
    if (typeof row === "string") {
      return row;
    }

    return row.join(",");
  }).join("\n");

  const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8"});

  saveAs(blob, filename);
};
export const convertText = (data: any, filename: string) => {
  const textData = data
    .map((row: any) =>{
      if (typeof row === "string") return row;
      return row.map((item: any) => (item === "" ? " " : item)).join(" ")
    })
    .join("\n");

  // const textData = data;
  const blob = new Blob([textData], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename);
};

export const convertPDF = (htmlContent: string, filename: string) => {
  // Create a new jsPDF instance with legal paper size
  const doc = new jsPDF({
    orientation: "portrait", // You can change to 'landscape' if needed
    unit: "in", // Set units to inches
    format: [8.5, 14], // Legal paper size (8.5 x 14 inches)
  });

  // Create a temporary container element and set the HTML content
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  // container.style.opacity = "0";
  container.style.position = "absolute";
  container.style.left = "-220px";
  container.style.top = "-2000px";

  // Append the container to the document body (make it part of the DOM)
  document.body.appendChild(container);

  // Use html2canvas to convert the container to an image
  html2canvas(container)
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Remove the temporary container from the DOM
      document.body.removeChild(container);

      // Calculate dimensions while preserving aspect ratio
      const width = 8.5; // Width of the PDF page in inches
      const aspectRatio = canvas.width / canvas.height;
      const height = width / aspectRatio;

      // Add the image to the PDF, preserving aspect ratio
      doc.addImage(imgData, "PNG", 0, 0, width, height);

      // Save or download the PDF
      doc.save(filename);
      console.log(`PDF saved as ${filename}`);
    })
    .catch((error) => {
      console.error("Error while capturing HTML to PDF:", error);
    });
};

export function convertHtmlToPdf(htmlContent: string) {
  console.log(htmlContent);

  // const pdf = new jsPDF();
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    pdf.html(htmlContent, {
      callback: (pdf) => {
        // Generate a Data URI from the PDF document
        const pdfDataUri = pdf.output("datauristring");
        resolve(pdfDataUri);
      },
    });
  });
}

export function fixBase64String(base64String: string) {
  // Remove non-Base64 characters
  // Remove the URI prefix
  let cleanUri = base64String.replace(/^[^,]+,/, "");

  // Remove non-Base64 characters
  let cleanBase64 = cleanUri.replace(/[^A-Za-z0-9+/=]/g, "");

  // Add padding if necessary
  while (cleanBase64.length % 4 !== 0) {
    cleanBase64 += "=";
  }

  return cleanBase64;
}

export function downloadBase64AsPDF(base64String: string, fileName: string) {
  // Create a Blob from the base64 string
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {type: "application/pdf"});

  // Create a download link and trigger the download
  const a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = fileName || "document.pdf"; // You can set the default filename here
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
export function formatDataForReceipt(header: any, xread: any) {
  console.log(header, xread);

  const transformedDiscounts = xread.discounts.flatMap(
    (disc: {discde: any; qty: any; amtdis: number}) => {
      const rows: string[] = [];
      if (disc.discde) {
        rows.push(`${disc.discde}`);
        rows.push(`${disc.qty}`, "", `${disc.amtdis.toFixed(2)}`);
      }
      return rows;
    }
  );
  const transformedCardSales = xread.card_sales.flatMap((card: any) => {
    const result = [];
    result.push([`Credit Card: ${card.cardtype}`]);
    card.cardList.forEach((item: any) => {
      result.push([
        item.cardclass,
        item.qty.toString(),
        item.amount.toFixed(2),
      ]);
    });
    return result;
  });

  const transformedDataOtherMop = xread.othermop.map((mop: any) => {
    return [mop.paymenttype, mop.qty.toString(), mop.amount.toString()];
  });

  const headerTemplate = [
    [""],
    [""],
    [""],
    ["", `${header.business1}`, ""],
    ["", `${header.business2}`, ""],
    ["", `${header.business3}`, ""],
    ["", `${header.tin}`, ""],
    ["", `${header.address1}`, ""],
    ["", `${header.address2}`, ""],
    ["", `${header.address3}`, ""],
    ["", `MIN#${header.machineno} SN#${header.serialno}`, ""],
    [""],
    ["", "X-Reading", ""],
    [""],
    ["", `${moment().format("MMM-DD-YYYY")}`, ""],
    [""],
    ["Cashier:", "", `${xread.cashier}`],
    [""],
  ];

  const salesTemplate = [
    ["Gross Sales", "", `${xread.sales_summ.gross_sales.toFixed(2)}`],
    ["Less Paid Void", "", `${xread.sales_summ.less_post_void.toFixed(2)}`],
    ["Less Paid Refund", "", `${xread.sales_summ.less_post_refund.toFixed(2)}`],
    ["Less Discount", "", `${xread.sales_summ.less_disc.toFixed(2)}`],
    [
      "Less Service Charge",
      "",
      `${xread.sales_summ.less_serv_charge.toFixed(2)}`,
    ],
    ["Less VAT Adj", "", `${xread.sales_summ.less_vat_adj.toFixed(2)}`],
    ["Net Sales WVAT", "", `${xread.sales_summ.net_sales.toFixed(2)}`],
    [
      "Net Sales W/O Vat",
      "",
      `${xread.sales_summ.vat_exempt_net.toFixed(2)}`,
    ],
    ["Total Vat Sales", "", `${xread.sales_summ.total_vat_sales.toFixed(2)}`],
    ["Total Vat Amount", "", `${xread.sales_summ.vat_amount.toFixed(2)}`],
    ["Local Tax 0%", "", `${xread.sales_summ.localtax.toFixed(2)}`],
    ["Local Vat Exempt", "", `${xread.sales_summ.total_vat_exempt.toFixed(2)}`],
    [
      "Total # of Transaction",
      "",
      `${xread.sales_summ.total_numtrans.toFixed(2)}`,
    ],
    ["Total # of Pax", "", `${xread.sales_summ.total_numpax.toFixed(2)}`],
    ["Total Quantity", "", `${xread.sales_summ.total_quantity.toFixed(2)}`],
    [""],
    ["", "Discounts", ""],
    [""],
    ...transformedDiscounts,
    [""],
    ["CASH"],
    [
      `${xread.cash_tran_summ.cash.qty}`,
      "",
      `${xread.cash_tran_summ.cash.cashsales.toFixed(2)}`,
    ],
    [""],
    ["Cash Fund", "", `${xread.cash_tran_summ.cashfund.toFixed(2)}`],
    ["Cash In", "", `${xread.cash_tran_summ.cash_in.toFixed(2)}`],
    ["Cash Out", "", `${xread.cash_tran_summ.cash_out.toFixed(2)}`],
    ["Cash Drawer", "", `${xread.cash_tran_summ.end_cash.toFixed(2)}`],
    ["POS CASH", "", `${xread.cash_tran_summ.pos_cash.toFixed(2)}`],
    ["Declaration", "", `${xread.cash_tran_summ.exp_cash.toFixed(2)}`],
    ["Short/Over", "", `${xread.cash_tran_summ.shortover.toFixed(2)}`],
    ["Excess", "", `${xread.cash_tran_summ.excess.toFixed(2)}`],
    [""],
    ["", "Card Sales", ""],
    [""],
    ...transformedCardSales,
    [""],
    ["", "Other Mop Sales", ""],
    [""],
    ...transformedDataOtherMop,
    [""],
    ["Beginning OR", "", `${xread.docnum_summ.beg_or}`],
    [""],
    [""],
    ["Ending OR", "", `${xread.docnum_summ.end_or}`],
    [""],
    [`${moment().format("MMM-DD-YYYY hh:mm:ss A")}`, ""],
    ["", "End of Cashier's Report", ""],
    [""],
  ];

  const completeTemplate = [...headerTemplate, ...salesTemplate];
  console.log(completeTemplate);

  return completeTemplate;
}

export function roundDecimalPlaces(items: any[], properties: string[]) {
  // Iterate through the array and update decimal places for specified properties
  for (let i = 0; i < items.length; i++) {
    for (const prop of properties) {
      if (items[i][prop] !== null && items[i][prop] !== undefined) {
        items[i][prop] = parseFloat(items[i][prop]).toFixed(2);
      }
    }
  }
  return items;
}
