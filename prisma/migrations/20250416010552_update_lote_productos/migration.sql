/*
  Warnings:

  - You are about to drop the column `productoId` on the `LoteProductos` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoteProductos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_lote" TEXT NOT NULL,
    "fecha_vencimiento" DATETIME NOT NULL
);
INSERT INTO "new_LoteProductos" ("fecha_vencimiento", "id", "numero_lote") SELECT "fecha_vencimiento", "id", "numero_lote" FROM "LoteProductos";
DROP TABLE "LoteProductos";
ALTER TABLE "new_LoteProductos" RENAME TO "LoteProductos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
