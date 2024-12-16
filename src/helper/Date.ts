import {addMinutes, format} from "date-fns";
import moment from "moment";

export function dateNowMs() {
  return new Date().getTime();
}

export function dateNowFormatted() {
  const newDate = format(new Date(), "MMMM do yyyy,  h:mm:ss a");
  return newDate;
}
export function dateNowFormattedNumerical(date?: string) {
  const newDate = format(date ? new Date(date) : new Date(), "MM/dd/yy h:mm:ss a");
  return newDate;
}

/**
 * Useful to know if there is no zread in the previous day
 * @param data all non-zread data
 * @returns
 */
export function timeDifferences(data: any[]): any[] {
  // get all the data that has date differences
  const filteredData = data.filter((other: any, index: any, self: any) => {
    return (
      index === self.findIndex((item: any) => item.trndte === other.trndte)
    );
  });

  const date = moment().format("YYYY-MM-DD");
  const latestData = filteredData[filteredData.length - 1].trndte;

  return date !== latestData ? filteredData : [];
}

export function formatDateToDDMMYY(inputDate: string) {
  const parts = inputDate.split("-");
  if (parts.length === 3) {
    const year = parts[0].slice(-2); // Get the last two digits of the year
    const month = parts[1];
    const day = parts[2];

    return `${day}/${month}/${year}`;
  } else {
    // Handle invalid input
    return "Invalid Date";
  }
}

export function formatDateToYYYYMMDD(inputDate: string) {
  const date = new Date(inputDate);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(date.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}

export function formatTimeTo12Hour(time: string) {
  let [hours, minutes, seconds] = time.split(':');
  const period = +hours < 12 ? 'AM' : 'PM';
  const hours12 = +hours % 12 || 12; // if hours is 0 (i.e., 12 AM), make it 12
  return `${hours12}:${minutes}:${seconds} ${period}`;
}

export function formatTimeTo24Hour(time: string) {
  let [hours, minutes, seconds] = time.split(':');
  
  return `${hours}:${minutes}:${seconds}`;
}

export function formatTimeFromDateTo24Hour(date: Date) {
  return format(date, 'HH:mm:ss');
}

export const isOneHourDifference = (timeend: string, timestart: string) => {
  const differenceInMinutes = timeDifferenceInMinutes(timeend, timestart);
  return differenceInMinutes < 60;
}

export const addMinutesToTime = (time: string, minutesToAdd: number) => {

  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  const newDate = addMinutes(date, minutesToAdd)

  return format(newDate, 'HH:mm')

}


export const isNextDay = (timeend: string, timestart: string) => {
  if (timeend === "" || timestart === "") return false;

  // Convert time and timeout strings to Date objects
  const timeDate = new Date(`1970-01-01 ${timestart}`);
  const timeoutDate = new Date(`1970-01-01 ${timeend}`);

  // Check if the timeout date is after the time date
  return timeoutDate < timeDate;
}

export const timeDifferenceInMinutes = (timeend: string, timestart: string) => {
  
  console.log(timeend, timestart);

  const [timeendHrs, timeendMins] = timeend.split(":").map(Number);
  const [timestartHrs, timestartMins] = timestart.split(":").map(Number);

  let timeendedMinutes = (timeendHrs * 60) + timeendMins;
  let timestartMinutes = (timestartHrs * 60) + timestartMins; 
  
  let differenceInMinutes = timeendedMinutes - timestartMinutes

  if(differenceInMinutes < 0){
      differenceInMinutes += (24*60)
      differenceInMinutes = 1440 - differenceInMinutes; 
  }

  console.log(differenceInMinutes);

  return Math.abs(differenceInMinutes);
  
}

export const realTimeDifferenceInMinutes = (timeend: string, timestart: string) => {

  const [timeendHrs, timeendMins] = timeend.split(":").map(Number);
  const [timestartHrs, timestartMins] = timestart.split(":").map(Number);

  let timeendedMinutes = (timeendHrs * 60) + timeendMins;
  let timestartMinutes = (timestartHrs * 60) + timestartMins; 
  
  let differenceInMinutes = timeendedMinutes - timestartMinutes;
  
  if(differenceInMinutes < 0){
    differenceInMinutes = (60*24) + differenceInMinutes; 
  }

  return differenceInMinutes;

}

export const convertToMinutes = (time: string) => {
  const [hrs, mins] = time.split(":").map(Number);

  return (hrs*60) + mins;
}