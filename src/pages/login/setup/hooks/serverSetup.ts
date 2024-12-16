
export function useServerSetup() {

  const initServerSetup = () => {
    if (localStorage.getItem("lst_conf") === null) {
        localStorage.setItem("lst_conf", "http://127.0.0.1:5875");
    }
    if (localStorage.getItem("lst_conf_printer") === null) {
        localStorage.setItem("lst_conf_printer", "127.0.0.1");
    }
    if (localStorage.getItem("lst_conf_printer_name") === null) {
        localStorage.setItem("lst_conf_printer_name", "RECEIPT");
    }
    if (localStorage.getItem("lst_conf_printer_type") === null) {
        localStorage.setItem("lst_conf_printer_type", "THERMAL");
    }
    if (localStorage.getItem("lst_conf_printer_size") === null) {
        localStorage.setItem("lst_conf_printer_size", "80");
    }
    if (localStorage.getItem("lst_conf_printer_language") === null) {
        localStorage.setItem("lst_conf_printer_language", "UTF-8");
    }
    if (localStorage.getItem("lst_conf_printer_font_size") === null) {
        localStorage.setItem("lst_conf_printer_font_size", "Normal");
    }
  }

  return { initServerSetup};
}