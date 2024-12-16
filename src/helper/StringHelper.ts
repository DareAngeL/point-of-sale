interface DataItem {
  recid: number;
  usrname: string;
  usrcde: string;
  trndte: string;
  module: string;
  method: string;
  remarks: string;
}

export const removeNewlines = (data: DataItem[]): DataItem[] => {
  const newData = data.map((item) => {
    if (item.remarks) {
      item.remarks = item.remarks.replace(/\n/g, " ");
    }
    return item;
  });
  return newData;
};

export const truncateString = (str: any, maxLength: number) => {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - 3) + "...";
};


export const removeCommasFromString = (inputString: any) => {
  if (typeof inputString === "number") {
    const convertedToString = inputString.toString();
    return convertedToString.replace(/,/g, "");
  }
  return inputString.replace(/,/g, "");
}

export const removeSpecialCharactersFromString = (str: string) => {

  return str.replace(/[^a-zA-Z0-9 ]/g, '');

}

export const objToQueryStr = (obj: {[key: string]: any}) => 
  `?${Object.keys(obj)
    .map((key) => key + "=" + obj[key])
    .join("&")}`;