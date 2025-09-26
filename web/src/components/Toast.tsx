import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Toast = { id: number; title: string; kind?: "info" | "success" | "error" };
type Ctx = { toast: (title: string, kind?: Toast["kind"]) => void };

const ToastCtx = createContext<Ctx | null>(null);
export const useToast = () => {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("ToastProvider missing");
  return c;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const toast = useCallback((title: string, kind: Toast["kind"] = "info") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, title, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  // Crear (o reutilizar) el contenedor del portal y guardarlo en un ref
  useEffect(() => {
    let el = document.getElementById("toaster") as HTMLElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = "toaster";
      document.body.appendChild(el);
    }
    containerRef.current = el;

    return () => {
      // opcional: si queda vacío puedes limpiarlo
      // if (el && el.parentNode && el.childElementCount === 0) el.parentNode.removeChild(el);
    };
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}

      {containerRef.current &&
        createPortal(
          <div className="fixed right-4 top-16 z-[200000] space-y-2">
            {items.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl px-4 py-2 text-sm shadow-soft text-white
                ${t.kind === "success" ? "bg-green-600" : t.kind === "error" ? "bg-red-600" : "bg-gray-900"}`}
              >
                {t.title}
              </div>
            ))}
          </div>,
          containerRef.current
        )}
    </ToastCtx.Provider>
  );
}
