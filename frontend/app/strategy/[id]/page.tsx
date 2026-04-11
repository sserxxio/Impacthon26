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
  const [viewingIndex, setViewingIndex] = useState<number>(-1); 
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
        
        {/* Header */}
        <header className="w-full bg-white border-b border-[#ae8d6e]/30 px-6 py-4 flex justify-between items-center shrink-0 z-10 shadow-sm">
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}>
            <h1 className="text-2xl font-black text-[#683110] italic tracking-tighter leading-none">Velvet</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold uppercase tracking-widest text-[#ae8d6e] bg-[#f5f4f1] px-3 py-1 rounded-full border border-[#ae8d6e]/20 hidden md:block">
               {strategy.nombre}
             </span>
          </div>
        </header>

        {/* Split Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#f5f4f1]">

          {/* LEFT PANEL: Chat area */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            <main className="flex-1 overflow-y-auto relative z-0 scroll-smooth p-4 md:p-8">
              <div className="max-w-3xl w-full mx-auto space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] md:max-w-[85%] p-5 shadow-sm text-[15px] ${
                      msg.role === "user" 
                        ? "bg-[#5e0710] text-white rounded-3xl rounded-br-sm" 
                        : "bg-white text-[#5e0710] border border-[#ae8d6e]/40 rounded-3xl rounded-tl-sm leading-relaxed"
                    }`}>
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-3xl rounded-tl-sm bg-white p-5 border border-[#ae8d6e]/40 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#ae8d6e] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#ae8d6e] rounded-full animate-bounce [animation-delay:-.2s]"></div>
                      <div className="w-2 h-2 bg-[#ae8d6e] rounded-full animate-bounce [animation-delay:-.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </main>

            {/* Input Area */}
            <div className="w-full bg-white/80 backdrop-blur-xl border-t border-[#ae8d6e]/20 p-6 shrink-0">
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
                    className="w-full bg-[#f5f4f1] border border-[#ae8d6e]/40 rounded-2xl px-6 py-4 text-[#5e0710] placeholder-[#ae8d6e] focus:outline-none focus:border-[#683110] focus:ring-1 focus:ring-[#683110]/20 transition-all disabled:opacity-50 shadow-inner"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || loading}
                  className="bg-[#5e0710] hover:bg-[#683110] disabled:opacity-50 disabled:cursor-not-allowed w-14 h-14 rounded-2xl flex shrink-0 items-center justify-center font-black transition-all shadow-lg shadow-[#5e0710]/20 text-white text-xl hover:scale-105 active:scale-95"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>

          {/* RESIZER BAR */}
          <div 
            onMouseDown={startResizing}
            className={`w-1 cursor-col-resize hover:bg-[#ae8d6e]/50 transition-colors z-20 hidden lg:block relative group ${isResizing ? 'bg-[#683110] shadow-[0_0_15px_rgba(104,49,16,0.3)]' : 'bg-[#ae8d6e]/20'}`}
          >
            <div className="absolute inset-0 w-4 -left-1.5 h-full opacity-0 group-hover:opacity-100" />
          </div>

          {/* RIGHT PANEL: Strategy info area */}
          <div 
            className="w-full lg:block bg-white/40 overflow-y-auto p-6 md:p-8 custom-scrollbar border-l border-[#ae8d6e]/20"
            style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${rightPanelWidth}px` : '100%' }}
          >
            <div className="space-y-8 animate-fade-in h-full flex flex-col">
              
              <header className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <span className="text-[#ae8d6e] font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">
                    {viewMode === "history" ? "⏳ Historial de Cambios" : (strategy.tipo || "Análisis Estratégico")}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase leading-tight tracking-tighter text-[#5e0710] truncate">
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
                        ? "bg-[#5e0710] text-white border-[#5e0710] shadow-lg shadow-[#5e0710]/20" 
                        : "bg-[#f5f4f1] text-[#ae8d6e] border-[#ae8d6e]/40 hover:text-[#5e0710] hover:border-[#ae8d6e]"}
                    `}
                  >
                    {viewMode === "history" ? "✕ Cerrar" : "⏳ Historial"}
                  </button>
                )}
              </header>

              {/* MODO HISTORIAL */}
              {viewMode === "history" && (
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
                   <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => { setViewingIndex(-1); setViewMode("details"); }}
                        className="bg-[#5e0710]/5 border border-[#5e0710]/20 p-5 rounded-3xl text-left hover:bg-[#5e0710]/10 transition-all group relative overflow-hidden"
                      >
                        <span className="text-[#5e0710] text-[9px] font-black uppercase tracking-widest mb-1 block">Versión Actual</span>
                        <h4 className="text-[#5e0710] font-bold text-lg mb-1 italic">Propuesta Vigente</h4>
                        <p className="text-[#ae8d6e] text-[10px] uppercase font-bold">Ahora mismo</p>
                      </button>

                      {[...history].reverse().map((item, idx) => {
                        const originalIdx = history.length - 1 - idx;
                        const date = new Date(item.timestamp);
                        return (
                          <button 
                            key={originalIdx}
                            onClick={() => { setViewingIndex(originalIdx); setViewMode("details"); }}
                            className="bg-white/60 border border-[#ae8d6e]/20 p-5 rounded-3xl text-left hover:border-[#683110]/50 hover:bg-white transition-all group"
                          >
                            <span className="text-[#ae8d6e] text-[9px] font-black uppercase tracking-widest mb-1 block">Versión #{originalIdx + 1}</span>
                            <h4 className="text-[#5e0710] font-bold text-lg mb-1 italic">Snapshot Estratégico</h4>
                            <p className="text-[#ae8d6e] text-[10px] uppercase font-bold">
                              {date.toLocaleDateString()} - {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                </div>
              )}

              {/* MODO DETALLES */}
              {viewMode === "details" && (
                <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar pb-10">
                  {viewingIndex !== -1 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="text-orange-600 font-bold text-xs uppercase tracking-tighter">Archivo Histórico</p>
                          <p className="text-orange-800/60 text-[10px] italic">Snapshot de la Versión #{viewingIndex + 1}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setViewingIndex(-1)}
                        className="bg-orange-600 text-white text-[9px] font-black px-3 py-2 rounded-lg uppercase hover:scale-105 transition-all shadow-md"
                      >
                         Restaurar
                      </button>
                    </div>
                  )}

                  <section className="bg-white/60 rounded-3xl p-6 border border-[#ae8d6e]/20">
                    <h3 className="text-[#ae8d6e] text-[10px] font-bold uppercase mb-4 tracking-widest border-l-2 border-[#5e0710] pl-3">Hoja de Ruta</h3>
                    <div className="prose prose-slate prose-sm max-w-none text-[#5e0710]">
                      <MarkdownRenderer content={viewingIndex === -1 ? strategy.estrategia : history[viewingIndex].data.estrategia} />
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Presupuesto", value: viewingIndex === -1 ? strategy.coste : history[viewingIndex].data.coste, color: "text-orange-600" },
                      { label: "Plazo", value: viewingIndex === -1 ? strategy.tiempo : history[viewingIndex].data.tiempo, color: "text-emerald-700" },
                      { label: "ROI", value: viewingIndex === -1 ? strategy.roi : history[viewingIndex].data.roi, color: "text-blue-700" },
                      { label: "Target", value: viewingIndex === -1 ? strategy.targeting : history[viewingIndex].data.targeting, color: "text-red-900" },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/80 p-4 rounded-3xl border border-[#ae8d6e]/30 hover:border-[#ae8d6e] transition-all flex flex-col justify-center shadow-sm">
                        <h3 className={`${item.color} text-[9px] font-bold uppercase mb-1 tracking-widest`}>{item.label}</h3>
                        <p className={`
                          font-black text-[#5e0710] uppercase break-words leading-tight
                          ${rightPanelWidth < 420 ? 'text-xs' : rightPanelWidth < 520 ? 'text-base' : 'text-lg'}
                        `}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {viewingIndex === -1 && (
                    <div className="pt-4 opacity-50 text-[10px] font-medium text-[#ae8d6e] italic text-center">
                      Plan dinámico actualizado sincrónicamente con el chat.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}