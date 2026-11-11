import { useState, useEffect } from "react";

export function useApi(url, init) {
  const [state, set] = useState({ data: init, loading: true, error: null });

  useEffect(() => {
    const ac = new AbortController();
    set((s) => ({ ...s, loading: true, error: null }));
    fetch(url, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => set({ data, loading: false, error: null }))
      .catch((e) => {
        if (e.name !== "AbortError") set((s) => ({ ...s, loading: false, error: e }));
      });
    return () => ac.abort();
  }, [url]);

  return state;
}

