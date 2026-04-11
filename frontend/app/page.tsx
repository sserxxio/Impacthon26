"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useSidebar } from "./context/SidebarContext";
import MarkdownRenderer from "./components/MarkdownRenderer";

interface OracleResult {
  nombre: string;
  descripcion: string;
  estrategia: string;
  coste: string;
  tiempo: string;
  targeting: string;
  roi: string;
  tipo: string;
  id?: string;
}

export default function Home() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [results, setResults] = useState<OracleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OracleResult | null>(null);
  const [promptText, setPromptText] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const currentProcessId = useRef(0);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [apiError, setApiError] = useState(false);
  const router = useRouter();
  const hasAutoRun = useRef(false);
  const { isOpen } = useSidebar();

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");
    const storedSessions = localStorage.getItem("saved_sessions");

    if (!storedHotelId) { router.push("/login"); return; }

    const parsedId = parseInt(storedHotelId);
    setHotelId(parsedId);
    setHotelName(storedHotelName || "Hotel");

    if (storedSessions) {
      setSavedSessions(JSON.parse(storedSessions));
    }

    // Intentar recuperar resultados previos de esta sesión
    const storedResults = localStorage.getItem("velvet_last_results");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
      hasAutoRun.current = true;
    } else if (!hasAutoRun.current) {
      hasAutoRun.current = true;
      ejecutarAnalisisCompleto(parsedId, storedHotelName || "Hotel");
    }
  }, [router]);

  const ejecutarAnalisisCompleto = async (overrideHotelId?: number, overrideHotelName?: string, refresh = false) => {
    const pid = Date.now();
    currentProcessId.current = pid;
    setLoading(true);
    setResults([]);

    const currentHotelId = overrideHotelId || hotelId;
    const currentHotelName = overrideHotelName || hotelName;

    const prompts = [
      {
        t: "Estrategia Maestra",
        p: "Foco: REVENUE INTEGRAL. Genera una táctica maestra que fusione maximización de ADR a corto plazo y mejora de reputación digital mediante optimizaciones operativas y de marketing directo. " + (results.length > 0 ? "IMPORTANTE: Genera una propuesta DIFERENTE a las anteriores para ofrecer variedad." : "")
      }
    ];

    try {
      // Fases de carga simuladas para mejor UX
      setLoadingPhase("LEYENDO");
      setProgress(15);
<<<<<<< Updated upstream

=======
      setApiError(false);
      
>>>>>>> Stashed changes
      for (const item of prompts) {
        if (currentProcessId.current !== pid) break;

        // Avanzar fase después del primer "reading"
        setTimeout(() => {
          if (currentProcessId.current === pid) {
            setLoadingPhase("ANALIZANDO");
            setProgress(45);
          }
        }, 1500);

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: item.p,
            hotelId: currentHotelId,
            tipo: item.t,
            datosHotel: { nombre: currentHotelName },
            refresh: refresh
          }),
        });

<<<<<<< Updated upstream
=======
        if (!res.ok) {
          if (currentProcessId.current === pid) setApiError(true);
          throw new Error("API Failure");
        }
        
>>>>>>> Stashed changes
        if (currentProcessId.current === pid) {
          setLoadingPhase("PREDICIENDO");
          setProgress(75);
        }

        const result = await res.json();

        if (currentProcessId.current === pid) {
          setLoadingPhase("CREANDO");
          setProgress(95);
        }

        if (currentProcessId.current !== pid) break;
        setResults(prev => {
          const newResults = [...prev, { ...result, tipo: item.t }];
          localStorage.setItem("velvet_last_results", JSON.stringify(newResults));
          return newResults;
        });

        // Retraso artificial de 4 segundos para evitar que Google Gemini bloquee
        await new Promise(r => setTimeout(r, 4000));
      }
    } catch (e) {
      console.error("Error cargando estrategias");
    } finally {
      if (currentProcessId.current === pid) {
        setLoading(false);
        setProgress(100);
      }
    }
  };

  const iniciarEstrategia = (res: OracleResult) => {
    // Generar un ID único simple basado en el timestamp
    const sessionId = Date.now().toString();
    res.id = sessionId;

    // Guardar los datos de esta estrategia concreta
    localStorage.setItem(`strategy_${sessionId}`, JSON.stringify(res));

    // Añadir al índice de "Sesiones Guardadas"
    const saved = JSON.parse(localStorage.getItem('saved_sessions') || '[]');
    const newSession = {
      id: sessionId,
      nombre: res.nombre,
      tipo: res.tipo,
      fecha: new Date().toLocaleDateString()
    };
    saved.push(newSession);
    localStorage.setItem('saved_sessions', JSON.stringify(saved));
    setSavedSessions(saved);

    // Limpiar caché de resultados para que al volver se genere una nueva
    localStorage.removeItem("velvet_last_results");
    setResults([]);

    router.push(`/strategy/${sessionId}`);
  };

  const ejecutarConsultaCustom = async (overridePrompt?: string, refresh = false) => {
    const p = overridePrompt || promptText;
    if (!p.trim()) return;

    setLastUsedPrompt(p);
    const pid = Date.now();
    currentProcessId.current = pid;
    setLoading(true);
    setResults([]);
    localStorage.removeItem("velvet_last_results");

    try {
      setLoadingPhase("LEYENDO");
      setProgress(20);
<<<<<<< Updated upstream

=======
      setApiError(false);
      
>>>>>>> Stashed changes
      const resPromise = fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p + (overridePrompt ? " (Genera una alternativa distinta y creativa)" : ""),
          hotelId: hotelId,
          tipo: "Estrategia Custom",
          datosHotel: { nombre: hotelName },
          refresh: refresh
        }),
      });

      // Animación de progreso mientras esperamos la respuesta real
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 40) { setLoadingPhase("ANALIZANDO"); return prev + 1; }
          if (prev < 70) { setLoadingPhase("PREDICIENDO"); return prev + 1; }
          if (prev < 90) { setLoadingPhase("CREANDO"); return prev + 1; }
          return prev;
        });
      }, 100);

      const res = await resPromise;
      clearInterval(progressInterval);

      if (!res.ok) {
        if (currentProcessId.current === pid) setApiError(true);
        throw new Error("API Failure");
      }

      const result = await res.json();

      if (currentProcessId.current === pid) {
        setResults([{ ...result, tipo: "Estrategia Custom" }]);
        localStorage.setItem("velvet_last_results", JSON.stringify([{ ...result, tipo: "Estrategia Custom" }]));
      }
    } catch (e) {
      console.error("Error en consulta custom");
    } finally {
      if (currentProcessId.current === pid) {
        setLoading(false);
        setProgress(100);
        if (!overridePrompt) setPromptText("");
      }
    }
  };

  const manejarRecarga = async () => {
    setIsExiting(true);
    // Esperar a que la animación de fade-out termine (0.5s)
    await new Promise(r => setTimeout(r, 500));
    setIsExiting(false);

    if (results[0]?.tipo === "Estrategia Custom") {
      ejecutarConsultaCustom(lastUsedPrompt || undefined, true);
    } else {
      ejecutarAnalisisCompleto(undefined, undefined, true);
    }
  };

  if (!hotelId) return null;

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-[#5e0710] flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Header hotelName={hotelName} />

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 py-20">
                <div className="w-full max-w-md text-center">
                  {/* Icono Dinámico */}
                  <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 bg-[#f5f4f1]0/20 blur-3xl rounded-full animate-pulse"></div>
                    <div className="relative bg-white border-2 border-[#ae8d6e] p-6 rounded-3xl shadow-lg animate-bounce">
                      <span className="text-4xl">
                        {loadingPhase === "LEYENDO" ? "📖" :
                          loadingPhase === "ANALIZANDO" ? "🧠" :
                            loadingPhase === "PREDICIENDO" ? "🔮" : "✍️"}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black mb-2 italic uppercase tracking-widest text-[#5e0710]">
                    {loadingPhase === "LEYENDO" ? "Lectura de Contexto" :
                      loadingPhase === "ANALIZANDO" ? "Análisis de Datos" :
                        loadingPhase === "PREDICIENDO" ? "Modelo Predictivo" : "Redactando Estrategia"}
                  </h2>

                  <p className="text-[#ae8d6e] text-sm mb-8 font-medium h-5">
                    {loadingPhase === "LEYENDO" ? "Extrayendo KPIs y equipamiento del hotel..." :
                      loadingPhase === "ANALIZANDO" ? "Identificando patrones en el histórico..." :
                        loadingPhase === "PREDICIENDO" ? "Generando proyecciones para el corto plazo..." : "Finalizando tu propuesta maestra..."}
                  </p>

                  {/* Barra de Progreso */}
                  <div className="relative h-3 bg-[#f5f4f1] rounded-full overflow-hidden border border-[#ae8d6e] p-[2px] mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-sky-600 via-sky-400 to-emerald-400 rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-[#f5f4f1]0">
                    <span>Fase: {loadingPhase}</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {apiError && !loading && (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in px-4">
                 <div className="bg-red-500/10 border border-red-500/30 p-8 md:p-12 rounded-[2.5rem] max-w-xl text-center backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                   <div className="relative z-10">
                     <div className="text-6xl mb-6">🛰️</div>
                     <h2 className="text-3xl font-black text-red-100 uppercase italic tracking-tighter mb-4 leading-none">Servidores Saturados</h2>
                     <p className="text-red-200/60 mb-8 font-medium italic text-sm md:text-base">
                       Nuestros agentes de IA están procesando una ráfaga alta de datos en este momento. Por favor, inténtalo de nuevo en unos segundos.
                     </p>
                     <button 
                       onClick={manejarRecarga}
                       className="bg-red-500 hover:bg-red-400 text-white font-black px-10 py-5 rounded-3xl transition-all shadow-xl shadow-red-500/20 uppercase tracking-widest text-sm hover:scale-105 active:scale-95"
                     >
                       🔄 Reintentar Ahora
                     </button>
                   </div>
                 </div>
              </div>
            )}

            {!apiError && !loading && results.length < 1 && (
              <div className="p-8 text-center text-slate-500 py-20 italic">
                Introduce una consulta para generar tu primera estrategia personalizada.
              </div>
            )}

            {/* Grid de Resultados */}
            {!loading && !apiError && results.length > 0 && (
              <div className={`flex flex-col items-center w-full gap-6 pb-10 ${isExiting ? "animate-fade-out-up" : ""}`}>
                {results.length > 0 && (
                  <div className="w-full flex justify-between items-center mb-6 animate-fade-in z-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#683110] italic opacity-90 drop-shadow-lg">
                      Aquí tienes tu estrategia integral
                    </h2>
                    <button
                      onClick={manejarRecarga}
                      className="flex items-center gap-2 px-6 py-3 bg-[#f5f4f1] hover:bg-[#ae8d6e] border border-[#ae8d6e] rounded-2xl text-xs font-bold text-[#5e0710] hover:text-[#5e0710] transition-all group"
                      title="Generar una versión alternativa"
                    >
                      <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
                      Recargar
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 w-full gap-6">
                  {results.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => setSelected(res)}
                      className="cursor-pointer bg-white border border-[#ae8d6e]/30 p-6 rounded-3xl hover:border-[#ae8d6e]/50 hover:bg-[#f5f4f1] transition-all text-left flex flex-col justify-between shadow-md group relative min-h-[16rem]"
                    >
                      <div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block uppercase ${res.tipo.includes("Estrategia") ? "bg-[#f5f4f1] text-[#683110]" : "bg-amber-100 text-amber-900"}`}>
                          {res.tipo}
                        </span>
                        <h2 className="font-bold text-xl text-[#5e0710] group-hover:text-[#683110] leading-tight uppercase italic mb-2">{res.nombre}</h2>
                        <p className="text-sm text-[#ae8d6e] line-clamp-2">{res.descripcion}</p>
                      </div>
<<<<<<< Updated upstream
                      <button
                        onClick={(e) => { e.stopPropagation(); iniciarEstrategia(res); }}
                        className="mt-6 w-full bg-[#5e0710] hover:bg-[#5e0710]/90 text-[#f5f4f1] font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-wide border border-[#683110] hover:border-[#ae8d6e]"
                      >
                        Comenzar Estrategia
                      </button>
=======
                      <div className="mt-6 flex items-center text-blue-400 text-xs font-bold uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver análisis completo ➔
                      </div>
>>>>>>> Stashed changes
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Popup / Modal */}
          {selected && (
            <div className="fixed inset-0 bg-[#683110]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white border border-[#ae8d6e]/30 w-full max-w-5xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={() => setSelected(null)} className="absolute top-8 right-8 text-[#f5f4f1] hover:text-[#5e0710] text-2xl transition-colors z-20">✕</button>

                <div className="overflow-y-auto pr-4 custom-scrollbar">
                  <span className="text-[#683110] font-mono text-xs font-bold uppercase tracking-[0.3em]">{selected.tipo}</span>
                  <h2 className="text-3xl md:text-5xl font-black mb-8 italic uppercase leading-none tracking-tighter text-[#5e0710]">{selected.nombre}</h2>

                  <div className="space-y-10">
                    <section>
                      <h3 className="text-[#ae8d6e]-500 text-[10px] font-bold uppercase mb-3 tracking-widest border-l-2 border-[#ae8d6e] pl-3">Hoja de Ruta</h3>
                      <MarkdownRenderer content={selected.estrategia} />
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#f5f4f1] p-6 rounded-3xl border border-[#ae8d6e]/30 hover:border-[#ae8d6e] transition-colors">
                        <h3 className="text-[#ae8d6e] text-[10px] font-bold uppercase mb-2 tracking-widest">Presupuesto Estimado</h3>
                        <p className="text-xl font-bold text-[#5e0710]">{selected.coste}</p>
                      </div>
                      <div className="bg-[#f5f4f1] p-6 rounded-3xl border border-[#ae8d6e]/30 hover:border-[#ae8d6e] transition-colors">
                        <h3 className="text-[#683110] text-[10px] font-bold uppercase mb-2 tracking-widest">Plazo de Implementación</h3>
                        <p className="text-xl font-bold text-[#5e0710]">{selected.tiempo}</p>
                      </div>
                      <div className="bg-[#f5f4f1] p-6 rounded-3xl border border-[#ae8d6e]/30 hover:border-[#ae8d6e] transition-colors">
                        <h3 className="text-[#683110] text-[10px] font-bold uppercase mb-2 tracking-widest">ROI Proyectado</h3>
                        <p className="text-xl font-bold text-[#ae8d6e]">{selected.roi}</p>
                      </div>
                      <div className="bg-[#f5f4f1] p-6 rounded-3xl border border-[#ae8d6e]/30 hover:border-[#ae8d6e] transition-colors">
                        <h3 className="text-purple-900 text-[10px] font-bold uppercase mb-2 tracking-widest">Target de Mercado</h3>
                        <p className="text-xl font-bold text-[#5e0710]">{selected.targeting}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => iniciarEstrategia(selected)}
                      className="w-full mt-4 bg-[#c50000] hover:bg-[#c50000]/90 text-[#f5f4f1] font-black py-5 rounded-3xl transition-all shadow-lg shadow-[#c50000]/700/20 uppercase tracking-[0.2em] text-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                      🚀 Iniciar esta Estrategia
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Input Area - Non-fixed, within flex container */}
        <div className="w-full bg-white/50 backdrop-blur-xl border-t border-[#ae8d6e]/30/60 p-6 shrink-0 z-10">
          <div className="max-w-4xl mx-auto flex gap-4 items-center">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Pide una estrategia personalizada para tu hotel... (ej. 'Evento corporativo en invierno')"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ejecutarConsultaCustom();
                }}
                className="w-full bg-white border border-[#ae8d6e] rounded-2xl px-6 py-4 text-[#5e0710] placeholder-gray-500 focus:outline-none focus:border-[#ae8d6e]/50 focus:ring-1 focus:ring-[#ae8d6e]/20 transition-all shadow-sm"
              />
              <div className="absolute inset-0 rounded-2xl bg-[#f5f4f1]0/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
            <button
              onClick={ejecutarConsultaCustom}
              disabled={!promptText.trim()}
              className="bg-[#c50000] hover:bg-[#c50000]/90 disabled:opacity-50 disabled:cursor-not-allowed w-14 h-14 rounded-2xl flex shrink-0 items-center justify-center font-black transition-all shadow-lg shadow-[#c50000]/700/20 text-[#f5f4f1] text-xl hover:scale-105 active:scale-95"
              title="Recibir consejo instantáneo"
            >
              ⚡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}