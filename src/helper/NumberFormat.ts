export const numberFormat = (
  valNum: number | null,
  digits: number,
  addMin?: boolean | undefined
) => {
  valNum = parseFloat(valNum === null ? "0.00" : valNum.toString());
  if (isNaN(valNum)) return "";

  let options = {
    maximumFractionDigits: digits,
  };

  if (addMin || addMin === undefined) {
    options = {
      ...options,
      ...{minimumFractionDigits: digits},
    };
  }

  return new Intl.NumberFormat("en-US", options).format(valNum);
  // .replace(/\D00(?=\D*$)/, "");
};

export function formatNumberWithCommasAndDecimals(
  number: number | string,
  pad?: number
) {
  const parsedNumber = typeof number === "string" ? parseFloat(number) : number;

  if (
    parsedNumber === null ||
    parsedNumber === undefined ||
    isNaN(parsedNumber)
  ) {
    return "0.00";
  }

  const fixedNumber = parsedNumber.toFixed(pad); // Ensure decimals are added based on pad
  const formattedNumber = fixedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return formattedNumber;
}

export function numberPadFormatter(number: any | string, pad: number) {
  if (number) {
    return parseFloat(number).toFixed(pad);
  }
}
