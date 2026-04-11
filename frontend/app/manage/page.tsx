"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface Strategy {
  id: number;
  hotelId: number;
  name: string;
  estrategia: string;
  createdAt: string;
}

export default function ManageStrategies() {
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", estrategia: "" });
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");
    if (!storedHotelId) {
      router.push("/login");
      return;
    }
    setHotelId(parseInt(storedHotelId));
    setHotelName(storedHotelName || "Hotel");
    fetchStrategies(parseInt(storedHotelId));

    // Cargar sesiones de IA automatizadas
    const storedSessions = localStorage.getItem("saved_sessions");
    if (storedSessions) {
      setSavedSessions(JSON.parse(storedSessions));
    }
  }, [router]);

  const fetchStrategies = async (id: number) => {
    setLoading(true);
    try {
      // Placeholder: en el futuro conectar a una API de estrategias
      // const res = await fetch(`/api/strategies?hotelId=${id}`);
      // const data = await res.json();
      setStrategies([]);
    } catch (error) {
      console.error("Error cargando estrategias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStrategy = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta estrategia?")) {
      try {
        // Placeholder: conectar a API
        // await fetch(`/api/strategies/${id}`, { method: "DELETE" });
        setStrategies(strategies.filter(s => s.id !== id));
        setSelectedStrategy(null);
      } catch (error) {
        console.error("Error eliminando estrategia:", error);
      }
    }
  };

  const handleSaveStrategy = async () => {
    if (!formData.name.trim() || !formData.estrategia.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      // Placeholder: conectar a API
      // const res = await fetch("/api/strategies", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...formData, hotelId })
      // });
      // const newStrategy = await res.json();
      // setStrategies([...strategies, newStrategy]);
      setFormData({ name: "", estrategia: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error guardando estrategia:", error);
    }
  };

  const handleDeleteSession = (id: string) => {
    // 1. Eliminar del índice principal
    const newSessions = savedSessions.filter(s => s.id !== id);
    setSavedSessions(newSessions);
    localStorage.setItem('saved_sessions', JSON.stringify(newSessions));

    // 2. Limpiar rastros de memoria
    localStorage.removeItem(`strategy_${id}`);
    localStorage.removeItem(`chat_history_${id}`);
    localStorage.removeItem("velvet_last_results"); // Limpiar por si acaso

    // 3. Ocultar modal y dropdown
    setSessionToDelete(null);
    setActiveDropdown(null);
  };

  const handleCompleteSession = (id: string) => {
    const today = new Date().toLocaleDateString('es-ES'); // DD/MM/YYYY
    const newSessions = savedSessions.map(s =>
      s.id === id ? { ...s, fechaFin: today } : s
    );
    setSavedSessions(newSessions);
    localStorage.setItem('saved_sessions', JSON.stringify(newSessions));
    setActiveDropdown(null);
  };

  if (!hotelId) return null;

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-[#5e0710] flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header hotelName={hotelName} />

        {/* Zona de Sesiones de Chat Guardadas */}
        {savedSessions.length > 0 && (
          <div className="mb-12 animate-fade-in border-b border-[#ae8d6e]/30 pb-12">
            <h2 className="text-xl font-black text-[#ae8d6e] italic mb-6 uppercase tracking-widest">Estrategias de IA en Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedSessions.map((session, i) => (
                <div
                  key={i}
                  className="bg-white/50 hover:bg-white border border-[#ae8d6e]/30 p-5 rounded-2xl cursor-pointer transition-all hover:border-[#ae8d6e]/50 shadow-lg flex flex-col gap-3 group relative"
                  onClick={() => router.push(`/strategy/${session.id}`)}
                >
                  <div className="flex justify-between items-center relative">
                    <span className="text-[10px] font-black px-3 py-1 bg-[#f5f4f1] text-[#5e0710] rounded-lg">
                      {session.fechaFin ? ' COMPLETADA' : (session.tipo || 'Estrategia')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#f5f4f1]0 font-mono">{session.fecha}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === session.id ? null : session.id);
                        }}
                        className="bg-transparent hover:bg-[#683110] text-[#683110] hover:text-[#f5f4f1] px-3 py-1 rounded-lg text-[10px] font-bold transition-all border border-[#683110]"
                        title="Opciones"
                      >
                        ACCIONES ▾
                      </button>

                      {/* Dropdown de Acciones */}
                      {activeDropdown === session.id && (
                        <div
                          className="absolute right-0 top-10 bg-white border border-[#ae8d6e]/30 rounded-xl shadow-2xl z-20 py-2 w-40 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!session.fechaFin && (
                            <button
                              onClick={() => handleCompleteSession(session.id)}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-[#683110] hover:bg-[#683110]/10 transition-colors"
                            >
                              ✨ COMPLETAR
                            </button>
                          )}
                          <button
                            onClick={() => setSessionToDelete(session.id)}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-[#c50000] hover:bg-[#c50000]/10 transition-colors"
                          >
                            🗑️ ELIMINAR
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-md text-[#5e0710] truncate group-hover:text-[#683110] transition-colors uppercase italic">{session.nombre}</h3>
                  <span className="text-[#683110] text-xs font-bold tracking-widest mt-1 group-hover:translate-x-1 transition-transform">⮑ Abrir Chat</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para crear nueva estrategia manual */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-8 border-2 border-[#683110] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1] px-6 py-3 rounded-lg font-bold transition-all"
        >
          Nueva Estrategia
        </button>

        {/* Formulario para crear estrategia */}
        {showForm && (
          <div className="bg-white border border-[#ae8d6e]/30 p-8 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold text-[#683110] mb-6">Crear Nueva Estrategia</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la estrategia"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border border-[#683110] rounded-lg px-4 py-3 text-[#683110] placeholder-slate-400 focus:outline-none focus:border-[#ae8d6e]"
              />
              <textarea
                placeholder="Descripción y detalles de la estrategia"
                value={formData.estrategia}
                onChange={(e) => setFormData({ ...formData, estrategia: e.target.value })}
                className="w-full bg-transparent border border-[#683110] rounded-lg px-4 py-3 text-[#683110] placeholder-slate-400 focus:outline-none focus:border-[#ae8d6e] h-32"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSaveStrategy}
                  className="flex-1 border-2 border-[#683110] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1] px-4 py-3 rounded-lg font-bold transition-all"
                >
                  💾 Guardar
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", estrategia: "" });
                  }}
                  className="flex-1 border-2 border-[#683110] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1] px-4 py-3 rounded-lg font-bold transition-all"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de estrategias */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-[#ae8d6e] text-center py-8">Cargando estrategias...</p>
          ) : strategies.length === 0 && savedSessions.length === 0 ? (
            <div className="bg-white border border-[#ae8d6e]/30 p-12 rounded-2xl text-center mt-8">
              <p className="text-[#ae8d6e] mb-4">No tienes estrategias guardadas aún</p>
              <p className="text-[#f5f4f1]0 text-sm">Crea una nueva usando en el apartado de "Añadir estrategia"</p>
            </div>
          ) : (
            strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy)}
                className="w-full bg-white border border-[#ae8d6e]/30 p-6 rounded-xl hover:border-[#ae8d6e]/50 hover:bg-[#683110]/80 transition-all text-left"
              >
                <h3 className="text-lg font-bold text-[#683110] mb-2">{strategy.name}</h3>
                <p className="text-[#ae8d6e] text-sm line-clamp-2">{strategy.estrategia}</p>
                <p className="text-[#f5f4f1]0 text-xs mt-2">
                  Creada el {new Date(strategy.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Modal para ver/editar estrategia */}
        {selectedStrategy && (
          <div className="fixed inset-0 bg-[#f5f4f1]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white border border-[#ae8d6e]/30 w-full max-w-2xl rounded-2xl p-8 shadow-2xl">
              <button
                onClick={() => setSelectedStrategy(null)}
                className="absolute top-4 right-4 text-[#f5f4f1]0 hover:text-[#5e0710] text-2xl"
              >
                ✕
              </button>
              <h2 className="text-3xl font-bold text-[#683110] mb-6">{selectedStrategy.name}</h2>
              <div className="bg-[#683110] p-6 rounded-lg mb-6">
                <p className="text-[#f5f4f1] whitespace-pre-wrap">{selectedStrategy.estrategia}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteStrategy(selectedStrategy.id)}
                  className="flex-1 bg-[#c50000] hover:bg-[#c50000] px-4 py-3 rounded-lg font-bold transition-all"
                >
                  🗑️ Eliminar
                </button>
                <button
                  onClick={() => setSelectedStrategy(null)}
                  className="flex-1 bg-[#683110] hover:bg-[#683110] px-4 py-3 rounded-lg font-bold transition-all"
                >
                  ← Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación para borrar Sesión de IA */}
        {sessionToDelete && (
          <div className="fixed inset-0 bg-[#f5f4f1]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white border border-[#ae8d6e]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <h3 className="text-xl font-bold text-[#f5f4f1] mb-4">¿Eliminar chat de IA?</h3>
              <p className="text-[#ae8d6e] text-sm mb-6">Esta acción borrará todo el historial de conversación con el consultor inteligente y los datos base de esta estrategia de forma permanente.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteSession(sessionToDelete)}
                  className="flex-1 bg-[#c50000] hover:bg-[#c50000] px-4 py-3 rounded-lg font-bold transition-all text-[#5e0710]"
                >
                  <span className="block drop-shadow-md">Sí, Eliminar</span>
                </button>
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 bg-[#683110] hover:bg-[#683110] px-4 py-3 rounded-lg font-bold transition-all text-[#5e0710]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
