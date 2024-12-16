

export const receiptDefiner = (isDefault: number, ordocnum: string) => {
    if (!ordocnum) {
        return "";
    }

    // Split the ordocnum into 2 by splitter '-'
    const split = ordocnum.split("-");
    // Get the index [1] to get the receipt number
    const receiptNumber = split[1];

    // Combine and return the correct receipt label which is "OR" or "INV"
    return isDefault == 0?`OR-${receiptNumber}`:`INV-${receiptNumber}`;
}