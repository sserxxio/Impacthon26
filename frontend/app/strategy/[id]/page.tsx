"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { useSidebar } from "../../context/SidebarContext";
import MarkdownRenderer from "../../components/MarkdownRenderer";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function StrategyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { isOpen } = useSidebar();

  const [strategy, setStrategy] = useState<any>(null);
  const [hotelName, setHotelName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"details" | "history">("details");
  const [viewingIndex, setViewingIndex] = useState<number>(-1); // -1 means current active strategy
  const [rightPanelWidth, setRightPanelWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 320 && newWidth < 800) {
        setRightPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!id) return;
    const data = localStorage.getItem(`strategy_${id}`);
    const storedName = localStorage.getItem("hotelName") || "Hotel";
    if (!data) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(data);
    setStrategy(parsed);
    setHotelName(storedName);

    // Initial message automatically injected base depending on prior history
    const existingHistory = localStorage.getItem(`chat_history_${id}`);
    const storedStrategyHistory = localStorage.getItem(`strategy_history_${id}`);
    
    if (storedStrategyHistory) {
      setHistory(JSON.parse(storedStrategyHistory));
    }

    if (existingHistory) {
      setMessages(JSON.parse(existingHistory));
    } else {
      setMessages([
        {
          role: "assistant",
          content: `**Iniciando Ejecución: ${parsed.nombre}**\n\nHe transferido los datos de la estrategia a tu sesión y estoy listo para guiarte en el plan integral basado en: *${parsed.estrategia}*.\n\n` +
            `Como tu IA Consultora, tengo todo el contexto memorizado. ¿Qué necesitas preparar primero? Puedes pedirme redactar correos, estructuras de redes sociales o esquemas operativos paso a paso.`
        }
      ]);
    }
  }, [router, id]);

  useEffect(() => {
    if (id && messages.length > 0) {
      localStorage.setItem(`chat_history_${id}`, JSON.stringify(messages));
    }
  }, [messages, id]);

  useEffect(() => {
    if (id && history.length > 0) {
      localStorage.setItem(`strategy_history_${id}`, JSON.stringify(history));
    }
  }, [history, id]);

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMsg = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          message: userMsg,
          context: {
            hotelName: hotelName,
            strategyName: strategy?.nombre,
            strategyDetail: strategy?.estrategia,
            strategyCoste: strategy?.coste,
            strategyTiempo: strategy?.tiempo,
            strategyTargeting: strategy?.targeting,
            strategyRoi: strategy?.roi
          }
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.modifiedStrategy) {
        // Antes de aplicar el cambio, guardamos el estado actual en el historial
        setHistory(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          return [...safePrev, { data: { ...strategy }, timestamp: Date.now() }];
        });
        
        const newStrategy = { ...strategy, ...data.modifiedStrategy };
        setStrategy(newStrategy);
        localStorage.setItem(`strategy_${id}`, JSON.stringify(newStrategy));
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!strategy) return null;

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-[#5e0710] flex h-screen font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-full min-w-0">
<<<<<<< Updated upstream
        <header className="w-full bg-[#f5f4f1] border-b border-[#683110] p-6 flex justify-between items-center shrink-0 z-10 shadow-md">
=======
        <header className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shrink-0 z-10 shadow-md">
>>>>>>> Stashed changes
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}>
            <h1 className="text-2xl font-black text-[#683110] italic tracking-tighter leading-none">Velvet</h1>
          </div>
<<<<<<< Updated upstream

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#5e0710] uppercase italic truncate max-w-[200px] md:max-w-sm hidden sm:block">
              {strategy.nombre}
            </h2>
            <button
              onClick={() => setShowDetails(true)}
              className="text-emerald-400 bg-[#683110]/10 hover:bg-[#683110]/20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border border-[#ae8d6e]/20 shadow-md"
            >
              📑 Detalles
            </button>
          </div>

          <button onClick={() => router.push("/")} className="text-[#5e0710] hover:text-[#5e0710] transition-colors text-sm font-bold bg-white px-4 py-2 rounded-lg border border-[#ae8d6e]">
            Cerrar Sesión
          </button>
        </header>

        <main className="flex-1 overflow-y-auto relative z-0 scroll-smooth">
          <div className="max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] md:max-w-[85%] p-5 shadow-sm text-[15px] ${msg.role === "user" ? "bg-[#683110] text-[#5e0710] rounded-3xl rounded-br-sm" : "bg-white text-[#5e0710] border border-[#ae8d6e] rounded-3xl rounded-tl-sm leading-relaxed"}`}>
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-3xl rounded-tl-sm bg-white p-5 border border-[#ae8d6e] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#f5f4f1]0 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#f5f4f1]0 rounded-full animate-bounce [animation-delay:-.2s]"></div>
                  <div className="w-2 h-2 bg-[#f5f4f1]0 rounded-full animate-bounce [animation-delay:-.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area - Non-fixed, within flex container */}
        <div className="w-full bg-[#f5f4f1]/50 backdrop-blur-xl border-t border-[#683110]/60 p-6 shrink-0 z-10">
          <div className="max-w-4xl mx-auto flex gap-4 items-center">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Pregunta o pide detalles de implementación..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                disabled={loading}
                className="w-full bg-[#f5f4f1]/80 border border-[#ae8d6e]/50 rounded-2xl px-6 py-4 text-[#5e0710] placeholder-slate-500 focus:outline-none focus:border-[#ae8d6e]/50 focus:ring-1 focus:ring-[#ae8d6e]/20 transition-all disabled:opacity-50 shadow-inner"
              />
              <div className="absolute inset-0 rounded-2xl bg-[#f5f4f1]0/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || loading}
              className="bg-[#683110] hover:bg-[#f5f4f1]0 disabled:opacity-50 disabled:cursor-not-allowed w-14 h-14 rounded-2xl flex shrink-0 items-center justify-center font-black transition-all shadow-lg shadow-blue-500/20 text-[#5e0710] text-xl hover:scale-105 active:scale-95"
            >
              ↑
            </button>
=======
        </header>

        {/* Split Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">

          {/* LEFT PANEL: Chat area */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            <main className="flex-1 overflow-y-auto relative z-0 scroll-smooth p-4 md:p-8">
              <div className="max-w-3xl w-full mx-auto space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] md:max-w-[85%] p-5 shadow-sm text-[15px] ${msg.role === "user" ? "bg-blue-600 text-white rounded-3xl rounded-br-sm" : "bg-slate-800 text-slate-200 border border-slate-700 rounded-3xl rounded-tl-sm leading-relaxed"}`}>
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-3xl rounded-tl-sm bg-slate-800 p-5 border border-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.2s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </main>

            {/* Input Area */}
            <div className="w-full bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/60 p-6 shrink-0">
              <div className="max-w-3xl mx-auto flex gap-4 items-center">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    placeholder="Pide detalles de implementación..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    disabled={loading}
                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 shadow-inner"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-14 h-14 rounded-2xl flex shrink-0 items-center justify-center font-black transition-all shadow-lg shadow-blue-500/20 text-white text-xl hover:scale-105 active:scale-95"
                >
                  ↑
                </button>
              </div>
            </div>
>>>>>>> Stashed changes
          </div>

<<<<<<< Updated upstream
        {showDetails && (
          <div className="fixed inset-0 bg-[#f5f4f1]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#f5f4f1] border border-[#ae8d6e] w-full max-w-5xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative max-h-[90vh] flex flex-col">
              <button onClick={() => setShowDetails(false)} className="absolute top-8 right-8 text-[#5e0710] hover:text-[#5e0710] text-2xl transition-colors z-20">✕</button>
              
              <div className="overflow-y-auto pr-4 custom-scrollbar">
                <span className="text-[#683110] font-mono text-xs font-bold uppercase tracking-[0.3em]">{strategy.tipo || "Análisis Estratégico"}</span>
                <h2 className="text-3xl md:text-5xl font-black mb-8 italic uppercase leading-none tracking-tighter">{strategy.nombre}</h2>

                <div className="space-y-10">
                  <section>
                    <h3 className="text-[#5e0710] text-[10px] font-bold uppercase mb-3 tracking-widest border-l-2 border-[#ae8d6e] pl-3">Hoja de Ruta</h3>
                    <MarkdownRenderer content={strategy.estrategia} />
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/40 p-6 rounded-3xl border border-[#ae8d6e]/50 hover:border-[#683110] transition-colors">
                      <h3 className="text-orange-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Presupuesto Estimado</h3>
                      <p className="text-3xl font-black text-[#5e0710]">{strategy.coste}</p>
                    </div>
                    <div className="bg-white/40 p-6 rounded-3xl border border-[#ae8d6e]/50 hover:border-[#683110] transition-colors">
                      <h3 className="text-emerald-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Plazo de Implementación</h3>
                      <p className="text-3xl font-black text-[#5e0710]">{strategy.tiempo}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#683110]/5 p-8 rounded-3xl border border-[#ae8d6e]/20 gap-6">
                    <div>
                      <h3 className="text-[#683110] text-[10px] font-bold uppercase mb-1 tracking-widest">ROI Proyectado</h3>
                      <p className="text-5xl font-black text-[#683110]">{strategy.roi}</p>
                    </div>
                    <div className="md:text-right">
                      <h3 className="text-[#5e0710] text-[10px] font-bold uppercase mb-1 tracking-widest">Target de Mercado</h3>
                      <p className="text-lg text-[#5e0710] font-medium max-w-sm">{strategy.targeting}</p>
                    </div>
                  </div>
=======
          {/* RESIZER BAR */}
          <div 
            onMouseDown={startResizing}
            className={`w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20 hidden lg:block relative group ${isResizing ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800/50'}`}
          >
            <div className="absolute inset-0 w-4 -left-1.5 h-full opacity-0 group-hover:opacity-100" />
          </div>

          {/* RIGHT PANEL: Strategy info area */}
          <div 
            className="w-full lg:block bg-slate-900/30 overflow-y-auto p-6 md:p-8 custom-scrollbar border-l border-slate-800/50"
            style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${rightPanelWidth}px` : '100%' }}
          >
            <div className="space-y-8 animate-fade-in h-full flex flex-col">
              
              <header className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <span className="text-blue-500 font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">
                    {viewMode === "history" ? "⏳ Historial de Cambios" : (strategy.tipo || "Análisis Estratégico")}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase leading-tight tracking-tighter text-white truncate">
                    {viewMode === "history" ? "Línea de Tiempo" : strategy.nombre}
                  </h2>
                </div>
                
                {history.length > 0 && (
                  <button 
                    onClick={() => {
                      setViewMode(viewMode === "details" ? "history" : "details");
                      if (viewMode === "history") setViewingIndex(-1);
                    }}
                    className={`
                      ml-4 shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border
                      ${viewMode === "history" 
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600"}
                    `}
                  >
                    {viewMode === "history" ? "✕ Cerrar" : "⏳ Historial"}
                  </button>
                )}
              </header>

              {/* MODO HISTORIAL: Lista de versiones */}
              {viewMode === "history" && (
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
                  {history.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 italic text-sm">
                      No hay cambios registrados aún. <br/> Interactúa con la IA para ver la evolución.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {/* Versión Actual (Link rápido) */}
                      <button 
                        onClick={() => { setViewingIndex(-1); setViewMode("details"); }}
                        className="bg-blue-600/10 border border-blue-500/30 p-5 rounded-3xl text-left hover:bg-blue-600/20 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">🚀</div>
                        <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1 block">Versión Actual</span>
                        <h4 className="text-white font-bold text-lg mb-1 italic">Propuesta Vigente</h4>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Ahora mismo</p>
                      </button>

                      {/* Historial Real */}
                      {[...history].reverse().map((item, idx) => {
                        const originalIdx = history.length - 1 - idx;
                        const date = new Date(item.timestamp);
                        return (
                          <button 
                            key={originalIdx}
                            onClick={() => { setViewingIndex(originalIdx); setViewMode("details"); }}
                            className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl text-left hover:border-blue-500/50 hover:bg-slate-800/60 transition-all group"
                          >
                            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1 block">Versión #{originalIdx + 1}</span>
                            <h4 className="text-white font-bold text-lg mb-1 italic">Snapshot Estratégico</h4>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">
                              {date.toLocaleDateString()} - {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MODO DETALLES: Ver una versión específica */}
              {viewMode === "details" && (
                <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar pb-10">
                  {viewingIndex !== -1 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="text-orange-400 font-bold text-xs uppercase tracking-tighter">Viendo Archivo Histórico</p>
                          <p className="text-orange-300/60 text-[10px] italic">Propuesta de la Versión #{viewingIndex + 1}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setViewingIndex(-1)}
                        className="bg-orange-500 text-white text-[9px] font-black px-3 py-2 rounded-lg uppercase hover:scale-105 transition-all"
                      >
                         Restaurar Actual
                      </button>
                    </div>
                  )}

                  <section className="bg-slate-800/20 rounded-3xl p-6 border border-slate-800/50">
                    <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-4 tracking-widest border-l-2 border-blue-500 pl-3">Hoja de Ruta</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <MarkdownRenderer content={viewingIndex === -1 ? strategy.estrategia : history[viewingIndex].data.estrategia} />
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Presupuesto", value: viewingIndex === -1 ? strategy.coste : history[viewingIndex].data.coste, color: "text-orange-400" },
                      { label: "Plazo", value: viewingIndex === -1 ? strategy.tiempo : history[viewingIndex].data.tiempo, color: "text-emerald-400" },
                      { label: "ROI", value: viewingIndex === -1 ? strategy.roi : history[viewingIndex].data.roi, color: "text-blue-400" },
                      { label: "Target", value: viewingIndex === -1 ? strategy.targeting : history[viewingIndex].data.targeting, color: "text-fuchsia-400" },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-all flex flex-col justify-center">
                        <h3 className={`${item.color} text-[9px] font-bold uppercase mb-1 tracking-widest`}>{item.label}</h3>
                        <p className={`
                          font-black text-white uppercase break-words leading-tight
                          ${rightPanelWidth < 420 ? 'text-xs' : rightPanelWidth < 520 ? 'text-base' : 'text-lg'}
                        `}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {viewingIndex === -1 && (
                    <div className="pt-4 opacity-50 text-[10px] font-medium text-slate-500 italic text-center">
                      Este plan se actualiza en tiempo real basado en tu conversación.
                    </div>
                  )}
>>>>>>> Stashed changes
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}