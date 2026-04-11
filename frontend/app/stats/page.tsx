"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface Amenities {
  id: number;
  hotelId: number;
  piscina: boolean;
  pistasTenis: boolean;
  padel: boolean;
  gimnasio: boolean;
  restaurante: boolean;
  bar: boolean;
  spa: boolean;
  sauna: boolean;
  buffet: boolean;
  wifiGratis: boolean;
  estacionamientoGratis: boolean;
  habitacionesVIP: boolean;
  permiteMascotas: boolean;
  salaJuegos: boolean;
  guarderia: boolean;
  accesibilidad: boolean;
  idiomas: boolean;
  actividades: boolean;
  sitioFumar: boolean;
  earlyCheckin: boolean;
  lateCheckin: boolean;
  notasAdicionales?: string;
}

interface AnalysisResult {
  estrategia: string;
  anuncio: string;
  targeting?: string;
  roi?: string;
  analisisId?: number;
}

const STATS: Stat[] = [
  { key: "piscina", label: "Piscina", emoji: "🏊" },
  { key: "pistasTenis", label: "Pistas de Tenis", emoji: "🎾" },
  { key: "padel", label: "Pádel", emoji: "🏐" },
  { key: "gimnasio", label: "Gimnasio", emoji: "💪" },
  { key: "restaurante", label: "Restaurante", emoji: "🍽️" },
  { key: "bar", label: "Bar", emoji: "🍸" },
  { key: "buffet", label: "Buffet", emoji: "🥘" },
  { key: "spa", label: "Spa", emoji: "💆" },
  { key: "sauna", label: "Sauna", emoji: "🔥" },
  { key: "wifiGratis", label: "WiFi Gratis", emoji: "📶" },
  { key: "estacionamientoGratis", label: "Estacionamiento Gratis", emoji: "🅿️" },
  { key: "habitacionesVIP", label: "Habitaciones VIP", emoji: "👑" },
  { key: "permiteMascotas", label: "Pet-Friendly", emoji: "🐾" },
  { key: "salaJuegos", label: "Sala de Juegos", emoji: "🎮" },
  { key: "guarderia", label: "Guardería", emoji: "👶" },
  { key: "accesibilidad", label: "Accesibilidad", emoji: "♿" },
  { key: "idiomas", label: "Múltiples Idiomas", emoji: "🌍" },
  { key: "actividades", label: "Actividades & Eventos", emoji: "🎪" },
  { key: "sitioFumar", label: "Zona para Fumar", emoji: "🚬" },
  { key: "earlyCheckin", label: "Early Check-in", emoji: "🌅" },
  { key: "lateCheckin", label: "Late Check-in", emoji: "🌙" },
];

export default function StatsPage() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [amenities, setAmenities] = useState<Amenities | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analisis" | "gestionar" | "crear">("analisis");
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

    // Cargar amenities
    const loadAmenities = async () => {
      try {
        const res = await fetch(`/api/hotel/amenities?hotelId=${storedHotelId}`);
        if (res.ok) {
          const data = await res.json();
          setAmenities(data);
          // Generar análisis automáticamente
          await generateAnalysis(parseInt(storedHotelId), data);
        } else {
          setError("No hay servicios registrados aún");
          setLoading(false);
        }
      } catch (err) {
        setError("Error al cargar los servicios");
        setLoading(false);
      }
    };

    loadAmenities();
  }, [router]);

  const generateAnalysis = async (hotelId: number, amenitiesData: Amenities) => {
    setGeneratingAnalysis(true);
    try {
      const enabledServices = STATS.filter((stat) => amenitiesData[stat.key])
        .map((s) => s.label)
        .join(", ");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          datosHotel: {
            nombre: hotelName,
            servicios: enabledServices,
          },
          reseñasCompetencia: [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error("Error generando análisis:", err);
    } finally {
      setGeneratingAnalysis(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!hotelId) {
    return null;
  }

  const enabledServices = amenities
    ? STATS.filter((stat) => amenities[stat.key]).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-8">
        <Header hotelName={hotelName} />

        {error && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}

        {amenities ? (
          <>
            {activeTab === "analisis" && (
              <>
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-emerald-500/20 border border-emerald-500 p-6 rounded-2xl">
                    <h3 className="text-emerald-400 font-bold text-sm mb-1">SERVICIOS ACTIVOS</h3>
                    <p className="text-4xl font-bold text-emerald-300">{enabledServices}</p>
                    <p className="text-sm text-slate-400 mt-2">de {STATS.length} totales</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500 p-6 rounded-2xl">
                    <h3 className="text-blue-400 font-bold text-sm mb-1">COBERTURA</h3>
                    <p className="text-4xl font-bold text-blue-300">
                      {Math.round((enabledServices / STATS.length) * 100)}%
                    </p>
                    <p className="text-sm text-slate-400 mt-2">del catálogo completo</p>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500 p-6 rounded-2xl">
                    <h3 className="text-purple-400 font-bold text-sm mb-1">ESTADO</h3>
                    <p className="text-2xl font-bold text-purple-300 mt-2">✅ {generatingAnalysis ? "Analizando..." : "Analizado"}</p>
                  </div>
                </div>

                {/* ANÁLISIS IA */}
                {analysis ? (
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-blue-400 mb-6">🤖 Análisis IA Generado</h2>
                    <div className="grid gap-6">
                      <div className="bg-slate-800 p-6 rounded-2xl border border-blue-500/50">
                        <h3 className="text-blue-400 font-bold mb-3">🎯 ESTRATEGIA RECOMENDADA</h3>
                        <p className="text-lg text-slate-200 leading-relaxed">{analysis.estrategia}</p>
                      </div>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-pink-500/50">
                        <h3 className="text-pink-400 font-bold mb-3">📸 COPY PARA REDES SOCIALES</h3>
                        <p className="text-lg italic text-slate-200">"{analysis.anuncio}"</p>
                      </div>
                      {analysis.targeting && (
                        <div className="bg-slate-800 p-6 rounded-2xl border border-green-500/50">
                          <h3 className="text-green-400 font-bold mb-3">🎯 TARGETING</h3>
                          <p className="text-slate-200">{analysis.targeting}</p>
                        </div>
                      )}
                      {analysis.roi && (
                        <div className="bg-slate-800 p-6 rounded-2xl border border-yellow-500/50">
                          <h3 className="text-yellow-400 font-bold mb-3">📈 ROI PROYECTADO</h3>
                          <p className="text-slate-200">{analysis.roi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : generatingAnalysis ? (
                  <div className="mb-8 bg-slate-800 p-8 rounded-2xl border border-blue-500/50 text-center">
                    <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-blue-400 font-bold">Generando análisis con IA...</p>
                  </div>
                ) : null}

                {/* Servicios Habilitados */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-green-400 mb-4">✅ Servicios Habilitados</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {STATS.filter((stat) => amenities[stat.key]).map((stat) => (
                      <div
                        key={stat.key}
                        className="bg-emerald-500/10 border border-emerald-500/50 p-3 rounded-xl text-center"
                      >
                        <div className="text-3xl mb-2">{stat.emoji}</div>
                        <p className="text-sm font-medium text-emerald-300">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Servicios Deshabilitados */}
                {STATS.filter((stat) => !amenities[stat.key]).length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-400 mb-4">❌ Servicios No Habilitados</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {STATS.filter((stat) => !amenities[stat.key]).map((stat) => (
                        <div
                          key={stat.key}
                          className="bg-slate-700/50 border border-slate-600 p-3 rounded-xl text-center opacity-60"
                        >
                          <div className="text-3xl mb-2 opacity-40">{stat.emoji}</div>
                          <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {amenities.notasAdicionales && (
                  <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                    <h3 className="text-blue-400 font-bold mb-3">📝 Notas Adicionales</h3>
                    <p className="text-slate-300">{amenities.notasAdicionales}</p>
                  </div>
                )}

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => router.push("/amenities")}
                    className="bg-yellow-600 hover:bg-yellow-500 px-6 py-3 rounded-full font-bold transition-all"
                  >
                    ✏️ Editar Servicios
                  </button>
                </div>
              </>
            )}

            {activeTab === "gestionar" && (
              <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl">
                <h2 className="text-3xl font-bold text-blue-400 mb-6">⚙️ Gestionar Estrategia</h2>
                <div className="space-y-4">
                  <p className="text-slate-300 mb-4">Aquí puedes editar, pausar o eliminar estrategias creadas.</p>
                  <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                    <p className="text-slate-400">Estrategias guardadas: <span className="text-blue-400 font-bold">0</span></p>
                  </div>
                  <p className="text-slate-400 text-sm">No hay estrategias guardadas aún. Crea una nueva para comenzar.</p>
                </div>
              </div>
            )}

            {activeTab === "crear" && (
              <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl">
                <h2 className="text-3xl font-bold text-emerald-400 mb-6">➕ Crear Nueva Estrategia</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Nombre de la Estrategia
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Campaña Verano 2026"
                      className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe tu estrategia de marketing..."
                      className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Público Objetivo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Viajeros de negocios"
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Presupuesto (€)
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 5000"
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-full font-bold transition-all">
                      ✅ Guardar Estrategia
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full font-bold transition-all">
                      🤖 Generar con IA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No hay servicios registrados</p>
            <button
              onClick={() => router.push("/amenities")}
              className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-full font-bold"
            >
              📋 Ir al Cuestionario
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
