/*
  Warnings:

  - You are about to drop the column `campoTenis` on the `HotelAmenities` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HotelAmenities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotelId" INTEGER NOT NULL,
    "piscina" BOOLEAN NOT NULL DEFAULT false,
    "pistasTenis" BOOLEAN NOT NULL DEFAULT false,
    "padel" BOOLEAN NOT NULL DEFAULT false,
    "gimnasio" BOOLEAN NOT NULL DEFAULT false,
    "restaurante" BOOLEAN NOT NULL DEFAULT false,
    "bar" BOOLEAN NOT NULL DEFAULT false,
    "spa" BOOLEAN NOT NULL DEFAULT false,
    "sauna" BOOLEAN NOT NULL DEFAULT false,
    "buffet" BOOLEAN NOT NULL DEFAULT false,
    "wifi" BOOLEAN NOT NULL DEFAULT true,
    "wifiGratis" BOOLEAN NOT NULL DEFAULT false,
    "estacionamiento" BOOLEAN NOT NULL DEFAULT false,
    "estacionamientoGratis" BOOLEAN NOT NULL DEFAULT false,
    "habitacionesVIP" BOOLEAN NOT NULL DEFAULT false,
    "permiteMascotas" BOOLEAN NOT NULL DEFAULT false,
    "salaJuegos" BOOLEAN NOT NULL DEFAULT false,
    "guarderia" BOOLEAN NOT NULL DEFAULT false,
    "accesibilidad" BOOLEAN NOT NULL DEFAULT false,
    "idiomas" BOOLEAN NOT NULL DEFAULT false,
    "actividades" BOOLEAN NOT NULL DEFAULT false,
    "sitioFumar" BOOLEAN NOT NULL DEFAULT false,
    "earlyCheckin" BOOLEAN NOT NULL DEFAULT false,
    "lateCheckin" BOOLEAN NOT NULL DEFAULT false,
    "notasAdicionales" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HotelAmenities_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HotelAmenities" ("accesibilidad", "bar", "createdAt", "estacionamiento", "estacionamientoGratis", "gimnasio", "hotelId", "id", "notasAdicionales", "padel", "permiteMascotas", "piscina", "restaurante", "sauna", "spa", "updatedAt", "wifi", "wifiGratis") SELECT "accesibilidad", "bar", "createdAt", "estacionamiento", "estacionamientoGratis", "gimnasio", "hotelId", "id", "notasAdicionales", "padel", "permiteMascotas", "piscina", "restaurante", "sauna", "spa", "updatedAt", "wifi", "wifiGratis" FROM "HotelAmenities";
DROP TABLE "HotelAmenities";
ALTER TABLE "new_HotelAmenities" RENAME TO "HotelAmenities";
CREATE UNIQUE INDEX "HotelAmenities_hotelId_key" ON "HotelAmenities"("hotelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
