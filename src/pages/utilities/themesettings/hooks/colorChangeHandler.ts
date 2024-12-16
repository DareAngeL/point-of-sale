import { useState } from "react";
import { ThemeModel } from "../../../../models/theme";
import { putTheme } from "../../../../store/actions/utilities/theme.action";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

export function useColorChangeHandler(theme: ThemeModel, appDispatch: any) {

  const [primaryColor, setPrimaryColor] = useState<string>(theme.primarycolor);
  const [orderingBtnColor, setOrderingBtnColor] = useState<string>(theme.orderingbtnscolor);

  const Navigate = useNavigate();

  const onColorChange = (type: 'primary' | 'ordering_btns', color: string) => {
    if (type === 'primary') {
      setPrimaryColor(color);
    } else {
      setOrderingBtnColor(color);
    }
  }

  const onSubmit = async () => {
    const loading = toast.loading("Updating theme, Please wait.", {
      position: "top-center",
    });

    console.log("asd:", theme);
    

    appDispatch(putTheme({
      ...(theme.recid && {recid: theme.recid}),
      primarycolor: primaryColor,
      orderingbtnscolor: orderingBtnColor
    }));

    toast.dismiss(loading);
    toast.success("Theme updated successfully!", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
    });

    Navigate(-1);
  }

  return {
    primaryColor,
    orderingBtnColor,
    onColorChange,
    onSubmit
  }
}