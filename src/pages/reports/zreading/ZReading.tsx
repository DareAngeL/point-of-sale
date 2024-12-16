/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthFragment } from "./fragments/AuthFragment";
import {
  FileTypeSelection,
  ZReadingFileTypes,
} from "../common/FileTypeSelection";
import { LoadingFragment } from "./fragments/LoadingFragment";
import { InformFragment } from "./fragments/InformFragment";
import { NoEODFragment } from "./fragments/NoEODFragment";
import { FragmentType, useZReadingModalSwitcher } from "./hooks/zreadingModalSwitcher";
import { useZReadingInitializer } from "./hooks/zreadingInitializer";
import { GenerationInfo } from "./fragments/GenerationInfo";
import { useZReadingGenerator } from "./hooks/zreadingGenerator";
import { ProcessingFragment } from "./fragments/ProcessingFragment";
import { NoCashDeclaration } from "./fragments/NoCashDeclaration";
import { PosfileValidationFragment } from "./fragments/PosfileValidationFragment";
import { toast } from "react-toastify";
import { validatePosfile } from "../../../store/actions/posfile.action";
import { removeXButton } from "../../../reducer/modalSlice";

// enum FragmentType {
//   VALIDATION,
//   DEFAULT,
//   AUTHORIZATION,
//   FILETYPE,
//   PROCESSING,
//   INFORM,
//   NOCASHDECL,
//   NOEOD,
//   GENERATE,
// }

export interface GeneratingType {
  zreading: {
    isGenerating: boolean;
    isError: boolean;
  },
  backupDB: {
    triggerBackup: boolean;
    isGenerating: boolean;
    isError: boolean;
  },
  mallhookup: {
    loadingTxt: string;
    isGenerating: boolean;
    isError: boolean;
  },
  transferCentralFile: {
    isGenerating: boolean;
    isError: boolean;
  },
  receipt: {
    isPreparing: boolean;
    isGenerating: boolean;
    isError: boolean;
  },
}

export function ZReading() {

  const [activeDate, setActiveDate] = useState<string>(""); // the current date we are generating z-read for.
  const [allLoadedData, setAllLoadedData] = useState<any[]>([]);
  const [generating, setGenerating] = useState<GeneratingType>({
    zreading: {
      isGenerating: true,
      isError: false,
    },
    backupDB: {
      triggerBackup: false,
      isGenerating: true,
      isError: false,
    },
    mallhookup: {
      loadingTxt: "",
      isGenerating: true,
      isError: false
    },
    transferCentralFile: {
      isGenerating: true,
      isError: false,
    },
    receipt: {
      isPreparing: false,
      isGenerating: true,
      isError: false,
    },
  });

  const { 
    fragmentType,
    dispatchModal,
    switchToCashDecl,
    switchToAuth,
    switchToFileTypeSelection,
    switchToGenerateInfo,
    switchToNoEOD,
    switchToProcessing,
    switchToValidation,
  } = useZReadingModalSwitcher();

  const { appDispatch, hasOpenTran } = useZReadingInitializer(
    setAllLoadedData,
    switchToGenerateInfo,
    switchToNoEOD,
    switchToCashDecl
  );

  const { startGenerating } = useZReadingGenerator(allLoadedData, setActiveDate, dispatchModal, setGenerating, switchToProcessing, switchToFileTypeSelection)

  const Navigate = useNavigate();

  const handleOnGenerateZReading = async (selectedFileTypes: ZReadingFileTypes[]) => startGenerating(selectedFileTypes);

  const handleValidation = async (selectedFileTypes: ZReadingFileTypes[]) => {
    appDispatch(removeXButton(true));
    switchToValidation();
    const response = await appDispatch(validatePosfile())
            
      if (response.payload.data && (response.payload.data[0].hasDiscrepancy || response.payload.data[1].hasDiscrepancy)) {
        toast.error('Sales data has discrepancy. Please contact your POS provider', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true
        })

        setTimeout(() => {
          switchToFileTypeSelection();
          appDispatch(removeXButton(false));
        }, 1000)
      } else {
        toast.success('Sales data validated successfully!', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true
        })
        setTimeout(() => {
          handleOnGenerateZReading(selectedFileTypes)
        }, 1000)
      }
  }

  switch (fragmentType) {
    case FragmentType.AUTHORIZATION:
      return <AuthFragment onAuthorized={switchToFileTypeSelection} />;
    case FragmentType.VALIDATION:
      return (
        <PosfileValidationFragment />
      );
    case FragmentType.FILETYPE:
      return (
        <FileTypeSelection
          handleOnOkBtnClick={handleValidation}
          handleOnCancelBtnClick={() => Navigate(-1)}
        />
      );
    case FragmentType.PROCESSING:
      return (
        <ProcessingFragment
          generating={generating}
          activeDate={activeDate}
        />
      )
    case FragmentType.INFORM:
      return <InformFragment />;
    case FragmentType.NOEOD:
      return (
        <NoEODFragment
          switchToAuth={switchToAuth}
          switchToFileTypeSelection={switchToFileTypeSelection}
        />
    );
    case FragmentType.NOCASHDECL:
      return (
        <NoCashDeclaration modalDispatch={dispatchModal}  />
      );
    case FragmentType.GENERATE:
      return (
        <GenerationInfo
          allLoadedData={allLoadedData}
          switchToAuth={switchToAuth}
          switchToFileTypeSelection={switchToFileTypeSelection}
          hasOpenTran={hasOpenTran}
        />
      )
    default:
      return <LoadingFragment title={"Loading..."} />;
  }
}
