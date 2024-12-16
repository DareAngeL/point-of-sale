import { Masterfile } from "./Masterfile";
import { Header } from "./header/Header";
import { SystemParameters } from "./systemparemeters/SystemParameters";
import { OtherCharges } from "./othercharges/OtherCharges";
import { Footer } from "./footer/Footer";
import { ItemClassification } from "./itemclassifications/ItemClassification";
import { ItemSubclassification } from "./itemsubclassifications/ItemSubclassifications";
import { Item } from "./items/Items";
import { SpecialRequest } from "./specialrequest/SpecialRequest";
import { VoidReason } from "./reasons/Reasons";
import { Discount } from "./discount/Discount";
import { OrderType } from "./ordertype/OrderType";
import { PriceList } from "./pricelist/PriceList";
import { CardType } from "./cardtype/CardType";
import { ApiService } from "../../services";
import { PrinterStation } from "./printerstation/PrinterStation";
import { Memc } from "./memc/Memc";
import { PaymentType } from "./otherpaymenttype/PaymentType";
import { FreeReasons } from "./freereasons/FreeReasons";
import { PriceDetails } from "./pricelist/PriceDetails";
import { Warehouse } from "./warehouse/Warehouse";
import { WarehouseDetail } from "./warehouse/WarehouseDetail";
import { AuthenticationGuard } from "../../security/authentication/AuthGuards";
import { Users } from "./users/Users";
import RouteTransition from "../../common/routeTransition/RouteTranstion";
import { CashIOReasons } from "./cashioreason/CashIOReason";
import { SelectionCardEmpty } from "./selectionCard/SelectionCardEmpty";
import { MallHookUpV2 } from "./mallhookup/MallHookUpV2";

export const masterfileRoute = [
  {
    path: "masterfile",
    element: (
      <RouteTransition animationType="slideRight" disableScrollBar={true}>
        <AuthenticationGuard isAccount={true} redirectTo={"/pages/home"}>
          <Masterfile />
        </AuthenticationGuard>
      </RouteTransition>
    ),
    children: [
      {
        path: "header",
        element: (
          <RouteTransition animationType="slideBottom">
            <Header />,
          </RouteTransition>
        ),
        loader: async () => await ApiService.get("headerfile"),
      },
      {
        path: "systemParameters",
        element: (
          <RouteTransition animationType="slideBottom">
            <SystemParameters />
          </RouteTransition>
        ),
        loader: async () => await ApiService.get("systemparameters"),
      },
      {
        path: "otherCharges",
        element: (
          <RouteTransition animationType="slideBottom">
            <OtherCharges />
          </RouteTransition>
        ),
        loader: async () => await ApiService.get("systemparameters"),
      },
      {
        path: "footer",
        element: (
          <RouteTransition animationType="slideBottom">
            <Footer />
          </RouteTransition>
        ),
        loader: async () => await ApiService.get("footer"),
      },
      {
        path: "mallHookUp",
        element: (
          <RouteTransition animationType="slideBottom">
            <MallHookUpV2 />
          </RouteTransition>
        ),
      },
    ],
  },
  {
    path: "printerStations",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <PrinterStation />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () =>
      await ApiService.get("printerstation/?page=0&pageSize=10"),
  },
  {
    path: "itemClassifications",
    element: (
      <AuthenticationGuard
        isAccount={true}
        redirectTo={"/pages/login/?page=0&pageSize=10"}
      >
        <RouteTransition animationType="slideTop">
          <ItemClassification />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () =>
      await ApiService.get("itemclassification/?page=0&pageSize=10"),
  },
  {
    path: "itemSubclassifications",
    element: (
      <AuthenticationGuard
        isAccount={true}
        redirectTo={"/pages/login/?page=0&pageSize=10"}
      >
        <RouteTransition animationType="slideTop">
          <ItemSubclassification />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () =>
      await ApiService.get("itemsubclassification/?page=0&pageSize=10"),
  },
  {
    path: "items",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <Item />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("item/?page=0&pageSize=10"),
  },
  {
    path: "specialRequests",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <SpecialRequest />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () =>
      await ApiService.get("specialrequest/?page=0&pageSize=10"),
  },
  {
    path: "reasons",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <VoidReason />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("voidreason/?page=0&pageSize=10"),
  },
  {
    path: "discount",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <Discount />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("discount/?page=0&pageSize=10"),
  },
  {
    path: "dineType",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <OrderType />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("dinetype/?page=0&pageSize=10"),
  },
  {
    path: "priceList",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <PriceList />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("pricelist/?page=0&pageSize=10"),
  },
  {
    path: "priceDetail/:prccde",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <PriceDetails />
        </RouteTransition>
      </AuthenticationGuard>
    ),
  },
  {
    path: "cardType",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <CardType />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("cardtype"),
  },
  {
    path: "memc",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <Memc />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("memc"),
  },
  {
    path: "freeReasons",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <FreeReasons />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("freereason"),
  },
  {
    path: "users",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <Users />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () =>
      await ApiService.getAll("userFile/filter", {
        params: { usrtyp: "ne:ROOT" },
      }),
  },
  {
    path: "paymentType",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <PaymentType />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("otherpayment"),
  },
  {
    path: "warehouse",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <Warehouse />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("warehouse"),
  },
  {
    path: "warehousedetail/:warcde",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideBottom">
          <WarehouseDetail />
        </RouteTransition>
      </AuthenticationGuard>
    ),
  },
  {
    path: "cashIOReason",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <CashIOReasons />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("cashioreason"),
  },
  {
    path: "maintenance",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <SelectionCardEmpty />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => await ApiService.get("cashioreason"),
  },
];
