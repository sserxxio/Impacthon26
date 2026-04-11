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
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header hotelName={hotelName} />

        {/* Zona de Sesiones de Chat Guardadas */}
        {savedSessions.length > 0 && (
          <div className="mb-12 animate-fade-in border-b border-slate-700 pb-12">
            <h2 className="text-xl font-black text-slate-400 italic mb-6 uppercase tracking-widest">Estrategias de IA en Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedSessions.map((session, i) => (
                <div 
                  key={i}
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-5 rounded-2xl cursor-pointer transition-all hover:border-blue-500/50 shadow-lg flex flex-col gap-3 group relative"
                  onClick={() => router.push(`/strategy/${session.id}`)}
                >
                  <div className="flex justify-between items-center relative">
                    <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-slate-300 rounded-lg">
                      {session.fechaFin ? '✅ COMPLETADA' : (session.tipo || 'Estrategia')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono">{session.fecha}</span>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveDropdown(activeDropdown === session.id ? null : session.id); 
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg text-[10px] font-bold transition-all border border-slate-600"
                        title="Opciones"
                      >
                        ACCIONES ▾
                      </button>

                      {/* Dropdown de Acciones */}
                      {activeDropdown === session.id && (
                        <div 
                          className="absolute right-0 top-10 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 py-2 w-40 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!session.fechaFin && (
                            <button 
                              onClick={() => handleCompleteSession(session.id)}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              ✨ COMPLETAR
                            </button>
                          )}
                          <button 
                            onClick={() => setSessionToDelete(session.id)}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            🗑️ ELIMINAR
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-md text-white truncate group-hover:text-blue-400 transition-colors uppercase italic">{session.nombre}</h3>
                  <span className="text-blue-500 text-xs font-bold tracking-widest mt-1 group-hover:translate-x-1 transition-transform">⮑ Abrir Chat</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para crear nueva estrategia manual */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-8 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold transition-all"
        >
          ➕ Nueva Estrategia
        </button>

        {/* Formulario para crear estrategia */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6">Crear Nueva Estrategia</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la estrategia"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Descripción y detalles de la estrategia"
                value={formData.estrategia}
                onChange={(e) => setFormData({ ...formData, estrategia: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 h-32"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSaveStrategy}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-lg font-bold transition-all"
                >
                  💾 Guardar
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", estrategia: "" });
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-bold transition-all"
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
            <p className="text-slate-400 text-center py-8">Cargando estrategias...</p>
          ) : strategies.length === 0 && savedSessions.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 p-12 rounded-2xl text-center mt-8">
              <p className="text-slate-400 mb-4">No tienes estrategias guardadas aún</p>
              <p className="text-slate-500 text-sm">Crea una nueva usando en el apartado de "Añadir estrategia"</p>
            </div>
          ) : (
            strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy)}
                className="w-full bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-blue-500/50 hover:bg-slate-700/80 transition-all text-left"
              >
                <h3 className="text-lg font-bold text-blue-400 mb-2">{strategy.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{strategy.estrategia}</p>
                <p className="text-slate-500 text-xs mt-2">
                  Creada el {new Date(strategy.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Modal para ver/editar estrategia */}
        {selectedStrategy && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl p-8 shadow-2xl">
              <button
                onClick={() => setSelectedStrategy(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white text-2xl"
              >
                ✕
              </button>
              <h2 className="text-3xl font-bold text-blue-400 mb-6">{selectedStrategy.name}</h2>
              <div className="bg-slate-700 p-6 rounded-lg mb-6">
                <p className="text-slate-200 whitespace-pre-wrap">{selectedStrategy.estrategia}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteStrategy(selectedStrategy.id)}
                  className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-3 rounded-lg font-bold transition-all"
                >
                  🗑️ Eliminar
                </button>
                <button
                  onClick={() => setSelectedStrategy(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-bold transition-all"
                >
                  ← Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación para borrar Sesión de IA */}
        {sessionToDelete && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <h3 className="text-xl font-bold text-slate-200 mb-4">¿Eliminar chat de IA?</h3>
              <p className="text-slate-400 text-sm mb-6">Esta acción borrará todo el historial de conversación con el consultor inteligente y los datos base de esta estrategia de forma permanente.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteSession(sessionToDelete)}
                  className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-3 rounded-lg font-bold transition-all text-white"
                >
                  <span className="block drop-shadow-md">Sí, Eliminar</span>
                </button>
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-bold transition-all text-white"
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
