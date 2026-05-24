import { useEffect, useState } from "react";

const positions = [
  { top: 10, left: 10 },
  { top: 10, right: 10 },
  { bottom: 10, left: 10 },
  { bottom: 10, right: 10 },
  { top: "40%", left: "40%" },
];

export function useWatermarkPosition(interval = 20000) {
  const [pos, setPos] = useState(positions[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setPos(positions[Math.floor(Math.random() * positions.length)]);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  return pos;
}