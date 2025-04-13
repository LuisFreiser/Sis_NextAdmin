/*
  Warnings:

  - You are about to drop the `Categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Configuracion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DetallesCompras` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DetallesVentas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LotesProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Marcas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Presentacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TiposComprobante` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `categoriaId` on the `Productos` table. All the data in the column will be lost.
  - You are about to drop the column `presentacionId` on the `Productos` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Categorias_nombre_key";

-- DropIndex
DROP INDEX "Marcas_nombre_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Categorias";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Configuracion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DetallesCompras";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DetallesVentas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LotesProducto";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Marcas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Presentacion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TiposComprobante";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Marca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "DetalleVentas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_venta" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DetalleVentas_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Ventas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleVentas_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetalleCompras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_compra" REAL NOT NULL,
    CONSTRAINT "DetalleCompras_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compras" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompras_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoteProducto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "fecha_ingreso" DATETIME NOT NULL,
    "fecha_vencimiento" DATETIME NOT NULL,
    "numero_lote" TEXT,
    "nro_orden_compra" TEXT,
    CONSTRAINT "LoteProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TipoComprobante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "comprobante" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_empresa" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "simbolo_moneda" TEXT NOT NULL DEFAULT '$',
    "formato_fecha" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "formato_hora" TEXT NOT NULL DEFAULT 'HH:mm:ss',
    "igv_general" REAL NOT NULL DEFAULT 0.0,
    "logo" TEXT,
    "terminos_condiciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AperturaCierreCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "fecha_apertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mont_inicial" REAL NOT NULL,
    "fecha_cierre" DATETIME,
    "monto_Final" REAL,
    "diferencia" REAL,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    CONSTRAINT "AperturaCierreCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AperturaCierreCaja" ("diferencia", "estado", "fecha_apertura", "fecha_cierre", "id", "mont_inicial", "monto_Final", "observaciones", "usuarioId") SELECT "diferencia", "estado", "fecha_apertura", "fecha_cierre", "id", "mont_inicial", "monto_Final", "observaciones", "usuarioId" FROM "AperturaCierreCaja";
DROP TABLE "AperturaCierreCaja";
ALTER TABLE "new_AperturaCierreCaja" RENAME TO "AperturaCierreCaja";
CREATE TABLE "new_Compras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nro_comprobante" TEXT,
    "proveedorId" INTEGER NOT NULL,
    "fecha_compra" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_pago" TEXT NOT NULL,
    "tipo_comprobante_id" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Compras_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Compras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Compras_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "TipoComprobante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Compras" ("estado", "fecha_compra", "id", "nro_comprobante", "proveedorId", "tipo_comprobante_id", "tipo_pago", "usuarioId") SELECT "estado", "fecha_compra", "id", "nro_comprobante", "proveedorId", "tipo_comprobante_id", "tipo_pago", "usuarioId" FROM "Compras";
DROP TABLE "Compras";
ALTER TABLE "new_Compras" RENAME TO "Compras";
CREATE TABLE "new_Productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_prod" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marcaId" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "stock_min" INTEGER,
    "precio_compra" REAL NOT NULL,
    "precio_venta" REAL NOT NULL,
    "imagen" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Productos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Productos" ("codigo_prod", "createdAt", "estado", "id", "imagen", "marcaId", "nombre", "precio_compra", "precio_venta", "stock", "stock_min") SELECT "codigo_prod", "createdAt", "estado", "id", "imagen", "marcaId", "nombre", "precio_compra", "precio_venta", "stock", "stock_min" FROM "Productos";
DROP TABLE "Productos";
ALTER TABLE "new_Productos" RENAME TO "Productos";
CREATE UNIQUE INDEX "Productos_codigo_prod_key" ON "Productos"("codigo_prod");
CREATE TABLE "new_Proveedores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "nro_documento" TEXT NOT NULL,
    "tipo_documento" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Proveedores" ("ciudad", "contacto", "createdAt", "direccion", "email", "estado", "id", "nombre", "nro_documento", "telefono", "tipo_documento") SELECT "ciudad", "contacto", "createdAt", "direccion", "email", "estado", "id", "nombre", "nro_documento", "telefono", "tipo_documento" FROM "Proveedores";
DROP TABLE "Proveedores";
ALTER TABLE "new_Proveedores" RENAME TO "Proveedores";
CREATE UNIQUE INDEX "Proveedores_nro_documento_key" ON "Proveedores"("nro_documento");
CREATE TABLE "new_Ventas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nro_comprobante" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fecha_venta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_pago" TEXT NOT NULL,
    "tipo_comprobante_id" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Ventas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ventas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ventas_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "TipoComprobante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ventas" ("clienteId", "estado", "fecha_venta", "id", "nro_comprobante", "tipo_comprobante_id", "tipo_pago", "usuarioId") SELECT "clienteId", "estado", "fecha_venta", "id", "nro_comprobante", "tipo_comprobante_id", "tipo_pago", "usuarioId" FROM "Ventas";
DROP TABLE "Ventas";
ALTER TABLE "new_Ventas" RENAME TO "Ventas";
CREATE UNIQUE INDEX "Ventas_nro_comprobante_key" ON "Ventas"("nro_comprobante");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Marca_nombre_key" ON "Marca"("nombre");
