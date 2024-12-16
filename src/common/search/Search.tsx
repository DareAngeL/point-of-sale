import { useEffect, useRef, useState } from "react";
import { useOrderingModal } from "../../pages/transaction/ordering/hooks/orderingModalHooks";
import { useService } from "../../hooks/serviceHooks";
import { useOrdering } from "../../pages/transaction/ordering/hooks/orderingHooks";
import { useAppSelector } from "../../store/store";
import styled from "styled-components";

interface SearchComponentProps extends React.HTMLProps<HTMLInputElement> {
  onSearchClick?: (text: string) => void;
  onType?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmpty?: () => void;
  isSearching?: (d: boolean) => void;
  onSearchMode?:  React.Dispatch<React.SetStateAction<boolean>>;
  primaryColor?: string;
}

const StyledSearchBtn = styled.button<{ $color?: string; }>`
    background-color: ${props => props.$color}
  `

export default function SearchComponent(props: SearchComponentProps) {

  const [value, setValue] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // const [timeDifference, setTimeDifference] = useState(0);
  const {onAddItem} = useOrderingModal();
  const {getData} = useService("item");
  const {itemCombo} = useOrdering().masterfile;
  const {onAddTransaction} = useOrdering();

  const {transaction} = useAppSelector(state => state.order);

  useEffect(() => {

    if (isEmpty) {
      inputRef.current?.focus();
    }

    //  auto focus on input
    inputRef.current?.focus();

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside);
    }
  }, [])

  useEffect(() => {
    if (isEmpty) {
      inputRef.current?.focus();
    }
  }, [isEmpty])

  const handleClickOutside = () => {
    // console.log(event.target, inputRef);
    // console.log(!inputRef.current?.contains(event.target), event.target.name !== "paxcount");
    // if (!inputRef.current?.contains(event.target) && event.target.name !== "paxcount") {
    //   // Click occurred outside of the input, prevent blur
    //   event.preventDefault();
    //   inputRef.current?.focus();
    // }
  }

  // const onTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    
  // }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    props.onSearchMode?.(true);
    props.onType && props.onType(e);
    if(e.target.value.length === 0){
      props.isSearching && props.isSearching(false);
      props.onEmpty && props.onEmpty();
    }

    if (isEmpty) {
      setIsEmpty(false);
    }

  }

  

  const onSearch = async () => {
    const findItem = await getData(`/barcode/${value}/${transaction.data?.warcde}`)
    const findItemData = findItem as any;
    //BARCODE SCANNED
    if(findItemData?.data){

      const findItemCombo = itemCombo.data.filter((item)=>item.itmcomcde === findItemData.data.itmcde)

      console.log(findItemData.data);

      if(findItemCombo.length > 0){
        onAddItem(findItemData.data.itmcde, findItemData.data.itmdsc)
      }
      else{
        onAddTransaction({itm: findItemData.data});
      }
    }
    else{

      if (value === '') {
        setIsEmpty(true);
        props.isSearching && props.isSearching(false);
        return;
      }
  
      props.isSearching && props.isSearching(true);
      props.onSearchClick?.(value)

    }
  }

  return (
    <div key={props.key} className="flex items-center">
      <div className="flex space-x-1">
        <input
          ref={inputRef}
          type="text"
          className={`block w-full px-4 py-2 text-slate-700 bg-white border rounded-full ${isEmpty? 'focus:ring-red-300 focus:border-red-400' : 'focus:ring-slate-300 focus:border-slate-400'} focus:outline-none focus:ring focus:ring-opacity-40`}
          value={value}
          placeholder="Search..."
          onChange={handleInputChange}
          onBlur={() => setIsEmpty(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}

        />

        <StyledSearchBtn $color={props.primaryColor}
          className="px-4 text-white rounded-full"
          onClick={onSearch}
          form="search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </StyledSearchBtn>
      </div>
    </div>
  );
}
