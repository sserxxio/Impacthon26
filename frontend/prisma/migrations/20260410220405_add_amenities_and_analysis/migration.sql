-- CreateTable
CREATE TABLE "HotelAmenities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotelId" INTEGER NOT NULL,
    "piscina" BOOLEAN NOT NULL DEFAULT false,
    "campoTenis" BOOLEAN NOT NULL DEFAULT false,
    "padel" BOOLEAN NOT NULL DEFAULT false,
    "gimnasio" BOOLEAN NOT NULL DEFAULT false,
    "restaurante" BOOLEAN NOT NULL DEFAULT false,
    "bar" BOOLEAN NOT NULL DEFAULT false,
    "spa" BOOLEAN NOT NULL DEFAULT false,
    "sauna" BOOLEAN NOT NULL DEFAULT false,
    "wifi" BOOLEAN NOT NULL DEFAULT true,
    "wifiGratis" BOOLEAN NOT NULL DEFAULT false,
    "estacionamiento" BOOLEAN NOT NULL DEFAULT false,
    "estacionamientoGratis" BOOLEAN NOT NULL DEFAULT false,
    "permiteMascotas" BOOLEAN NOT NULL DEFAULT false,
    "accesibilidad" BOOLEAN NOT NULL DEFAULT false,
    "notasAdicionales" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HotelAmenities_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotelId" INTEGER NOT NULL,
    "estrategia" TEXT NOT NULL,
    "anuncio" TEXT NOT NULL,
    "segmentoObjeto" TEXT,
    "diferencadores" TEXT,
    "recomendaciones" TEXT,
    "modeloUsado" TEXT NOT NULL DEFAULT 'gemini-flash-latest',
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "HotelAmenities_hotelId_key" ON "HotelAmenities"("hotelId");
