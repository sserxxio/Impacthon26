/*
  Warnings:

  - Added the required column `tipo` to the `Analysis` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotelId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "estrategia" TEXT NOT NULL,
    "anuncio" TEXT NOT NULL,
    "segmentoObjeto" TEXT,
    "diferencadores" TEXT,
    "recomendaciones" TEXT,
    "modeloUsado" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("anuncio", "createdAt", "diferencadores", "errorCount", "estrategia", "hotelId", "id", "modeloUsado", "recomendaciones", "segmentoObjeto", "updatedAt") SELECT "anuncio", "createdAt", "diferencadores", "errorCount", "estrategia", "hotelId", "id", "modeloUsado", "recomendaciones", "segmentoObjeto", "updatedAt" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
