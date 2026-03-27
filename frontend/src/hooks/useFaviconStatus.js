import { useEffect } from "react";
import { faviconStates, setDocumentTitle, setFavicon } from "../utils/favicon";

const useFaviconStatus = (status = "idle") => {
  useEffect(() => {
    const state = faviconStates[status] || faviconStates.idle;
    setFavicon(state.icon);
    setDocumentTitle(state.title);

    return () => {
      const fallback = faviconStates.idle;
      setFavicon(fallback.icon);
      setDocumentTitle(fallback.title);
    };
  }, [status]);
};

export default useFaviconStatus;