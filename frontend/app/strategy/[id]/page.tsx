"use client";
import { useEffect, useState, useRef } from "react";
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
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (existingHistory) {
      setMessages(JSON.parse(existingHistory));
    } else {
      setMessages([
        {
          role: "assistant",
          content: `**Iniciando Ejecución: ${parsed.nombre}**\n\nHe transferido los datos de la estrategia a tu sesión y estoy listo para guiarte en el plan integral basado en: *${parsed.estrategia}*.\n\n` +
            `• **Inversión base:** ${parsed.coste}\n` +
            `• **Plazo:** ${parsed.tiempo}\n` +
            `• **Target:** ${parsed.targeting}\n\n` +
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
    <div className="min-h-screen bg-slate-950 text-white flex h-screen font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-full min-w-0">
        <header className="w-full bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center shrink-0 z-10 shadow-md">
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}>
            <h1 className="text-2xl font-black text-blue-500 italic tracking-tighter leading-none">Velvet</h1>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <h2 className="text-lg font-bold text-white uppercase italic truncate max-w-[200px] md:max-w-sm hidden sm:block">
              {strategy.nombre}
            </h2>
            <button
              onClick={() => setShowDetails(true)}
              className="text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border border-emerald-400/20 shadow-md"
            >
              📑 Detalles
            </button>
          </div>

          <button onClick={() => router.push("/")} className="text-slate-500 hover:text-white transition-colors text-sm font-bold bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            Cerrar Sesión
          </button>
        </header>

        <main className="flex-1 overflow-y-auto relative z-0 scroll-smooth">
          <div className="max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
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

        {/* Input Area - Non-fixed, within flex container */}
        <div className="w-full bg-slate-950/50 backdrop-blur-xl border-t border-slate-800/60 p-6 shrink-0 z-10">
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

        {showDetails && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative max-h-[90vh] flex flex-col">
              <button onClick={() => setShowDetails(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white text-2xl transition-colors z-20">✕</button>
              
              <div className="overflow-y-auto pr-4 custom-scrollbar">
                <span className="text-blue-500 font-mono text-xs font-bold uppercase tracking-[0.3em]">{strategy.tipo || "Análisis Estratégico"}</span>
                <h2 className="text-3xl md:text-5xl font-black mb-8 italic uppercase leading-none tracking-tighter">{strategy.nombre}</h2>

                <div className="space-y-10">
                  <section>
                    <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-3 tracking-widest border-l-2 border-blue-500 pl-3">Hoja de Ruta</h3>
                    <MarkdownRenderer content={strategy.estrategia} />
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <h3 className="text-orange-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Presupuesto Estimado</h3>
                      <p className="text-3xl font-black text-white">{strategy.coste}</p>
                    </div>
                    <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <h3 className="text-emerald-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Plazo de Implementación</h3>
                      <p className="text-3xl font-black text-white">{strategy.tiempo}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-600/5 p-8 rounded-3xl border border-blue-500/20 gap-6">
                    <div>
                      <h3 className="text-blue-400 text-[10px] font-bold uppercase mb-1 tracking-widest">ROI Proyectado</h3>
                      <p className="text-5xl font-black text-blue-500">{strategy.roi}</p>
                    </div>
                    <div className="md:text-right">
                      <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Target de Mercado</h3>
                      <p className="text-lg text-slate-300 font-medium max-w-sm">{strategy.targeting}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}