import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextCostAndProfit(
  reportData: any,
  formValue: any,
  masterFiles: any
) {
  const reportTitle = "COST AND PROFIT ANALYSIS BY ITEM";
  let dataFile = "";
  if (masterFiles.header.business2) {
    dataFile += `${masterFiles.header.business2}\n`;
  }
  if (masterFiles.header.business3) {
    dataFile += `${masterFiles.header.business3}\n`;
  }
  dataFile += `${masterFiles.header.address1}\n`;
  if (masterFiles.header.address2) {
    dataFile += `${masterFiles.header.address2}\n`;
  }
  if (masterFiles.header.address3) {
    dataFile += `${masterFiles.header.address3}\n`;
  }
  dataFile += `\n\t\t\t${reportTitle}\n\n`;
  dataFile += `ITEMS\t\t\tQTY\tTOTAL SALES\t(-) VAT ADJ\t(-) GOV DISCOUNT\t(-) REG DISCOUNT\tTOTAL ITEMS SALES AMOUNT\tAVERAGE SALES AMOUNT\tCOST\tAVE. PROFIT\t% PROFIT\n`;

  let grandtotalQty = 0,
    grandtotalSales = 0,
    grandtotalVat = 0,
    grandtotalDisc = 0,
    grandtotalRegDisc = 0,
    grandtotalItemAmount = 0,
    grandtotalAveAMount = 0,
    grandtotalCost = 0,
    grandtotalAveProf = 0,
    grandtotalPercentProf = 0;

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    for (const [keyDine, arrayDine] of Object.entries(reportData)) {
      dataFile += `${
        masterFiles.dineType.find((e: any) => e.postypcde === keyDine).postypdsc
      }\n`;
      const xarrayDine: any = arrayDine;
      for (const xdata_val of Object.values(xarrayDine)) {
        const record: any = xdata_val;
        const averageSalesAmt = record["total"] / record["qty"];
        const averageProfit = record["total"] / record["qty"] - record["cost"];
        const profitPercentage =
          averageProfit > 0 ? (averageProfit / averageSalesAmt) * 100 : 0;

        grandtotalQty += Number(record["qty"]);
        grandtotalSales += Number(record["total"]);
        grandtotalVat += Number(record["vatadj"]);
        grandtotalDisc += Number(record["discount"]);
        grandtotalRegDisc += Number(record["regdiscount"]);
        grandtotalItemAmount += Number(record["amount"]);
        grandtotalAveAMount += Number(averageSalesAmt);
        grandtotalCost += Number(record["cost"]);
        grandtotalAveProf += Number(averageProfit);
        grandtotalPercentProf += Number(profitPercentage);

        dataFile += `${record["itmdsc"]}`;
        dataFile += `\t\t`;
        dataFile += `\t${numberFormat(record["qty"], 2)}`;
        dataFile += `\t${numberFormat(record["total"], 2)}`;
        dataFile += `\t${numberFormat(record["vatadj"], 2)}`;
        dataFile += `\t${numberFormat(record["discount"], 2)}`;
        dataFile += `\t${numberFormat(record["regdiscount"], 2)}`;
        dataFile += `\t${numberFormat(record["amount"], 2)}`;
        dataFile += `\t${numberFormat(averageSalesAmt, 2)}`;
        dataFile += `\t${numberFormat(record["cost"], 2)}`;
        dataFile += `\t${numberFormat(averageProfit, 2)}`;
        dataFile += `\t${numberFormat(profitPercentage, 2)}`;
        dataFile += `\n`;
      }
    }
  } else {
    for (const xdata_val of Object.values(reportData)) {
      const record: any = xdata_val;
      const averageSalesAmt = record["total"] / record["qty"];
      const averageProfit = record["total"] / record["qty"] - record["cost"];
      const profitPercentage =
        averageProfit > 0 ? (averageProfit / averageSalesAmt) * 100 : 0;

      grandtotalQty += Number(record["qty"]);
      grandtotalSales += Number(record["total"]);
      grandtotalVat += Number(record["vatadj"]);
      grandtotalDisc += Number(record["discount"]);
      grandtotalRegDisc += Number(record["regdiscount"]);
      grandtotalItemAmount += Number(record["amount"]);
      grandtotalAveAMount += Number(averageSalesAmt);
      grandtotalCost += Number(record["cost"]);
      grandtotalAveProf += Number(averageProfit);
      grandtotalPercentProf += Number(profitPercentage);

      dataFile += `${record["itmdsc"]}`;
      dataFile += `\t\t`;
      dataFile += `\t${numberFormat(record["qty"], 2)}`;
      dataFile += `\t${numberFormat(record["total"], 2)}`;
      dataFile += `\t${numberFormat(record["vatadj"], 2)}`;
      dataFile += `\t${numberFormat(record["discount"], 2)}`;
      dataFile += `\t${numberFormat(record["regdiscount"], 2)}`;
      dataFile += `\t${numberFormat(record["amount"], 2)}`;
      dataFile += `\t${numberFormat(averageSalesAmt, 2)}`;
      dataFile += `\t${numberFormat(record["cost"], 2)}`;
      dataFile += `\t${numberFormat(averageProfit, 2)}`;
      dataFile += `\t${numberFormat(profitPercentage, 2)}`;
      dataFile += `\n`;
    }
  }
  dataFile += `\n\n`;
  dataFile += `TOTAL`;
  dataFile += `\t\t`;
  dataFile += `\t${numberFormat(grandtotalQty, 2)}`;
  dataFile += `\t${numberFormat(grandtotalSales, 2)}`;
  dataFile += `\t${numberFormat(grandtotalVat, 2)}`;
  dataFile += `\t${numberFormat(grandtotalDisc, 2)}`;
  dataFile += `\t${numberFormat(grandtotalRegDisc, 2)}`;
  dataFile += `\t${numberFormat(grandtotalItemAmount, 2)}`;
  dataFile += `\t${numberFormat(grandtotalAveAMount, 2)}`;
  dataFile += `\t${numberFormat(grandtotalCost, 2)}`;
  dataFile += `\t${numberFormat(grandtotalAveProf, 2)}`;
  dataFile += `\t${numberFormat(grandtotalPercentProf, 2)}`;

  return dataFile;
}
