/*
  Warnings:

  - You are about to drop the column `comprobante` on the `TipoComprobante` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `TipoComprobante` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SeriesComprobante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo_comprobante_id" INTEGER NOT NULL,
    "serie" TEXT NOT NULL,
    "correlativo_actual" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT,
    CONSTRAINT "SeriesComprobante_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "TipoComprobante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TipoComprobante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT
);
INSERT INTO "new_TipoComprobante" ("codigo", "estado", "id") SELECT "codigo", "estado", "id" FROM "TipoComprobante";
DROP TABLE "TipoComprobante";
ALTER TABLE "new_TipoComprobante" RENAME TO "TipoComprobante";
CREATE UNIQUE INDEX "TipoComprobante_codigo_key" ON "TipoComprobante"("codigo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SeriesComprobante_tipo_comprobante_id_serie_key" ON "SeriesComprobante"("tipo_comprobante_id", "serie");
