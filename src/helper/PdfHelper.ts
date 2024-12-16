import html2pdf from "html2pdf.js";
import "jspdf-autotable";

export const saveAsPdf = async (
  element: HTMLElement | null,
  fileName?: string
) => {
  if (element) {
    await html2pdf()
      .from(element)
      .set({
        filename: `${fileName || "output"}.pdf`,
        image: {type: "jpeg", quality: 0.98},
        html2canvas: {scale: 5},
        jsPDF: {
          orientation: "portrait",
          format: [element.offsetHeight / 3.78 + 30, 130],
        },
      })
      .save(); //.outputPdf("bloburl");

    // window.open(htmlPdf, "_blank");
  }
};

export const viewPdf = async (element: HTMLElement | null) => {
  if (element) {
    console.log(
      "offset width heigh",
      element.offsetWidth,
      element.offsetHeight
    );

    const htmlPdf = await html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: "output.pdf",
        image: {type: "jpeg", quality: 0.98},
        html2canvas: {scale: 5},
        jsPDF: {
          orientation: "portrait",
          format: [element.offsetHeight / 3.78 + 30, 130],
        },
      })
      .outputPdf("bloburl");

    window.open(htmlPdf, "_blank");
  }
};

export const convertToPDF = async (element: HTMLElement | null) => {
  if (element) {
    const htmlPdf = await html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: "output.pdf",
        image: {type: "jpeg", quality: 0.98},
        html2canvas: {scale: 5},
        jsPDF: {
          orientation: "portrait",
          format: [element.offsetHeight / 3.78 + 30, 130],
        },
      })
      .outputPdf("blob");

    const reader = new FileReader();
    reader.readAsDataURL(htmlPdf);

    console.log("pumasok here", reader);

    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          const base64Data = reader.result.split(",")[1];
          console.log("Success", base64Data);

          // const dataUrl = reader.result;

          // const downloadLink = document.createElement('a');
          // downloadLink.href = dataUrl;
          // downloadLink.download = "random";

          // // Trigger a click on the download link
          // document.body.appendChild(downloadLink);
          // downloadLink.click();
          // document.body.removeChild(downloadLink);

          // // resolve(dataUrl);
          resolve(base64Data);
        } else {
          reject("Error converting it");
        }
      };
    });
  }

  return null;
};

export const printPreview = () => {};
