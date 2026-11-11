import { useEffect } from "react";
import { IconCheck } from "./Icons";

export function Toast({ msg, onDone }) {
  useEffect(() => {
    if (msg) {
      const t = setTimeout(onDone, 3000);
      return () => clearTimeout(t);
    }
  }, [msg, onDone]);

  if (!msg) return null;
  return (
    <div className="toast">
      <IconCheck /> {msg}
    </div>
  );
}

