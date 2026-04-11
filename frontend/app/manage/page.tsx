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

  if (!hotelId) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header hotelName={hotelName} />

        {/* Botón para crear nueva estrategia */}
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
          ) : strategies.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 p-12 rounded-2xl text-center">
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
      </main>
    </div>
  );
}
