/*
  Warnings:

  - You are about to drop the `LoteProducto` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `lote_productoId` to the `DetalleCompras` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoteProducto";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LoteProductos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "numero_lote" TEXT NOT NULL,
    "fecha_vencimiento" DATETIME NOT NULL,
    CONSTRAINT "LoteProductos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "descuento" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DetalleCompras_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compras" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompras_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompras_lote_productoId_fkey" FOREIGN KEY ("lote_productoId") REFERENCES "LoteProductos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DetalleCompras" ("cantidad", "compraId", "descuento", "id", "precio_compra", "productoId") SELECT "cantidad", "compraId", "descuento", "id", "precio_compra", "productoId" FROM "DetalleCompras";
DROP TABLE "DetalleCompras";
ALTER TABLE "new_DetalleCompras" RENAME TO "DetalleCompras";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
