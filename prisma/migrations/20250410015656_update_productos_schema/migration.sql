/*
  Warnings:

  - You are about to drop the column `mont_inicial` on the `AperturaCierreCaja` table. All the data in the column will be lost.
  - You are about to drop the column `monto_Final` on the `AperturaCierreCaja` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_Movimiento` on the `Caja` table. All the data in the column will be lost.
  - You are about to drop the column `precio_venta` on the `Productos` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Productos` table. All the data in the column will be lost.
  - You are about to drop the column `stock_min` on the `Productos` table. All the data in the column will be lost.
  - Added the required column `monto_inicial` to the `AperturaCierreCaja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_movimiento` to the `Caja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `TipoComprobante` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AperturaCierreCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "fecha_apertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_inicial" REAL NOT NULL,
    "fecha_cierre" DATETIME,
    "monto_final" REAL,
    "diferencia" REAL,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    CONSTRAINT "AperturaCierreCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AperturaCierreCaja" ("diferencia", "estado", "fecha_apertura", "fecha_cierre", "id", "observaciones", "usuarioId") SELECT "diferencia", "estado", "fecha_apertura", "fecha_cierre", "id", "observaciones", "usuarioId" FROM "AperturaCierreCaja";
DROP TABLE "AperturaCierreCaja";
ALTER TABLE "new_AperturaCierreCaja" RENAME TO "AperturaCierreCaja";
CREATE TABLE "new_Caja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aperturaCierreId" INTEGER NOT NULL,
    "tipo_movimiento" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "metodo_pago" TEXT,
    "descripcion" TEXT,
    CONSTRAINT "Caja_aperturaCierreId_fkey" FOREIGN KEY ("aperturaCierreId") REFERENCES "AperturaCierreCaja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Caja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Caja" ("aperturaCierreId", "descripcion", "id", "metodo_pago", "usuarioId") SELECT "aperturaCierreId", "descripcion", "id", "metodo_pago", "usuarioId" FROM "Caja";
DROP TABLE "Caja";
ALTER TABLE "new_Caja" RENAME TO "Caja";
CREATE TABLE "new_Productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_prod" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marcaId" INTEGER NOT NULL,
    "unidades_por_caja" INTEGER,
    "stock_cajas" INTEGER NOT NULL DEFAULT 0,
    "stock_unidades" INTEGER,
    "stock_min_cajas" INTEGER,
    "precio_compra" REAL NOT NULL,
    "precio_venta_caja" REAL NOT NULL DEFAULT 0,
    "precio_venta_unit" REAL NOT NULL DEFAULT 0,
    "imagen" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Productos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Productos" ("codigo_prod", "createdAt", "estado", "id", "imagen", "marcaId", "nombre", "precio_compra") SELECT "codigo_prod", "createdAt", "estado", "id", "imagen", "marcaId", "nombre", "precio_compra" FROM "Productos";
DROP TABLE "Productos";
ALTER TABLE "new_Productos" RENAME TO "Productos";
CREATE UNIQUE INDEX "Productos_codigo_prod_key" ON "Productos"("codigo_prod");
CREATE TABLE "new_TipoComprobante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "comprobante" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO'
);
INSERT INTO "new_TipoComprobante" ("comprobante", "estado", "id") SELECT "comprobante", "estado", "id" FROM "TipoComprobante";
DROP TABLE "TipoComprobante";
ALTER TABLE "new_TipoComprobante" RENAME TO "TipoComprobante";
CREATE UNIQUE INDEX "TipoComprobante_codigo_key" ON "TipoComprobante"("codigo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
