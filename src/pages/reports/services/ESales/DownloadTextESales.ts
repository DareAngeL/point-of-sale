import moment from "moment";

export async function DownloadTextESales(
  reportData: any,
  formValue: any,
  header: any
) {
  let dataFile = "";
  const branch =
    header.data[0].tin !== undefined &&
    header.data[0].tin.toString().split("-")[3].length > 3
      ? header.data[0].tin?.toString().split("-")[3]
      : `${header.data[0].tin?.toString().split("-")[3]}0`;
  dataFile += `E-Sales Report\n`;
  dataFile += `TIN#:${header.data[0].tin}`;
  dataFile += `\t\t\t\tMONTH OF:${moment(formValue?.dateFrom).format("MM")}\n`;
  dataFile += `MIN#:${header.data[0].machineno}`;
  dataFile += `\t\t\t\tYEAR OF: ${moment(formValue?.dateFrom).format(
    "YYYY"
  )}\n`;
  dataFile += `BRANCH:${branch}\n`;
  dataFile += `\n`;
  dataFile += `DATE`;
  dataFile += `\tTOTAL DAILY GROSS SALES`;
  dataFile += `\t(-)VAT ADJ`;
  dataFile += `\t(-)GOV DISCOUNT`;
  dataFile += `\t(-)REG DISCOUNT`;
  dataFile += `\tTOTAL SALES`;
  dataFile += `\tVATABLE SALES`;
  dataFile += `\tVAT`;
  dataFile += `\tVAT ZERO RATED SALES`;
  dataFile += `\tVAT EXEMPT SALES`;
  dataFile += `\tBEG. OR`;
  dataFile += `\tEND OR`;
  dataFile += `\n`;

  for (const xdata_val of Object.values(reportData)) {
    const record: any = xdata_val;
    dataFile += `${record["date"]}`;
    dataFile += `\t${record["grossSales"].toFixed(2)}`;
    dataFile += `\t${record["vatAdj"].toFixed(2)}`;
    dataFile += `\t${record["scpwdDiscount"].toFixed(2)}`;
    dataFile += `\t${record["regDiscount"].toFixed(2)}`;
    dataFile += `\t${record["totalSales"].toFixed(2)}`;
    dataFile += `\t${record["vatableSales"].toFixed(2)}`;
    dataFile += `\t${record["vatAmount"].toFixed(2)}`;
    dataFile += `\t${record["vatZeroRated"].toFixed(2)}`;
    dataFile += `\t${record["vatExemptSales"].toFixed(2)}`;
    dataFile += `\t${record["begOR"]}`;
    dataFile += `\t${record["endOR"]}`;
    dataFile += `\n`;
  }

  return dataFile;
}
