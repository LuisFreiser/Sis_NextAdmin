/*
  Warnings:

  - You are about to alter the column `imagen` on the `Productos` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_prod" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio_compra" REAL NOT NULL,
    "precio_venta" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "stock_min" INTEGER,
    "categoriaId" INTEGER NOT NULL,
    "marcaId" INTEGER NOT NULL,
    "presentacionId" INTEGER,
    "imagen" BLOB,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Productos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marcas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Productos_presentacionId_fkey" FOREIGN KEY ("presentacionId") REFERENCES "Presentacion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Productos" ("categoriaId", "codigo_prod", "createdAt", "estado", "id", "imagen", "marcaId", "nombre", "precio_compra", "precio_venta", "presentacionId", "stock", "stock_min") SELECT "categoriaId", "codigo_prod", "createdAt", "estado", "id", "imagen", "marcaId", "nombre", "precio_compra", "precio_venta", "presentacionId", "stock", "stock_min" FROM "Productos";
DROP TABLE "Productos";
ALTER TABLE "new_Productos" RENAME TO "Productos";
CREATE UNIQUE INDEX "Productos_codigo_prod_key" ON "Productos"("codigo_prod");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
