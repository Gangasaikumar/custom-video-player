import { useEffect } from "react";

export function useSecurity() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F12") e.preventDefault();
    };
    document.addEventListener("keydown", handler);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);
}
