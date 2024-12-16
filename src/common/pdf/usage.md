## Usage

```
const { buildPDF } = usePDFBuilder();

let base64 = "";

const pdfOptions: PDFOptions = {
    // your options here
    margin: {
      // margins ...
    },
  };


// to build the PDF
buildPDF(pdfOptions, (canvas: PDFCanvas) => {
  // create a header
  canvas.createHeader?.((header: PDFHeader) => {
    // create text for the header
    header.createText(...)
    // ... other pdf graphics for the header
  })
  // end of header block

  // create the body of the pdf outside the createHeader() block
  canvas.createText(...)
  // ... other pdf graphics

  // always close the canvas to avoid any unnecessary layouting issue
  canvas.close()

  // you can choose to print the pdf or get the base64 of the pdf
  canvas.print?.() // this will open a new window to download the pdf
  // or
  base64 = canvas.getPDFBase64(); // store the base64 somewhere to use it.

});


```
When using createText():

```
// you can add a single text or you can add an array of strings and have the same styling for all strings
// only use this if the corresponding string array have the same font styling
// each string will consume the whole line
createText(["str1", "str2", "str3"], fontSize, fontWeight) // all text will have the same font styling

// sample output:
str1 // line 1
str2 // line 2
str3 // line 3
```

When using createInlineText():
```
createInlineTexts(["str1", "str2", "str3"], ...font styling here)

// sample output:
str1 str2 str3 // all strings in 1 line.
```