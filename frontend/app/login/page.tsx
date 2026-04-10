"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Hotel {
  id: number;
  hotelName: string;
  country: string;
  stars: number;
}

interface HotelStatus {
  hotel: Hotel;
  hasAmenities: boolean;
  status: "configured" | "pending";
}

export default function LoginPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [status, setStatus] = useState<HotelStatus | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // Buscar hoteles
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setError("");

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/hotel/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      setError("Error al buscar hoteles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar hotel y verificar status
  const handleSelectHotel = async (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setSearchResults([]);
    setSearchQuery("");
    setError("");
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/hotel/${hotel.id}/status`);
      
      if (!res.ok) {
        setError("Hotel no encontrado en la base de datos");
        setSelectedHotel(null);
        setLoading(false);
        return;
      }
      
      const statusData: HotelStatus = await res.json();
      setStatus(statusData);

      // Guardar en localStorage
      localStorage.setItem("hotelId", hotel.id.toString());
      localStorage.setItem("hotelName", hotel.hotelName);

      // Si no tiene amenities, redirigir al cuestionario
      if (!statusData.hasAmenities) {
        setTimeout(() => {
          router.push("/amenities");
        }, 10000);
      }
    } catch (err) {
      setError("Error al verificar estado del hotel");
      console.error(err);
      setSelectedHotel(null);
    } finally {
      setLoading(false);
    }
  };

  // Continuar al dashboard
  const handleContinue = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
          ORACLE AI 🏨
        </h1>
        <p className="text-xl text-slate-300">
          Motor de Decisiones de Marketing — IMPACTHON26
        </p>
      </header>

      {!selectedHotel ? (
        // PANTALLA DE BÚSQUEDA
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur p-10 rounded-3xl border border-blue-500/30 shadow-2xl">
            <h2 className="text-3xl font-bold mb-2 text-blue-400">🔍 Ingresa tu Hotel</h2>
            <p className="text-slate-400 mb-8">
              Busca y selecciona tu hotel para continuar
            </p>

            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Busca por nombre o país..."
                className="w-full p-4 bg-slate-700 text-white rounded-2xl border border-slate-600 focus:border-blue-500 focus:outline-none transition text-lg"
                autoFocus
              />
              {loading && (
                <div className="absolute right-4 top-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
                ⚠️ {error}
              </div>
            )}

            {/* Resultados */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((hotel) => (
                  <button
                    key={hotel.id}
                    onClick={() => handleSelectHotel(hotel)}
                    className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 hover:border-blue-500 transition text-left group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition">
                          {hotel.hotelName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {hotel.country} • ⭐ {hotel.stars} estrellas
                        </p>
                      </div>
                      <span className="text-2xl opacity-0 group-hover:opacity-100 transition">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim().length > 0 && searchResults.length === 0 && !loading && (
              <div className="text-center py-8 text-slate-400">
                No se encontraron hoteles
              </div>
            )}
          </div>
        </div>
      ) : status ? (
        // PANTALLA DE ESTADO
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur p-10 rounded-3xl border border-emerald-500/30 shadow-2xl text-center">
            {status.status === "pending" ? (
              <>
                <h2 className="text-3xl font-bold mb-4 text-yellow-400">📋 Completar Cuestionario</h2>
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl mb-6">
                  <p className="text-lg mb-2">
                    Hotel: <span className="font-bold text-blue-300">{status.hotel.hotelName}</span>
                  </p>
                  <p className="text-slate-300">
                    Aún no has registrado tus servicios y amenidades
                  </p>
                </div>
                <p className="text-slate-400 mb-8">
                  Serás redirigido automáticamente al cuestionario en 2 segundos...
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedHotel(null);
                      setStatus(null);
                      localStorage.removeItem("hotelId");
                      localStorage.removeItem("hotelName");
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-full font-bold transition"
                  >
                    ← Cambiar Hotel
                  </button>
                  <button
                    onClick={() => router.push("/amenities")}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 px-6 py-3 rounded-full font-bold transition shadow-lg shadow-yellow-500/20"
                  >
                    → Ir Ahora
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4 text-emerald-400">✅ Hotel Configurado</h2>
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl mb-6">
                  <p className="text-lg mb-2">
                    Hotel: <span className="font-bold text-blue-300">{status.hotel.hotelName}</span>
                  </p>
                  <p className="text-slate-300">
                    Ya tienes servicios registrados. Listo para analizar.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedHotel(null);
                      setStatus(null);
                      localStorage.removeItem("hotelId");
                      localStorage.removeItem("hotelName");
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-full font-bold transition"
                  >
                    ← Otro Hotel
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-full font-bold transition shadow-lg shadow-emerald-500/20"
                  >
                    → Ir al Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <footer className="mt-20 text-center text-slate-500 text-sm">
        <p>© 2026 ORACLE AI - Powered by Impacthon26</p>
      </footer>
    </div>
  );
}
