import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextVoidTransaction(
  reportData: any,
  masterFiles: any
) {
  let GrandAmnt = 0,
    GrandTotal = 0;

  const reportTitle = "Post Void Transactions";
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
  dataFile += `Date/Time\tTable\tOR#\tGross\tNet\tReason\n`;

  for (const record of reportData) {
    dataFile += `${record["trndte"]} ${record["logtim"]}`;
    dataFile += `\t${record["tablecde"]}`;
    dataFile += `\t${record["ordocnum"]}`;
    dataFile += `\t${numberFormat(record["groext"], 2)}`;
    dataFile += `\t${numberFormat(record["extprc"], 2)}`;
    dataFile += `\t${record["voidreason"]}`;
    dataFile += `\n`;

    GrandAmnt += record["groext"];
    GrandTotal += record["extprc"];
  }
  dataFile += `\nGRANDTOTAL`;
  dataFile += `\t\t\t`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;
  dataFile += `\t${numberFormat(GrandTotal, 2)}`;

  return dataFile;
}
