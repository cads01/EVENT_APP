import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    if (!message) return;
    const id = Date.now() + Math.random();
    setToasts(function(prev) { return [...prev, { id, message, type: type || "info" }] });
    setTimeout(function() {
      setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id }) });
    }, 4000);
  }, []);

  const removeToast = useCallback(function(id) {
    setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id }) });
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(function(t) {
          const colors = {
            success: "bg-emerald-500/90 border-emerald-400/40",
            error: "bg-red-500/90 border-red-400/40",
            info: "bg-zinc-800/90 border-zinc-600/40",
          };
          const icons = { success: "✓", error: "✕", info: "i" };
          return (
            <div key={t.id}
              className={"pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl text-white text-sm font-bold shadow-2xl animate-slideUp " + (colors[t.type] || colors.info)}
              style={{ minWidth: "280px", maxWidth: "420px" }}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black flex-shrink-0">{icons[t.type] || icons.info}</span>
              <span className="flex-1">{t.message}</span>
              <button onClick={function() { removeToast(t.id) }} className="text-white/50 hover:text-white transition-colors text-lg leading-none flex-shrink-0">×</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
