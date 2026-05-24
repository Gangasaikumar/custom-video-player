import { useEffect, useState } from "react";

export function useDevToolsDetect() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setOpen(window.outerWidth - window.innerWidth > 160);
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return open;
}