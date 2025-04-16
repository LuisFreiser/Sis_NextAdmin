/*
  Warnings:

  - You are about to drop the column `descuento` on the `DetalleCompras` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DetalleCompras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "lote_productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_compra" REAL NOT NULL,
    CONSTRAINT "DetalleCompras_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compras" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompras_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompras_lote_productoId_fkey" FOREIGN KEY ("lote_productoId") REFERENCES "LoteProductos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DetalleCompras" ("cantidad", "compraId", "id", "lote_productoId", "precio_compra", "productoId") SELECT "cantidad", "compraId", "id", "lote_productoId", "precio_compra", "productoId" FROM "DetalleCompras";
DROP TABLE "DetalleCompras";
ALTER TABLE "new_DetalleCompras" RENAME TO "DetalleCompras";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
