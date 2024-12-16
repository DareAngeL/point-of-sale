import { useState } from "react";
import { AppDispatch } from "../../../../store/store";
import { testRobinsonConnection } from "../../../../store/actions/mallhookup.action";
import { toast } from "react-toastify";

export function useRobinsonEssentials(appDispatch: AppDispatch, removeXbuttonDispatch: (remove: boolean) => void) {

    const [isTestingConnection, setIsTestingConnection] = useState(false);

    const handleOnTestConnection = async () => {
        setIsTestingConnection(true);
        document.body.style.cursor = 'wait';
        removeXbuttonDispatch(true);
        const loadingId = toast.loading("Testing connection. Please wait...", {
            hideProgressBar: true,
            position: 'top-center',
        });

        const response = await appDispatch(testRobinsonConnection());
        if (response.meta.requestStatus === 'fulfilled') {
          if (response.payload.status === "success") {
            toast.success("Connection successful", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 2000,
            });
          }
          else {
            toast.error("Connection failed", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 2000,
            });
          }
        }

        setIsTestingConnection(false);
        document.body.style.cursor = 'default';
        removeXbuttonDispatch(false);
        toast.dismiss(loadingId);
      }

    return {
        isTestingConnection,
        handleOnTestConnection,
    }
}