import { CustomerWindow } from "../windows/customerwindow/CustomerWindow";
import MainWindow from "../windows/mainwindow/MainWindow";

export const WindowViewer = {
  View: (view: string) => {
    switch (view) {
      case 'customer':
        return <CustomerWindow />
      default:
        return  <MainWindow />
    }
  }
}

export function WindowManager() {

  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view');
  console.log("Window manager initialized");

  return (
    <>
      {WindowViewer.View(view || '')}
    </>
  )
}