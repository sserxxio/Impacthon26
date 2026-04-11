"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

interface Amenities {
  piscina?: boolean;
  pistasTenis?: boolean;
  padel?: boolean;
  gimnasio?: boolean;
  restaurante?: boolean;
  bar?: boolean;
  spa?: boolean;
  sauna?: boolean;
  buffet?: boolean;
  wifiGratis?: boolean;
  estacionamientoGratis?: boolean;
  habitacionesVIP?: boolean;
  permiteMascotas?: boolean;
  salaJuegos?: boolean;
  guarderia?: boolean;
  accesibilidad?: boolean;
  idiomas?: boolean;
  actividades?: boolean;
  sitioFumar?: boolean;
  earlyCheckin?: boolean;
  lateCheckin?: boolean;
  notasAdicionales?: string;
}

const SERVICIOS = [
  {
    categoria: "🏊 Instalaciones Deportivas",
    items: [
      { key: "piscina", label: "Piscina" },
      { key: "pistasTenis", label: "Pistas de Tenis" },
      { key: "padel", label: "Pádel" },
      { key: "gimnasio", label: "Gimnasio" },
    ],
  },
  {
    categoria: "🍽️ Servicios de Alojamiento",
    items: [
      { key: "restaurante", label: "Restaurante" },
      { key: "bar", label: "Bar" },
      { key: "buffet", label: "Buffet" },
      { key: "spa", label: "Spa" },
      { key: "sauna", label: "Sauna" },
    ],
  },
  {
    categoria: "🛏️ Tipos de Habitaciones",
    items: [
      { key: "habitacionesVIP", label: "Habitaciones VIP" },
      { key: "permiteMascotas", label: "Pet-Friendly (Mascotas permitidas)" },
    ],
  },
  {
    categoria: "👨‍👩‍👧‍👦 Entretenimiento y Niños",
    items: [
      { key: "salaJuegos", label: "Sala de Juegos" },
      { key: "guarderia", label: "Guardería/Sala para Niños" },
      { key: "actividades", label: "Actividades y Eventos" },
    ],
  },
  {
    categoria: "♿ Accesibilidad e Idiomas",
    items: [
      { key: "accesibilidad", label: "Adaptado para Personas con Discapacidad" },
      { key: "idiomas", label: "Personal que habla múltiples idiomas" },
    ],
  },
  {
    categoria: "⏰ Facilidades de Entrada/Salida",
    items: [
      { key: "earlyCheckin", label: "Early Check-in" },
      { key: "lateCheckin", label: "Late Check-in" },
      { key: "sitioFumar", label: "Zona para Fumar" },
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

  // Redirigir cuando success sea true
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/stats");
      }, 2000);
      return () => clearTimeout(timer); // Limpiar el timeout si el componente se desmonta
    }
  }, [success, router]);

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

      // Esto activará el useEffect que redirige a /stats
      setSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar los servicios");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-[#5e0710] p-8">
      <Header hotelName={hotelName} />

      {selectedHotel && (
        <>
          {/* Servicios */}
          <div className="space-y-6 mb-8">
            {SERVICIOS.map((seccion) => (
              <div
                key={seccion.categoria}
                className="bg-white p-6 rounded-2xl border border-[#ae8d6e]"
              >
                <h2 className="text-xl font-bold text-[#683110] mb-4">
                  {seccion.categoria}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {seccion.items.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center p-3 bg-[#683110] rounded-lg cursor-pointer hover:bg-[#683110] transition"
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
          <div className="bg-white p-6 rounded-2xl border border-[#ae8d6e] mb-8">
            <label className="block text-lg font-bold mb-4">
              📝 Notas Adicionales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agrega cualquier información adicional sobre los servicios..."
              className="w-full p-4 bg-[#683110] text-[#5e0710] rounded-lg border border-[#683110] min-h-24"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#683110] hover:bg-[#f5f4f1]0 disabled:bg-[#683110] px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? "Guardando..." : "✅ Guardar Servicios"}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-[#683110] hover:bg-[#683110] px-8 py-4 rounded-full font-bold transition-all"
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
