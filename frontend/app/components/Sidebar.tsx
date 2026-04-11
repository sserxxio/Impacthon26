"use client";

import { useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem("hotelId");
    localStorage.removeItem("hotelName");
    router.push("/login");
  };

  return (
    <>
      {/* Botón flotante para toggle */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-[60] border border-[#ae8d6e]/40 bg-white/80 backdrop-blur-sm text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1] p-2 rounded-full transition-all shadow-md top-4 ${
          isOpen ? "left-56 rotate-0" : "left-4 rotate-180"
        }`}
        title={isOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
      >
        <span className="text-[10px]">◀</span>
      </button>

      {/* Sidebar con animación de ancho */}
      <aside className={`bg-white border-r border-[#ae8d6e]/20 flex flex-col h-screen sticky top-0 transition-all duration-300 z-[50] overflow-hidden ${
        isOpen ? "w-64 shrink-0" : "w-0 shrink-0 border-none"
      }`}>
        <div className="w-64 flex flex-col h-full p-6">
          {/* Espaciador para no chocar con el botón flotante */}
          <div className="pt-16"></div>

          {/* Navegación de Estrategias - SIEMPRE VISIBLE */}
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => router.push("/")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all border border-[#ae8d6e]/30 bg-transparent text-[#683110] hover:bg-[#f5f4f1]`}
            >
              Añadir Estrategia
            </button>

            <button
              onClick={() => router.push("/manage")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all border border-[#ae8d6e]/30 bg-transparent text-[#683110] hover:bg-[#f5f4f1]`}
            >
              Gestionar Estrategias
            </button>

            <button
              onClick={() => router.push("/stats")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all border border-[#ae8d6e]/30 bg-transparent text-[#683110] hover:bg-[#f5f4f1]`}
            >
              Estadísticas
            </button>

            <button
              onClick={() => router.push("/competition")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all border border-[#ae8d6e]/30 bg-transparent text-[#683110] hover:bg-[#f5f4f1]`}
            >
              Competencia
            </button>

            <button
              onClick={() => router.push("/content")}
              className={`w-full text-left px-4 py-3 rounded-xl font-black transition-all border border-[#683110] bg-[#683110] text-[#f5f4f1] hover:opacity-90 shadow-md`}
            >
              Generador contenido
            </button>
          </nav>

          {/* Botones de Acción */}
          <div className="space-y-2 pt-6 border-t border-[#ae8d6e]/20">
            <button
              onClick={handleLogout}
              className="w-full border border-[#c50000]/30 bg-transparent hover:bg-[#c50000] hover:text-[#f5f4f1] px-4 py-3 rounded-xl font-bold transition-all text-sm text-[#c50000]"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
