import { SketchPicker } from "react-color";
import { HomeCard } from "../../home/homecard/HomeCard";
import { BookOutlined, DesktopOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { BackButton } from "../../../common/backbutton/BackButton";
import { PageTitle } from "../../../common/title/MasterfileTitle";
import { useAppDispatch } from "../../../store/store";
import { isPage } from "../../../reducer/pageSlice";
import { useTheme } from "../../../hooks/theme";
import Search from "../../../common/search/Search";
import { useComponentPreview } from "./hooks/componentPreview";
import { useColorChangeHandler } from "./hooks/colorChangeHandler";

export function ThemeSettings() {

  const appDispatch = useAppDispatch();
  const { ButtonStyled, theme } = useTheme();

  const {
    onColorChange,
    onSubmit,
    orderingBtnColor,
    primaryColor
  } = useColorChangeHandler(theme, appDispatch);

  const { 
    LogoutBtnPreview,
    OrderingSelectedBtnPreview,
    OrderingSelectedTextPreview,
    OrderingUnselectedBtnPreview,
    OrderingUnselectedTextPreview
  } = useComponentPreview();

  return (
    <>
      <div className="flex bg-white z-10 w-full items-center fixed top-0 p-4 border-b-2">
        <BackButton onClick={() => appDispatch(isPage({ isPage: false }))} />
        <PageTitle name={"Theme Settings"} />
      </div>
      {/* PRIMARY COLOR SECTION */}
      <section about="primary-color" className="p-5 mt-[6rem] m-10 rounded border-[1px] font-montserrat">
        <div className="flex flex-col">
          <label className="text-[1.5rem]">Primary Color Selection</label>
          <span>Preview:</span>
        </div>
        <div className="flex items-center justify-center p-2">
          <div id="viewer" className="border mx-2 pb-2">
            <div className="flex items-center justify-between px-[70px] my-2 mx-2">
              <h1 className="font-montserrat text-[2rem]">
                ***********
              </h1>
              <LogoutBtnPreview $color={primaryColor}
                className={`rounded-sm w-[100px] h-[35px] text-white hover:bg-[#f5f7f5]`}
              >
                Logout
              </LogoutBtnPreview>
            </div>
            <div className="flex flex-col gap-4 h-full items-center mx-2">
              <div className="flex justify-center">
                <button className="mx-2">
                  <HomeCard title="Master File" disable={false} primaryColor={primaryColor}>
                    <BookOutlined className={`animation text-[5rem] text-[${primaryColor}]`} />
                  </HomeCard>
                </button>
                <button className="mx-2">
                  <HomeCard title="Cashiering" disable={false} primaryColor={primaryColor}>
                    <DesktopOutlined className={`animation text-[5rem] text-[${primaryColor}]`} />
                  </HomeCard>
                </button>
                <button className="mx-2">
                  <HomeCard disable={false} title="Ordering" primaryColor={primaryColor}>
                    <ShoppingCartOutlined className={`animation text-[5rem] text-[${primaryColor}]`} />
                  </HomeCard>
                </button>
              </div>
            </div>
          </div>

          <SketchPicker 
            color={primaryColor}
            disableAlpha
            onChange={(color) => onColorChange('primary', color.hex)}
          />
        </div>
      </section>
      {/* END - PRIMARY COLOR SECTION */}

      {/* ORDERING - ITEMCLASS BUTTONS */}
      <section about="ordering-itemclasssub-color" className="p-5 m-10 rounded border-[1px] font-montserrat">

        <div className="flex flex-col">
          <label className="text-[1.5rem]">Ordering Buttons Color Selection</label>
          <span>Preview:</span>
        </div>

        <div className="flex items-center justify-center p-2">
          <div id="viewer2" className="border mx-2 p-2">
            <div className="mt-5 h-[94%] w-[56vw] gap-2">
              <div className="flex rounded-lg shadow bg-white p-3 justify-between">
                <div
                  className=" w-[30vw]"
                >
                  <Search primaryColor={primaryColor} />
                </div>
                <div className=" w-[70%] my-auto flex">
                  <label htmlFor="" className="mr-3">
                    PAX
                  </label>
                  <input
                    type="number"
                    className="w-[100%] border-b-blue-900"
                    name="paxcount"
                    onChange={undefined}
                    value={1}
                  />
                </div>
              </div>

              <div className="flex bg-white p-2 h-auto rounded-lg shadow overflow-hidden mt-2">
                <OrderingSelectedBtnPreview $color={orderingBtnColor}
                  className={`rounded border mx-2 font-semibold h-7`}
                >
                  <OrderingSelectedTextPreview $color={orderingBtnColor} className={`rounded px-1 ms-[1px] text-ellipsis whitespace-nowrap px-2`}>
                    EXAMPLE 1
                  </OrderingSelectedTextPreview>
                </OrderingSelectedBtnPreview>

                <OrderingUnselectedBtnPreview $color={orderingBtnColor}
                  className={`rounded border mx-2 font-semibold h-7`}
                >
                  <OrderingUnselectedTextPreview $color={orderingBtnColor} className={`rounded px-1 ms-[1px] text-ellipsis whitespace-nowrap px-2 mb-2`}>
                    EXAMPLE 2
                  </OrderingUnselectedTextPreview>
                </OrderingUnselectedBtnPreview>
              </div>
            </div>
          </div>

          <SketchPicker 
            color={orderingBtnColor}
            disableAlpha
            onChange={(color) => onColorChange('ordering_btns', color.hex)}
          />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-center p-2">
        <ButtonStyled $color={theme.primarycolor}
          className={`flex items-center font-montserrat p-5 rounded h-[35px] text-white`}
          onClick={onSubmit}
        >
          <span>Update Theme</span>
        </ButtonStyled>
      </div>
    </>
  )
}