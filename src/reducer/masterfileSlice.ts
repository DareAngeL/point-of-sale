import {createSlice, current} from "@reduxjs/toolkit";
import {RootState} from "../store/store";
import {ItemClassificationModel} from "../models/itemclassification";
import {ItemSubclassificationModel} from "../models/itemsubclassification";
import {ItemModel} from "../models/items";
import {PrinterStationModel} from "../models/printerstation";
import {PricelistModel} from "../models/pricelist";
import {WarehouseModel} from "../models/warehouse";
import {DineTypeModel} from "../models/dinetype";
import {CompanyModel} from "../models/company";
import {HeaderfileModel} from "../models/headerfile";
import {SystemParametersModel} from "../models/systemparameters";
import {TaxCodeModel} from "../models/taxcode";
import {VoidReasonModel} from "../models/voidreason";
import {FreeReasonsTypeModel} from "../models/freereasons";
import {SpecialRequestModel} from "../models/specialrequest";
import {SpecialRequestGroup} from "../models/specialrequestgroup";
import {Menus} from "../models/menus";
import {TerminalModel} from "../models/terminal";
import {DiscountModel} from "../models/discount";
import {MasterFileLog} from "../models/masterfilelog";
import {CardTypeModel} from "../models/cardtype";
import {FooterModel} from "../models/footer";
import {PaymentTypeModel} from "../models/paymenttype";
import {ItemComboModel} from "../models/itemCombo";
import {CashIOReasonModel} from "../models/cashioreason";
import {MemcTypeModel} from "../models/memc";
import { getCardType } from "../store/actions/cardType.action";
import { getCompany } from "../store/actions/company.action";
import { getDineType } from "../store/actions/dineType.action";
import { getDiscount } from "../store/actions/discount.action";
import { getItemClassifications} from "../store/actions/itemClassification.action";
import { getItemSubclassifications } from "../store/actions/itemSubclassification.action";
import { getItems, getItemCombo, getItemAll } from "../store/actions/items.action";
import { getMasterFile, getMasterFileLog } from "../store/actions/masterfile.action";
import { getMEMC } from "../store/actions/memc.action";
import { getMenus } from "../store/actions/menus.action";
import { getPaymentType } from "../store/actions/otherPayment.action";
import { getPriceList } from "../store/actions/pricelist.action";
import { getPrinterStations } from "../store/actions/printerStation.action";
import { getHeader, getFooter, putFooter, putHeader } from "../store/actions/printout.action";
import { getVoidReason, getFreeReason, getCashIOReason } from "../store/actions/reason.action";
import { getSpecialRequest, getSpecialRequestGroup } from "../store/actions/specialRequest.action";
import { getSysPar, putSysPar } from "../store/actions/systemParameters.action";
import { getTaxCode } from "../store/actions/taxcode.action";
import { getTerminals } from "../store/actions/terminal.action";
import { getWarehouse } from "../store/actions/warehouse.action";
import { BranchfileModel } from "../models/branchfile";
import { getBranch } from "../store/actions/branchfile.action";
import { getMallFields } from "../store/actions/mallhookup.action";
import { MallHookupModel } from "../models/mallhookupfile";
interface MasterfileState {
  terminal: {
    data: TerminalModel[];
    isLoaded: boolean;
  };
  itemClassification: {
    data: ItemClassificationModel[];
    isLoaded: boolean;
  };
  itemSubclassification: {
    data: ItemSubclassificationModel[];
    isLoaded: boolean;
  };
  item: {
    data: ItemModel[];
    isLoaded: boolean;
  };
  itemCombo: {
    data: ItemComboModel[];
    isLoaded: boolean;
  };
  printerStation: {
    data: PrinterStationModel[];
    isLoaded: boolean;
  };
  priceList: {
    data: PricelistModel[];
    isLoaded: boolean;
  };
  warehouse: {
    data: WarehouseModel[];
    isLoaded: boolean;
  };
  dineType: {
    data: DineTypeModel[];
    isLoaded: boolean;
  };
  company: {
    data: CompanyModel[];
    isLoaded: boolean;
  };
  header: {
    data: HeaderfileModel[];
    isLoaded: boolean;
  };
  syspar: {
    data: SystemParametersModel[];
    isLoaded: boolean;
  };
  voidreason: {
    data: VoidReasonModel[];
    isLoaded: boolean;
  };
  freeReason: {
    data: FreeReasonsTypeModel[];
    isLoaded: boolean;
  };
  taxcode: {
    data: TaxCodeModel[];
    isLoaded: boolean;
  };
  specialrequest: {
    data: SpecialRequestModel[];
    isLoaded: boolean;
  };
  specialrequestgroup: {
    data: SpecialRequestGroup[];
    isLoaded: boolean;
  };
  file: {
    data: [];
    isLoaded: boolean;
  };
  menus: {
    data: Menus[];
    isLoaded: boolean;
  };
  discount: {
    data: DiscountModel[];
    isLoaded: boolean;
  };
  masterfilelog: {
    data: MasterFileLog[];
    isLoaded: boolean;
  };
  cardType: {
    data: CardTypeModel[];
    isLoaded: boolean;
  };
  footer: {
    data: FooterModel[];
    isLoaded: boolean;
  };
  paymentType: {
    data: PaymentTypeModel[];
    isLoaded: boolean;
  };
  cashioreason: {
    data: CashIOReasonModel[];
    isLoaded: boolean;
  };
  memc: {
    data: MemcTypeModel[];
    isLoaded: boolean;
  };
  branch: {
    data: BranchfileModel[];
    isLoaded: boolean;
  };
  mallHookUp: {
    data: MallHookupModel | undefined;
    isLoaded: boolean;
  };
}

const initialState: MasterfileState = {
  terminal: {
    data: [],
    isLoaded: false,
  },
  itemClassification: {
    data: [],
    isLoaded: false,
  },
  itemSubclassification: {
    data: [],
    isLoaded: false,
  },
  item: {
    data: [],
    isLoaded: false,
  },
  itemCombo: {
    data: [],
    isLoaded: false,
  },
  printerStation: {
    data: [],
    isLoaded: false,
  },
  priceList: {
    data: [],
    isLoaded: false,
  },
  warehouse: {
    data: [],
    isLoaded: false,
  },
  dineType: {
    data: [],
    isLoaded: false,
  },
  company: {
    data: [],
    isLoaded: false,
  },
  header: {
    data: [],
    isLoaded: false,
  },
  syspar: {
    data: [],
    isLoaded: false,
  },
  voidreason: {
    data: [],
    isLoaded: false,
  },
  freeReason: {
    data: [],
    isLoaded: false,
  },
  taxcode: {
    data: [],
    isLoaded: false,
  },
  specialrequest: {
    data: [],
    isLoaded: false,
  },
  specialrequestgroup: {
    data: [],
    isLoaded: false,
  },
  file: {
    data: [],
    isLoaded: false,
  },
  menus: {
    data: [],
    isLoaded: false,
  },
  discount: {
    data: [],
    isLoaded: false,
  },
  masterfilelog: {
    data: [],
    isLoaded: false,
  },
  cardType: {
    data: [],
    isLoaded: false,
  },
  footer: {
    data: [],
    isLoaded: false,
  },
  paymentType: {
    data: [],
    isLoaded: false,
  },
  cashioreason: {
    data: [],
    isLoaded: false,
  },
  memc: {
    data: [],
    isLoaded: false,
  },
  branch: {
    data: [],
    isLoaded: false
  },
  mallHookUp: {
    data: undefined,
    isLoaded: false
  }
};

const masterfileSlice = createSlice({
  name: "masterfile",
  initialState,
  reducers: {
    setPaymentType: (state, action) => {
      state.paymentType.data = action.payload;
      state.paymentType.isLoaded = true;
    },
    setTerminal: (state, action) => {
      state.terminal.data = action.payload;
      state.terminal.isLoaded = true;
    },
    setItemClassification: (state, action) => {
      state.itemClassification.data = action.payload;
      state.itemClassification.isLoaded = true;
    },
    addOrReplaceItemClassification: (state, action) => {

      const itemClass = current(state.itemClassification.data);
      const itemClassFind = itemClass.find(itm => itm.recid == action.payload.recid);

      if(itemClassFind){
        const itemClassMap = itemClass.map(itm => {
          if(itm.recid == action.payload.recid)
            return action.payload;
  
          return itm;
        });
        
        state.itemClassification.data = itemClassMap;
        return;
      }

      state.itemClassification.data = [...itemClass, action.payload]
    },
    addOrReplaceItemSubclassification: (state, action) => {

      const itemSubclass = current(state.itemSubclassification.data);
      const itemSubclassFind = itemSubclass.find(itm => itm.recid == action.payload.recid);

      if(itemSubclassFind){
        const itemSubclassMap = itemSubclass.map(itm => {
          if(itm.recid == action.payload.recid)
            return action.payload;
  
          return itm;
        });
        
        state.itemSubclassification.data = itemSubclassMap;
        return;
      }

      state.itemClassification.data = [...itemSubclass, action.payload]
    },
    setItemSubclassification: (state, action) => {
      state.itemSubclassification.data = action.payload;
      state.itemSubclassification.isLoaded = true;
    },
    setItem: (state, action) => {
      state.item.data = action.payload;
      state.item.isLoaded = true;
    },
    setItemCombo: (state, action) => {
      state.itemCombo.data = action.payload;
      state.itemCombo.isLoaded = true;
    },
    updateItemCombo: (state, action) => {
      state.itemCombo.data = [...state.itemCombo.data, ...action.payload];
    },
    setPriceList: (state, action) => {
      state.priceList.data = action.payload;
      state.priceList.isLoaded = true;
    },
    setWarehouse: (state, action) => {
      state.warehouse.data = action.payload;
      state.warehouse.isLoaded = true;
    },
    setDineType: (state, action) => {
      state.dineType.data = action.payload;
      state.dineType.isLoaded = true;
    },
    setCardType: (state, action) => {
      state.cardType.data = action.payload;
      state.cardType.isLoaded = true;
    },
    setCompany: (state, action) => {
      state.company.data = action.payload;
      state.company.isLoaded = true;
    },
    setHeader: (state, action) => {
      state.header.data = action.payload;
      state.header.isLoaded = true;
    },
    setSysPar: (state, action) => {
      state.syspar.data = action.payload;
      state.syspar.isLoaded = true;
    },
    setVoidReason: (state, action) => {
      state.voidreason.data = action.payload;
      state.voidreason.isLoaded = true;
    },
    setFreeReason: (state, action) => {
      state.freeReason.data = action.payload;
      state.freeReason.isLoaded = true;
    },
    setTaxCode: (state, action) => {
      state.taxcode.data = action.payload;
      state.taxcode.isLoaded = true;
    },
    setSpecialRequest: (state, action) => {
      state.specialrequest.data = action.payload;
      state.specialrequest.isLoaded = true;
    },
    setSpecialRequestGroup: (state, action) => {
      state.specialrequestgroup.data = action.payload;
      state.specialrequestgroup.isLoaded = true;
    },
    setMasterFile: (state, action) => {
      state.file.data = action.payload;
      state.file.isLoaded = true;
    },
    setMenus: (state, action) => {
      state.menus.data = action.payload;
      state.menus.isLoaded = true;
    },
    setMasterFileLog: (state, action) => {
      state.masterfilelog.data = action.payload;
      state.masterfilelog.isLoaded = true;
    },
    setFooter: (state, action) => {
      state.footer.data = action.payload;
      state.footer.isLoaded = true;
    },
    setCashIOReason: (state, action) => {
      state.cashioreason.data = action.payload;
      state.cashioreason.isLoaded = true;
    },
    setMallFields: (state, action) => {
      state.mallHookUp.data = action.payload;
      state.mallHookUp.isLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMallFields.fulfilled, (state, action) => {
        state.mallHookUp.data = action.payload;
        state.mallHookUp.isLoaded = true;
      })
      .addCase(getTerminals.fulfilled, (state, action) => {
        state.terminal.data = action.payload;
        state.terminal.isLoaded = true;
      })
      .addCase(getItemClassifications.fulfilled, (state, action) => {
        state.itemClassification.data = action.payload;
        state.itemClassification.isLoaded = true;
      })
      .addCase(getItemSubclassifications.fulfilled, (state, action) => {
        state.itemSubclassification.data = action.payload;
        state.itemSubclassification.isLoaded = true;
      })
      .addCase(getItems.fulfilled, (state, action) => {
        state.item.data = action.payload;
        state.item.isLoaded = true;
      })
      .addCase(getItemAll.fulfilled, (state, action) => {
        state.item.data = action.payload;
        state.item.isLoaded = true;
      })
      .addCase(getItemCombo.fulfilled, (state, action) => {
        state.itemCombo.data = action.payload;
        state.itemCombo.isLoaded = true;
      })
      .addCase(getPrinterStations.fulfilled, (state, action) => {
        state.printerStation.data = action.payload;
        state.printerStation.isLoaded = true;
      })
      .addCase(getPriceList.fulfilled, (state, action) => {
        state.priceList.data = action.payload;
        state.priceList.isLoaded = true;
      })
      .addCase(getWarehouse.fulfilled, (state, action) => {
        state.warehouse.data = action.payload;
        state.warehouse.isLoaded = true;
      })
      .addCase(getDineType.fulfilled, (state, action) => {
        state.dineType.data = action.payload;
        state.dineType.isLoaded = true;
      })
      .addCase(getCompany.fulfilled, (state, action) => {
        state.company.data = action.payload;
        state.company.isLoaded = true;
      })
      .addCase(getHeader.fulfilled, (state, action) => {
        state.header.data = action.payload;
        state.header.isLoaded = true;
      })
      .addCase(getSysPar.fulfilled, (state, action) => {
        state.syspar.data = action.payload;
        state.syspar.isLoaded = true;
      })
      .addCase(getVoidReason.fulfilled, (state, action) => {
        state.voidreason.data = action.payload;
        state.voidreason.isLoaded = true;
      })
      .addCase(getFreeReason.fulfilled, (state, action) => {
        state.freeReason.data = action.payload;
        state.freeReason.isLoaded = true;
      })
      .addCase(getTaxCode.fulfilled, (state, action) => {
        state.syspar.data = action.payload;
        state.syspar.isLoaded = true;
      })
      .addCase(getSpecialRequest.fulfilled, (state, action) => {
        state.specialrequest.data = action.payload;
        state.specialrequest.isLoaded = true;
      })
      .addCase(getSpecialRequestGroup.fulfilled, (state, action) => {
        state.specialrequest.data = action.payload;
        state.specialrequest.isLoaded = true;
      })
      .addCase(getMasterFile.fulfilled, (state, action) => {
        state.file.data = action.payload;
        state.file.isLoaded = true;
      })
      .addCase(getMenus.fulfilled, (state, action) => {
        state.menus.data = action.payload;
        state.menus.isLoaded = true;
      })
      .addCase(getDiscount.fulfilled, (state, action) => {
        state.discount.data = action.payload;
        state.discount.isLoaded = true;
      })
      .addCase(getMasterFileLog.fulfilled, (state, action) => {
        state.masterfilelog.data = action.payload;
        state.masterfilelog.isLoaded = true;
      })
      .addCase(getCardType.fulfilled, (state, action) => {
        console.log("ETO PA", action.payload);
        state.cardType.data = action.payload;
        state.cardType.isLoaded = true;
      })
      .addCase(getFooter.fulfilled, (state, action) => {
        state.footer.data = action.payload;
        state.footer.isLoaded = true;
      })
      .addCase(getPaymentType.fulfilled, (state, action) => {
        state.paymentType.data = action.payload;
        state.paymentType.isLoaded = true;
      })
      .addCase(getCashIOReason.fulfilled, (state, action) => {
        state.cashioreason.data = action.payload;
        state.cashioreason.isLoaded = true;
      })
      .addCase(getMEMC.fulfilled, (state, action) => {
        state.memc.data = action.payload;
        state.memc.isLoaded = true;
      })
      .addCase(putFooter.fulfilled, (state, action) => {
        state.footer.data = action.payload;
        state.footer.isLoaded = true;
      })
      .addCase(getBranch.fulfilled, (state, action) => {
        state.branch.data = action.payload.branches;
        state.branch.isLoaded = true;
      })
      .addCase(putHeader.fulfilled, (state, action) => {
        state.header.data = action.payload;
        state.branch.isLoaded = true;
      })
      .addCase(putSysPar.fulfilled, (state, action) => {
        state.syspar.data = action.payload;
        state.syspar.isLoaded = true;
      })
  },
});

export const {
  setMallFields,
  setPaymentType,
  setTerminal,
  setItemClassification,
  setItemSubclassification,
  setItem,
  setItemCombo,
  setPriceList,
  setWarehouse,
  setDineType,
  setCompany,
  setCardType,
  setMasterFileLog,
  setHeader,
  setSysPar,
  setVoidReason,
  setFreeReason,
  setTaxCode,
  setSpecialRequest,
  setSpecialRequestGroup,
  setMasterFile,
  setMenus,
  setFooter,
  updateItemCombo,
  setCashIOReason,
  addOrReplaceItemClassification,
  addOrReplaceItemSubclassification
} = masterfileSlice.actions;
export const selectModal = (state: RootState) => state.masterfile;
export default masterfileSlice.reducer;
