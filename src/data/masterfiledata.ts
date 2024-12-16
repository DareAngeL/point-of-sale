const rootPath = "/pages/masterfile/";

export const masterfileList = {
  name: "Master files",
  children: [
    {
      name: "Header",
      url: `${rootPath}header`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_header",
      isPage: false,
    },
    {
      name: "System Parameters",
      url: `${rootPath}systemParameters`,
      modalName: "Parameters",
      menfield: "masterfile_system_parameters",
      isPage: false,
    },
    {
      name: "Other Charges",
      url: `${rootPath}otherCharges`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_other_charges",
      isPage: false,
    },
    {
      name: "Footer",
      url: `${rootPath}footer`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_footer",
      isPage: false,
    },
    {
      name: "Printer Stations",
      url: `/pages/printerStations`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_printer_stations",
      isPage: true,
    },
    {
      name: "Item Classifications",
      url: `/pages/itemClassifications`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_itemclass",
      isPage: true,
    },
    {
      name: "Item Subclassifications",
      url: `/pages/itemSubclassifications`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_itemsub",
      isPage: true,
    },
    {
      name: "Items",
      url: `/pages/items`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_items",
      isPage: true,
    },
    {
      name: "Special Request",
      url: `/pages/specialRequests`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_special_requests",
      isPage: true,
    },
    {
      name: "Void/Refund Reasons",
      url: `/pages/reasons`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_void_reasons",
      isPage: true,
    },
    {
      name: "Discounts",
      url: `/pages/discount`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_discounts",
      isPage: true,
    },
    {
      name: "Order Type",
      url: `/pages/dineType`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_dinetype",
      isPage: true,
    },
    {
      name: "Price List",
      url: `/pages/priceList`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_pricelist",
      isPage: true,
    },
    {
      name: "Card Types",
      url: `/pages/cardType`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_card_types",
      isPage: true,
    },
    {
      name: "MEMC",
      url: `/pages/memc`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_memc",
      isPage: true,
    },
    {
      name: "Free Reasons",
      url: `/pages/freereasons`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_free_reasons",
      isPage: true,
    },
    {
      name: "Users",
      url: `/pages/users`,
      modalName: "Users",
      menfield: "masterfile_users",
      isPage: true,
    },
    {
      name: "Payment Type",
      url: `/pages/paymentType`,
      modalName: "Receipt/Printout Header",
      menfield: "masterfile_other_payments",
      isPage: true,
    },
    {
      name: "Mall Hook Up Parameter",
      url: `${rootPath}mallHookUp`,
      modalName: "Mall Hook Up",
      menfield: "masterfile_mall_hookup",
      isPage: false,
    },
    {
      name: "Warehouse",
      url: "/pages/warehouse",
      modalName: "Warehouse",
      menfield: "masterfile_tenant",
      isPage: true,
      disabled: true
    },
    {
      name: "Cash In/Out Reason",
      url: `/pages/cashioreason`,
      modalName: "Cash In/Out Reason",
      menfield: "masterfile_cashioreason",
      isPage: true,
    },
  ],
};