import { Tabs, TabsProps } from "antd";
import { Checkbox } from "../../../../common/form/Checkbox";
import { InputPesoNumber } from "../../../../common/form/InputPesoNumber";
import { InputText } from "../../../../common/form/InputText";
import { LazySelect } from "../../../../common/form/LazySelect";
import { Selection } from "../../../../common/form/Selection";
import { Modal } from "../../../../common/modal/Modal";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { ItemModel } from "../../../../models/items";
import { useState } from "react";
import { Default } from "../combomealcomponents/Default";
import { Others } from "../combomealcomponents/Others";
import { Upgrade } from "../combomealcomponents/Upgrade";
import { useInitItemsModal, useItemsInputFieldsHandler, useSubmitItemsModal } from "../hooks/itemsModal";
import { useItem } from "../../../../hooks/masterfileHooks";
import { useAppSelector } from "../../../../store/store";
import { InputNumber } from "../../../../common/form/InputNumber";
import { useFormInputValidation } from "../../../../hooks/inputValidation";
import { InfoCard } from "../../InfoCard";

interface ItemsModalProps {
  setAllLoadedData: React.Dispatch<React.SetStateAction<ItemModel[]>>;
  inputValidation: any;
  itemModalData: ItemModel | undefined;
  setItemModalData: React.Dispatch<React.SetStateAction<ItemModel | undefined>>;
  allLoadedData: ItemModel[];
  isCentralConnected: React.MutableRefObject<boolean>;
  editCopy: any;
  activeItemEdit: ItemModel | undefined;
  setActiveItemEdit: React.Dispatch<ItemModel | undefined>;
  status: string;
}

export function ItemsModal(props: ItemsModalProps) {
 
  const { validateInputCharacters } = useFormInputValidation();

  const { syspar } = useAppSelector((state) => state.masterfile);
  const { itemCombo, memc, printerStation } = useAppSelector(state => state.masterfile);
  //#region combo meal states
  const [selectedUpgrade, setSelectedUpgrade] = useState<any | undefined>();
  const [upgradePrice, setUpgradePrice] = useState<number | undefined>();
  const [upgradeList, setUpgradeList] = useState<any[]>([]);
  const [selectedOthers, setSelectedOthers] = useState<any[]>([]);
  const [selectedItemCombos, setSelectedItemCombos] = useState<any[]>([]);
  const [comboItemSelectedItemSubclass, setComboItemSelectedItemSubclass] = useState<any|undefined>(undefined);
  const [comboItemSelectedItemClass, setComboItemSelectedItemclass] = useState<any|undefined>(undefined);
  const [selectedDefault, setSelectedDefault] = useState<any | undefined>();
  const [activeComtyp, setActiveComptyp] = useState<string | undefined>("Default");
  //#endregion

  const {activeClass, setActiveClass, itemClassif} = useItem(props.allLoadedData);

  const { openInfoCard, modalBodyRef, setOpenInfoCard } = useInitItemsModal(
    itemCombo, 
    props.activeItemEdit, 
    activeClass, 
    props.setItemModalData, 
    setSelectedDefault, 
    setComboItemSelectedItemclass, 
    setComboItemSelectedItemSubclass,
    setSelectedItemCombos,
    setSelectedOthers,
    setUpgradeList,
  );
  
  const { 
    handleAddUpgrade, 
    handleRemoveUpgrade,
    handleInputChange,
    handleSelectChange,
  } = useItemsInputFieldsHandler(
    props.inputValidation.changeRequiredValue,
    props.setItemModalData,
    itemClassif,
    setActiveClass,
    upgradePrice,
    selectedDefault,
    selectedUpgrade,
    setUpgradePrice,
    setSelectedDefault,
    setSelectedUpgrade,
    upgradeList,
    setUpgradeList
  );

  const { onSubmitForm } = useSubmitItemsModal(
    modalBodyRef,
    setOpenInfoCard,
    props.setItemModalData,
    props.setAllLoadedData,
    props.inputValidation.changeRequiredValue,
    props.activeItemEdit,
    activeComtyp,
    selectedItemCombos,
    selectedOthers,
    setActiveComptyp,
    upgradeList,
    itemCombo,
    props.itemModalData,
    props.editCopy,
    props.status,
  )
  
  // COMBO MEAL
  const comboMeals: TabsProps["items"] = [
    {
      key: "1",
      label: "Default",
      children: (
        <Default 
          itemModalData={props.itemModalData}
          comboItemSelectedItemClass={comboItemSelectedItemClass}
          comboItemSelectedItemSubclass={comboItemSelectedItemSubclass}
          selectedItemCombos={selectedItemCombos}
          setSelectedItemCombos={setSelectedItemCombos}
          setSelectedDefault={setSelectedDefault}
        />
      ),
    },
    {
      key: "2",
      label: "Others",
      children: (
        <Others 
          selectedOthers={selectedOthers}
          setSelectedOthers={setSelectedOthers}
          comboItemSelectedItemClass={comboItemSelectedItemClass}
          comboItemSelectedItemSubclass={comboItemSelectedItemSubclass}
          itemModalData={props.itemModalData}
        />
      ),
    },
    {
      key: "3",
      label: "Upgrade",
      children: (
        <Upgrade 
          selectedDefault={selectedDefault}
          selectedItemCombos={selectedItemCombos}
          setSelectedDefault={setSelectedDefault}
          comboItemSelectedItemClass={comboItemSelectedItemClass}
          comboItemSelectedItemSubclass={comboItemSelectedItemSubclass}
          itemModalData={props.itemModalData}
          upgradeList={upgradeList}
          setUpgradeList={setUpgradeList}
          handleAddUpgrade={handleAddUpgrade}
          handleRemoveUpgrade={handleRemoveUpgrade}
          selectedUpgrade={selectedUpgrade}
          setSelectedUpgrade={setSelectedUpgrade}
          setUpgradePrice={setUpgradePrice}
          upgradePrice={upgradePrice}
        />
      ),
    },
  ];
  
  return (
    <Modal
      title={"Items"}
      maxWidth="500px"
      bodyRef={modalBodyRef}
      onClose={() => {
        props.inputValidation.clearErrors();
        setSelectedItemCombos([]);
        props.setActiveItemEdit(undefined);
        setActiveComptyp("Default");
        setOpenInfoCard(false);
      }}
    >
      {openInfoCard && (
        <InfoCard onClose={() => setOpenInfoCard(false)} />
      )}

      <span className="text-[10px] text-gray-500">
        Fields with (*) asterisk are required
      </span>

      <form
        id="i-form"
        onSubmit={props.inputValidation.handleSubmit(onSubmitForm)}
        className="flex gap-4 flex-col"
      >
        <div>
          <InputText
            id="barcde"
            name="barcde"
            handleInputChange={(e) => validateInputCharacters(e.target.value, 100) ? handleInputChange(e) : null}
            description="Barcode"
            value={props.itemModalData?.barcde}
            linkCentral={true}
          />
        </div>

        <InputText
          id="itmdsc"
          name="itmdsc"
          handleInputChange={(e) => validateInputCharacters(e.target.value, 100) ? handleInputChange(e) : null}
          description="Item *"
          value={props.itemModalData?.itmdsc}
          error={props.inputValidation.errors}
          linkCentral={true}
        />

        <InputText
          id="itmdscforeign"
          name="itmdscforeign"
          handleInputChange={(e) => validateInputCharacters(e.target.value, 100) ? handleInputChange(e) : null}
          description="Item Foreign Description"
          value={props.itemModalData?.itmdscforeign}
          linkCentral={true}
        />

        <Selection
          id="itmtyp"
          name="itmtyp"
          handleSelectChange={handleSelectChange}
          description="Item Type *"
          value={props.itemModalData?.itmtyp}
          keyValuePair={[
            {
              value: "INVENTORY",
              key: "INVENTORY",
            },
            {
              value: "NON-INVENTORY",
              key: "NON-INVENTORY",
            },
            {
              value: "CHARGES",
              key: "CHARGES",
            },
            {
              value: "SERVICES",
              key: "SERVICES",
            },
          ]}
          error={props.inputValidation.errors}
          linkCentral={true}
        />

        <Selection
          handleSelectChange={handleSelectChange}
          description={"Item Classification *"}
          value={props.itemModalData?.itmclacde}
          id={"itmclacde"}
          name={"itmclacde"}
          keyValuePair={itemClassif.map((item) => {
            return {key: item.itmcladsc, value: item.itmclacde};
          })}
          error={props.inputValidation.errors}
          linkCentral={true}
        />

        <Selection
          handleSelectChange={handleSelectChange}
          description={"Item Subclassification *"}
          value={props.itemModalData?.itemsubclasscde}
          id={"itemsubclasscde"}
          name={"itemsubclasscde"}
          keyValuePair={activeClass?.itemsubclassfiles.map((item) => {
            return {
              key: item.itemsubclassdsc,
              value: item.itemsubclasscde,
            };
          })}
          error={props.inputValidation.errors}
          linkCentral={true}
        />

        <InputText
          id="untmea"
          name="untmea"
          handleInputChange={(e) => validateInputCharacters(e.target.value, 5) ? handleInputChange(e) : null}
          description="Unit of Measure"
          value={props.itemModalData?.untmea}
          linkCentral={true}
        />

        <div>
          <InputPesoNumber
            handleInputChange={handleInputChange}
            id="untcst"
            name="untcst"
            value={props.itemModalData?.untcst}
            description={"Unit of Cost"}
            {...syspar.data[0].withtracc === 1 && {disabled: true}}
          />
        </div>

        <div>
          <InputPesoNumber
            handleInputChange={handleInputChange}
            id="untprc"
            name="untprc"
            value={props.itemModalData?.untprc}
            description={"Selling Price *"}
            error={props.inputValidation.errors}
            {...syspar.data[0].withtracc === 1 && {disabled: true}}
          />
        </div>

        <InputNumber 
          handleInputChange={handleInputChange} 
          name="itmpaxcount" 
          id="itmpaxcount"
          description={"Good for X Person(s)"}  
          value={props.itemModalData?.itmpaxcount ?? 1} 
        />

        {syspar.data[0].sticker_printer === 1 && (
          <Selection
            handleSelectChange={handleSelectChange} 
            description={"Sticker Printer Station"} 
            id={"locationcde"} 
            name={"locationcde"}
            value={props.itemModalData?.locationcde}
            keyValuePair={
              printerStation.data
                .filter((d) => d.isSticker === 1)
                .map((d) => {
                  return {key: d.locationdsc, value: d.locationcde};
                })
            }
          />
        )}

        <Selection
          id="taxcde"
          name="taxcde"
          handleSelectChange={handleSelectChange}
          description="Tax Code *"
          value={props.itemModalData?.taxcde}
          keyValuePair={[
            {
              value: "VATABLE",
              key: "VATABLE",
            },
            {
              value: "VAT EXEMPT",
              key: "VAT EXEMPT",
            },
          ]}
          error={props.inputValidation.errors}
          linkCentral={true}
        />

        <Selection
          id="memc"
          name="memc"
          handleSelectChange={handleSelectChange}
          description="MEMC"
          value={props.itemModalData?.memc}
          linkCentral={true}
          keyValuePair={memc.data
            .filter(d => { 
              const price = props.itemModalData ? props.itemModalData?.untprc : '';
              const fixedPrice = price ? (
                typeof price === 'string' ?
                  parseFloat((price as string).replace(',', ''))
                  : 
                  price
              ) : 0;
              
              return parseFloat(d.value) <= fixedPrice;
            })
            .map((item) => {
              return {value: item.code, key: item.codedsc};
            })
          }
        />
        {/* <button onClick={testButton}>GEGE</button> */}

        <div className="flex justify-between">
          <Checkbox
            handleInputChange={handleInputChange}
            checked={props.itemModalData?.isaddon}
            id={"isaddon"}
            name={"isaddon"}
            description={"Add on"}
          />

          <Checkbox
            handleInputChange={handleInputChange}
            checked={props.itemModalData?.inactive}
            id={"inactive"}
            name={"inactive"}
            description={"Inactive"}
            linkCentral={true}
          />

          <Checkbox
            handleInputChange={handleInputChange}
            checked={props.itemModalData?.chkcombo}
            id={"chkcombo"}
            name={"chkcombo"}
            description={"COMBO MEAL"}
            linkCentral={true}
          />
        </div>

        {props.itemModalData?.chkcombo ? (
          <>
            <div className="shadow">
              <label className="font-montserrat font-bold">Filter</label>
              <div className="m-2">
                <LazySelect
                  isMulti={false}
                  id={"comboclass"}
                  name={"comboclass"}
                  description="Item Classification"
                  mainURLPath="itemclassification/filter"
                  onChange={(e)=> {
                    setComboItemSelectedItemclass(e);
                  }}
                  optionsProps={{
                    key: "itmcladsc",
                    value: "itmclacde"
                  }}
                  value={comboItemSelectedItemClass}
                />

                <LazySelect
                  isMulti={false}
                  id={"combosubclass"}
                  name={"combosubclass"}
                  mainURLPath="itemsubclassification/filter"
                  description="Item Sub-Classification"
                  onChange={(e)=> {
                    setComboItemSelectedItemSubclass(e);
                  }}
                  optionsProps={{
                    key: "itemsubclassdsc",
                    value: "itemsubclasscde"
                  }}
                  value={comboItemSelectedItemSubclass}
                  queries={{
                    itmclacde: comboItemSelectedItemClass && comboItemSelectedItemClass.value,
                    hide_subclass: 0
                  }}
                />
              </div>
            </div>

            <Tabs
              defaultActiveKey={"1"}
              items={comboMeals}
              onChange={(key) => {
                const selectedLabel = comboMeals.find(
                  (item) => item.key === key
                )?.label;
                setActiveComptyp(selectedLabel as string);
              }}
            />
          </>
        ) : (
          <></>
        )}
      </form>

      <ButtonForm<ItemModel>
        isShowWarningCancel
        data={props.itemModalData}
        formName={"i-form"}
        okBtnTxt={"Save"}
        // isCentralConnected={props.isCentralConnected.current}
        onCancelBtnClick={() => {
          setSelectedItemCombos([]);
          props.setActiveItemEdit(undefined);
          setActiveComptyp("Default");
          setOpenInfoCard(false);
        }}
      />
    </Modal>
  )
}