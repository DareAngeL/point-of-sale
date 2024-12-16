import jsPDF, { jsPDFOptions } from "jspdf";
import { convertCSV, convertText } from "../../../../helper/FileConversion";

class POSPdf {

    internal: any;
    previousAutoTable: any;
    private hasHeader: boolean = false;
    private generationOpts = { generateCSV: false, generateText: false, generatePDF: false };
    private csvData: string[][] = [];
    private textData: string[][] = [];

    constructor(options?: jsPDFOptions, generationOptions?: { generatePDF: boolean, generateCSV: boolean, generateText: boolean }) {
        Object.assign(this, new jsPDF(options));
        if (generationOptions) {
            this.generationOpts = generationOptions;
        }
    }

    text2(...args: Parameters<jsPDF["text"]>) {
        if (this.generationOpts.generateText) {
            this.textData.push([(args[0] as string).replaceAll(',', '')]);
        }

        if (this.generationOpts.generateCSV) {
            this.csvData.push([(args[0] as string).replaceAll(',', '')]);
        }

        // if (this.generationOpts.generatePDF) {
            this.text(...args);
        // }
    }

    save2(...args: Parameters<jsPDF["save"]>) {
        if (this.generationOpts.generateText) {
            convertText(this.textData, args[0] as string);
        }

        if (this.generationOpts.generateCSV) {
            convertCSV(this.csvData, args[0] as string);
        }

        if (this.generationOpts.generatePDF) {
            this.save(...args);
        }
    }

    autoTableCSVTextBody(header: any[], body: any[]) {

        if (!this.generationOpts.generateText && !this.generationOpts.generateCSV) return this;

        if (!this.hasHeader) {
            this.hasHeader = true;
            this.layoutBody(header);
        }

        for (const cols of body) {
            this.layoutBody(cols);
        }

        return this;
    }

    private layoutBody(data: any[]) {
        const colsTxt = data.map((col:any) => {
            if ((col && col.content) || (col && col.content === '')) {
                return col.content.toString().replaceAll(',', '') + ',';
            }
            return !col ? ' ,' : col.toString().replaceAll(',', '') + ',';
        });

        const colsCSV = data.map((col:any) => {
            if ((col && col.content) || (col && col.content === '')) {
                return col.content.toString().replaceAll(',', '');
            }
            return !col ? null : col.toString().replaceAll(',', '');
        });

        this.generationOpts.generateText && this.textData.push(colsTxt);
        this.generationOpts.generateCSV && this.csvData.push(colsCSV);
    }
}

interface POSPdf extends jsPDF {}
export default POSPdf;