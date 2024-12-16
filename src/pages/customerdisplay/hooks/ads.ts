import { useState } from "react";
import { useService } from "../../../hooks/serviceHooks"
import { serverURL } from "../../../services";

export function useAdvertisementHook() {

  const { getData, query } = useService("advertisement");
  const [images, setImages] = useState<string[]>([])

  const fetchImages = async (path: string) => {
    const result = await getData(query({
      imgsPath: path
    })) as any;
    if (result && result.data) {
      const urls = [];
      for (const imgName of result.data) {
        const url = `${serverURL}advertisement/image/?imgsPath=${path}&imgName=${imgName}`
        urls.push(url);
      }

      setImages(urls);
    }
    else
      setImages([]);
  }

  return {
    images,
    fetchImages
  }
}