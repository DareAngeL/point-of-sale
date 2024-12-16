import { toast } from "react-toastify";
 
export function useSwipeCardFeature() {
  
  const authSwipeCardInfo = (swipecarddata: string) => {
    if (swipecarddata === "") return undefined;

    let cardno = "";
    let cardholder = "";

    try {
      const splitswipecarddata = swipecarddata.split(" ");
      if(splitswipecarddata.length > 2){
        cardno = swipecarddata.split(" ")[2].replace("?","");
        cardholder = swipecarddata.split(" ")[0].replace("%","") + " " + swipecarddata.split(" ")[1].replace("%","");
      }else{
        cardno = swipecarddata.split("-")[1].replace("?","");
        cardholder = swipecarddata.split("-")[0].replace("%","");
      } 
    } catch (err) {
      toast.error("Invalid Card.", {
        toastId: 'card-invalid',
        autoClose: 2000,
        hideProgressBar: true,
        position: 'top-center'
      });
      console.error(err);
      
      return undefined;
    }

    cardholder = cardholder.trim();

    return {
      cardno,
      cardholder
    }
  }
  
  return {
    authSwipeCardInfo
  }
}