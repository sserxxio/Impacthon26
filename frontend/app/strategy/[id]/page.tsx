"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function StrategyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col h-screen">
      <header className="w-full bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center shrink-0 z-10 shadow-md">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}>
          <h1 className="text-2xl font-black text-blue-500 italic tracking-tighter leading-none">ORACLE AI</h1>
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

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-8 max-w-4xl w-full mx-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] md:max-w-[85%] p-5 shadow-sm text-[15px] ${msg.role === "user" ? "bg-blue-600 text-white rounded-3xl rounded-br-sm" : "bg-slate-800 text-slate-200 border border-slate-700 rounded-3xl rounded-tl-sm leading-relaxed whitespace-pre-wrap"}`}>
              {msg.content}
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
      </main>

      <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 w-full z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex gap-3 items-center">
          <input
            type="text"
            placeholder="Pregunta o pide detalles de implementación..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-[2rem] px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed w-[3.5rem] h-[3.5rem] rounded-full flex shrink-0 items-center justify-center font-black transition-all shadow-lg text-white"
          >
            ↑
          </button>
        </div>
      </div>
      {/* Popup / Modal Detalles */}
      {showDetails && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowDetails(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white text-2xl transition-colors">✕</button>
            <span className="text-blue-500 font-mono text-xs font-bold uppercase tracking-[0.3em]">{strategy.tipo || "Análisis Estratégico"}</span>
            <h2 className="text-3xl md:text-4xl font-black mb-6 italic uppercase leading-tight">{strategy.nombre}</h2>

            <div className="space-y-8">
              <section>
                <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-2 tracking-widest">Hoja de Ruta</h3>
                <p className="text-slate-200 text-lg leading-relaxed">{strategy.estrategia}</p>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                  <h3 className="text-orange-400 text-[10px] font-bold uppercase mb-1">Presupuesto</h3>
                  <p className="text-xl font-bold">{strategy.coste}</p>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                  <h3 className="text-emerald-400 text-[10px] font-bold uppercase mb-1">Implementación</h3>
                  <p className="text-xl font-bold">{strategy.tiempo}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                <div>
                  <h3 className="text-blue-400 text-[10px] font-bold uppercase">ROI Proyectado</h3>
                  <p className="text-3xl font-black text-blue-400">{strategy.roi}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-slate-500 text-[10px] font-bold uppercase">Target</h3>
                  <p className="text-sm text-slate-300 max-w-[200px] truncate">{strategy.targeting}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}