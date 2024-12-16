import { useState } from "react";
import { useChangeNameModal, useModal } from "../../../../hooks/modalHooks";

export enum FragmentType {
  DEFAULT,
  AUTHORIZATION,
  FILETYPE,
  PROCESSING,
  INFORM,
  NOCASHDECL,
  NOEOD,
  GENERATE,
  VALIDATION
}

export function useZReadingModalSwitcher() {
  
  const [fragmentType, setFragmentType] = useState<FragmentType>(
    FragmentType.VALIDATION
  );

  const { modalNameDispatch } = useChangeNameModal();
  const { dispatch: dispatchModal } = useModal();

  const switchToFileTypeSelection = () => {
    modalNameDispatch("Select Generated Report Type:");
    setFragmentType(FragmentType.FILETYPE); // change view to file type selection
  }

  const switchToAuth = () => {
    modalNameDispatch("Authorized User Only");
    setFragmentType(FragmentType.AUTHORIZATION); // change view to auth
  }

  const switchToGenerateInfo = () => {
    modalNameDispatch("Z Reading");
    setFragmentType(FragmentType.GENERATE); // change view to default
  }

  const switchToCashDecl = () => {
    setFragmentType(FragmentType.NOCASHDECL);
  }

  const switchToNoEOD = () => {
    setFragmentType(FragmentType.NOEOD);
  }

  const switchToProcessing = () => {
    modalNameDispatch("Generating ZReading")
    setFragmentType(FragmentType.PROCESSING);
  }

  const switchToValidation = () => {
    modalNameDispatch("Sales Data Validation");
    setFragmentType(FragmentType.VALIDATION);
  }
  
  return {
    fragmentType,
    switchToFileTypeSelection,
    switchToAuth,
    switchToGenerateInfo,
    switchToCashDecl,
    switchToNoEOD,
    switchToProcessing,
    switchToValidation,
    dispatchModal
  }
}