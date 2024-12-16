import { useState } from "react";
import { FixOrdocnumDuplicate } from "./fixordocnumduplicate/FixOrdocnumDuplicate";
import { FixPosOrderingfile } from "./fixposorderingfile/fixPosOrderingfile";

export function Fixes() {

    const [selectedFix, setSelectedFix] = useState<'none'|'fixordocnumduplicate'|'fixnoordocnum'>("none");


    const renderFixModules = () => {
        switch (selectedFix) {
            case "fixordocnumduplicate":
                return <FixOrdocnumDuplicate onClose={() => setSelectedFix('none')} />;
            case "fixnoordocnum":
                return <FixPosOrderingfile onClose={() => setSelectedFix('none')} />;
            default:
                return <></>;
        }
    }

    return (
        <>
            {renderFixModules()}


            <div>
                <p
                    className="border-b-2 hover:cursor-pointer hover:bg-slate-100 p-2"
                    onClick={() => setSelectedFix("fixordocnumduplicate")}
                >
                    Fix Ordocnum Duplicate
                </p>
                <p
                    className="text-[12px] mt-2 bg-slate-100 p-2 rounded-md"
                >
                    Description: This will delete the duplicated (TOTAL, SERVICE CHARGE, VATEXEMPT, LOCALTAX, VAT 0 RATED, DISCOUNTABLE, Less Vat Adj.)
                    and will recalculate the total amount for each duplicated ordocnum.
                </p>
            </div>

            <div>
                <p
                    className="border-b-2 hover:cursor-pointer hover:bg-slate-100 p-2"
                    onClick={() => setSelectedFix("fixnoordocnum")}
                >
                    Fix ''No Ordocnum'' Duplicate in ''posorderingfile'' table
                </p>
                <p
                    className="text-[12px] mt-2 bg-slate-100 p-2 rounded-md"
                >
                    Description: This will delete the duplicated items that has a 'null' ordocnum in posorderingfile table
                </p>
            </div>
        </>
    )
}