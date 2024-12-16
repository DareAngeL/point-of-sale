

export enum PrinterCommands {
    INIT='\x1B' + '\x40',
    INIT2 = '\u001B$B',
    CENTER_ALIGN='\x1B' + '\x61' + '\x31',
    LEFT_ALIGN='\x1B' + '\x61' + '\x30',
    RIGHT_ALIGN='\x1B' + '\x61' + '\x32',
    NEXT_LINE='\x0A',
    BOLD_ON='\x1B' + '\x45' + '\x0D',
    BOLD_OFF='\x1B' + '\x45' + '\x0A',
    EM_ON='\x1B' + '\x21' + '\x30',
    EM_OFF='\x1B' + '\x21' + '\x0A' + '\x1B' + '\x45' + '\x0A',
    SMALL_TEXT='\x1B' + '\x4D' + '\x31',
    NORMAL_TEXT='\x1B' + '\x4D' + '\x30',
    PULSE='\x10' + '\x14' + '\x01' + '\x00' + '\x05',
    FULL_CUT='\x1D' + '\x56'  + '\x00',
    PARTIAL_CUT='\x1D' + '\x56'  + '\x01',
    OPEN_CASH_DRAWER='\x10' + '\x14' + '\x01' + '\x00' + '\x05',
    EM_MODE_ON='\x1B' + '\x21' + '\x30',
    EM_MODE_OFF='\x1B' + '\x21' + '\x0A' + '\x1B' + '\x45' + '\x0A'
  }

  export enum ALIGNMENT{
    LEFT,
    RIGHT,
    CENTER,
  }

  
  export function usePrinterCommands(printersize?: number){

    const rawData : any[] = [];

    let charPerLine = -1; //48;
    const ellipDotCount = 3;

    // rawData.push(PrinterCommands.INIT)

    const getCharPerLine = () => {

        if (charPerLine === -1) {
          const mainPrinterSize = parseInt(JSON.parse(localStorage.getItem('lst_conf_printer_size') || '48'));
          const printerSizeInMM = printersize || mainPrinterSize; // defaults to 48
          const widthInInches = printerSizeInMM / 25.4;
          const charactersPerInch = 15.5;

          charPerLine = Math.floor(widthInInches * charactersPerInch);
        }

        return charPerLine;
    }

    getCharPerLine();

    const init = () => {
      rawData.push(PrinterCommands.INIT);
    }

    const clear = () => {
      rawData.length = 0;
    }

    const divider = () => {
      rawData.push("-".repeat(getCharPerLine()));
    }

    const input = (text : string, alignment : ALIGNMENT, bold?: boolean, small?: boolean) =>{

        if(alignment== ALIGNMENT.LEFT){
            rawData.push(PrinterCommands.LEFT_ALIGN);
        }
        else if(alignment== ALIGNMENT.RIGHT){
            rawData.push(PrinterCommands.RIGHT_ALIGN);
            
        }
        else{
            rawData.push(PrinterCommands.CENTER_ALIGN);
        }

        if (small) rawData.push(PrinterCommands.SMALL_TEXT);

        if (bold) rawData.push(PrinterCommands.BOLD_ON + text + PrinterCommands.NEXT_LINE);
        if (!bold) rawData.push(text+PrinterCommands.NEXT_LINE);
        if (bold) rawData.push(PrinterCommands.BOLD_OFF);

        if (small) rawData.push(PrinterCommands.NORMAL_TEXT);

    }

    const tableInput = (label : string, value : string) => {
        
        rawData.push(PrinterCommands.LEFT_ALIGN);
        const lblLength = label.length || 0;
        const valLength = value.length || 0;
        let newLabel = label;
        let space;

        const remSCharSlot = charPerLine - valLength; // remaining available chars slot
        if (lblLength > remSCharSlot) {
            newLabel = label.substring(0, remSCharSlot - ellipDotCount - 1) + '.'.repeat(ellipDotCount);
            space = 1;
        } else {
          space = charPerLine - (lblLength + valLength);
        }

        // console.log("xxxLENGTH", newLabel,  newLabel.length + valLength + space);
        // console.log('xxxLABL', label, value);

        rawData.push(newLabel + " ".repeat(space) + value);
        rawData.push(PrinterCommands.NEXT_LINE);

    }

    const bigTableInput = (label: string, value: string) => {

        
        rawData.push(PrinterCommands.LEFT_ALIGN);
        const lblLength = label.length || 0;
        const valLength = value.length || 0;
        let newLabel = label;
        // let space = 0;

        const remSCharSlot = getCharPerLine() - valLength; // remaining available chars slot
        if (lblLength > remSCharSlot) {
            newLabel = label.substring(0, remSCharSlot - ellipDotCount - 1) + '.'.repeat(ellipDotCount);
            // space = 1;
        } else {
        //   space = getCharPerLine() - (lblLength + valLength);
        }
        rawData.push("\x1B\x45\x0A\x1B!\x70\x1B!\x70");
        // rawData.push(newLabel + " ".repeat(space) + value);
        rawData.push(newLabel +" "+  value);
        rawData.push("\x1B!\x00\x1B\x45\x0A");
        lineBreak();
        // rawData.push(PrinterCommands.EM_MODE_OFF);
        // rawData.push(PrinterCommands.NEXT_LINE);
    };

    const lineBreak =() => {
        rawData.push(PrinterCommands.NEXT_LINE);
    }

    const encode = () : any[]  => {
        return rawData;
    }

    const fullCut = () => {
        rawData.push(PrinterCommands.FULL_CUT);
    }

    const openCashDrawer = () => {
        console.log("DRAWER OPEN");
        rawData.push(PrinterCommands.OPEN_CASH_DRAWER)
    }

    const bigInput = (data: string, alignment: ALIGNMENT, bold?: boolean) => {
        if(alignment== ALIGNMENT.LEFT){
            rawData.push(PrinterCommands.LEFT_ALIGN);
        }
        else if(alignment== ALIGNMENT.RIGHT){
            rawData.push(PrinterCommands.RIGHT_ALIGN);
            
        }
        else{
            rawData.push(PrinterCommands.CENTER_ALIGN);
        }
        rawData.push("\x1B\x45\x0A\x1B!\x70\x1B!\x70");
        
        if (bold) rawData.push(PrinterCommands.BOLD_ON + data);
        else rawData.push(data);

        rawData.push("\x1B!\x00");
        // rawData.push(PrinterCommands.EM_MODE_OFF);
    }
    


    return {encode, input, init, fullCut, tableInput, lineBreak, openCashDrawer, bigInput, divider, clear, bigTableInput}

  }