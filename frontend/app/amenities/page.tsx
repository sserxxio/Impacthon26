"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Amenities {
  piscina?: boolean;
  campoTenis?: boolean;
  padel?: boolean;
  gimnasio?: boolean;
  restaurante?: boolean;
  bar?: boolean;
  spa?: boolean;
  sauna?: boolean;
  wifi?: boolean;
  wifiGratis?: boolean;
  estacionamiento?: boolean;
  estacionamientoGratis?: boolean;
  permiteMascotas?: boolean;
  accesibilidad?: boolean;
  notasAdicionales?: string;
}

const SERVICIOS = [
  {
    categoria: "🏊 Instalaciones Deportivas",
    items: [
      { key: "piscina", label: "Piscina" },
      { key: "campoTenis", label: "Campo de Tenis" },
      { key: "padel", label: "Pádel" },
      { key: "gimnasio", label: "Gimnasio" },
    ],
  },
  {
    categoria: "🍽️ Servicios",
    items: [
      { key: "restaurante", label: "Restaurante Propio" },
      { key: "bar", label: "Bar" },
      { key: "spa", label: "Spa" },
      { key: "sauna", label: "Sauna" },
    ],
  },
  {
    categoria: "🌐 Conectividad",
    items: [
      { key: "wifi", label: "WiFi" },
      { key: "wifiGratis", label: "WiFi Gratis" },
    ],
  },
  {
    categoria: "🚗 Estacionamiento",
    items: [
      { key: "estacionamiento", label: "Estacionamiento" },
      { key: "estacionamientoGratis", label: "Estacionamiento Gratis" },
    ],
  },
  {
    categoria: "🏥 Otros",
    items: [
      { key: "permiteMascotas", label: "Acepta Mascotas" },
      { key: "accesibilidad", label: "Accesibilidad para Discapacitados" },
    ],
  },
];

export default function AmenitiesForm({ hotelId }: { hotelId?: number }) {
  const [amenities, setAmenities] = useState<Amenities>({});
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [hotelName, setHotelName] = useState<string>("");
  const [hotels, setHotels] = useState<any[]>([]);
  const router = useRouter();

  // Cargar datos del usuario logueado
  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");

    if (storedHotelId) {
      setSelectedHotel(storedHotelId);
      setHotelName(storedHotelName || "");
      // No mostrar selector si está pre-seleccionado
    } else if (hotelId) {
      setSelectedHotel(hotelId.toString());
    }
  }, [hotelId]);

  // Cargar hoteles disponibles
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await fetch("/api/hotel/list");
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error("Error cargando hoteles:", error);
      }
    };
    loadHotels();
  }, []);

  // Cargar amenities existentes
  useEffect(() => {
    if (!selectedHotel) return;

    const loadAmenities = async () => {
      try {
        const res = await fetch(`/api/hotel/amenities?hotelId=${selectedHotel}`);
        const data = await res.json();
        setAmenities(data);
        setNotas(data.notasAdicionales || "");
      } catch (error) {
        console.error("Error cargando amenities:", error);
      }
    };

    loadAmenities();
  }, [selectedHotel]);

  const handleToggle = (key: string) => {
    setAmenities((prev) => ({
      ...prev,
      [key]: !prev[key as keyof Amenities],
    }));
  };

  const handleSave = async () => {
    if (!selectedHotel) {
      alert("Selecciona un hotel");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hotel/amenities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: parseInt(selectedHotel),
          ...amenities,
          notasAdicionales: notas,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar los servicios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-blue-400">
          📋 Cuestionario de Servicios
        </h1>
        <p className="text-slate-400">
          Completa la información sobre los servicios de tu hotel
        </p>
      </header>

      {/* Selector de Hotel */}
      <div className="mb-8 bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <label className="block text-lg font-bold mb-4">Hotel:</label>
        {hotelName ? (
          <div className="w-full p-3 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500">
            ✓ {hotelName}
          </div>
        ) : (
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600"
          >
            <option value="">-- Selecciona un hotel --</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.hotelName}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedHotel && (
        <>
          {/* Servicios */}
          <div className="space-y-6 mb-8">
            {SERVICIOS.map((seccion) => (
              <div
                key={seccion.categoria}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700"
              >
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                  {seccion.categoria}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {seccion.items.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition"
                    >
                      <input
                        type="checkbox"
                        checked={amenities[item.key as keyof Amenities] || false}
                        onChange={() => handleToggle(item.key)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span className="ml-3 font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notas Adicionales */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8">
            <label className="block text-lg font-bold mb-4">
              📝 Notas Adicionales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agrega cualquier información adicional sobre los servicios..."
              className="w-full p-4 bg-slate-700 text-white rounded-lg border border-slate-600 min-h-24"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? "Guardando..." : "✅ Guardar Servicios"}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 px-8 py-4 rounded-full font-bold transition-all"
            >
              ← Volver
            </button>
            {success && (
              <div className="flex items-center text-green-400 font-bold">
                ✓ Guardado
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
