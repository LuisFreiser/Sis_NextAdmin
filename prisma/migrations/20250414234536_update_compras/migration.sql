/*
  Warnings:

  - You are about to drop the column `tipo_pago` on the `Compras` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Compras` table. All the data in the column will be lost.
  - Made the column `tipo_comprobante_id` on table `Compras` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipo_comprobante_id` on table `Ventas` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Compras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proveedorId" INTEGER NOT NULL,
    "tipo_comprobante_id" INTEGER NOT NULL,
    "nro_comprobante" TEXT,
    "fecha_compra" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_moneda" TEXT NOT NULL DEFAULT 'PEN',
    "forma_pago" TEXT NOT NULL DEFAULT 'CONTADO',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT "Compras_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Compras_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "TipoComprobante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Compras" ("estado", "fecha_compra", "id", "nro_comprobante", "proveedorId", "tipo_comprobante_id") SELECT "estado", "fecha_compra", "id", "nro_comprobante", "proveedorId", "tipo_comprobante_id" FROM "Compras";
DROP TABLE "Compras";
ALTER TABLE "new_Compras" RENAME TO "Compras";
CREATE TABLE "new_DetalleCompras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_compra" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DetalleCompras_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compras" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompras_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DetalleCompras" ("cantidad", "compraId", "id", "precio_compra", "productoId") SELECT "cantidad", "compraId", "id", "precio_compra", "productoId" FROM "DetalleCompras";
DROP TABLE "DetalleCompras";
ALTER TABLE "new_DetalleCompras" RENAME TO "DetalleCompras";
CREATE TABLE "new_Ventas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nro_comprobante" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fecha_venta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_pago" TEXT NOT NULL,
    "tipo_comprobante_id" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Ventas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ventas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ventas_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "TipoComprobante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ventas" ("clienteId", "estado", "fecha_venta", "id", "nro_comprobante", "tipo_comprobante_id", "tipo_pago", "usuarioId") SELECT "clienteId", "estado", "fecha_venta", "id", "nro_comprobante", "tipo_comprobante_id", "tipo_pago", "usuarioId" FROM "Ventas";
DROP TABLE "Ventas";
ALTER TABLE "new_Ventas" RENAME TO "Ventas";
CREATE UNIQUE INDEX "Ventas_nro_comprobante_key" ON "Ventas"("nro_comprobante");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
