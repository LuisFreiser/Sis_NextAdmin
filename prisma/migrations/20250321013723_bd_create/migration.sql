-- CreateTable
CREATE TABLE "Categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE'
);

-- CreateTable
CREATE TABLE "Clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "nro_documento" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Marcas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE'
);

-- CreateTable
CREATE TABLE "Proveedores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "nro_documento" TEXT NOT NULL,
    "tipo_documento" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "ultimoLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Productos" (
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
    "imagen" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Productos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marcas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Productos_presentacionId_fkey" FOREIGN KEY ("presentacionId") REFERENCES "Presentacion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ventas" (
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
    CONSTRAINT "Ventas_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "TiposComprobante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetallesVentas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_venta" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DetallesVentas_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Ventas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetallesVentas_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Compras" (
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
    CONSTRAINT "Compras_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "TiposComprobante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetallesCompras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_compra" REAL NOT NULL,
    CONSTRAINT "DetallesCompras_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compras" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetallesCompras_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Presentacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "siglas" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE'
);

-- CreateTable
CREATE TABLE "LotesProducto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "fecha_ingreso" DATETIME NOT NULL,
    "fecha_vencimiento" DATETIME NOT NULL,
    "numero_lote" TEXT,
    "nro_orden_compra" TEXT,
    CONSTRAINT "LotesProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiposComprobante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "comprobante" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE'
);

-- CreateTable
CREATE TABLE "AperturaCierreCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "fecha_apertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mont_inicial" REAL NOT NULL,
    "fecha_cierre" DATETIME,
    "monto_Final" REAL,
    "diferencia" REAL,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTO',
    CONSTRAINT "AperturaCierreCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Caja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aperturaCierreId" INTEGER NOT NULL,
    "tipo_Movimiento" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "metodo_pago" TEXT,
    "descripcion" TEXT,
    CONSTRAINT "Caja_aperturaCierreId_fkey" FOREIGN KEY ("aperturaCierreId") REFERENCES "AperturaCierreCaja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Caja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_empresa" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitio_web" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "Categorias_nombre_key" ON "Categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_nro_documento_key" ON "Clientes"("nro_documento");

-- CreateIndex
CREATE UNIQUE INDEX "Marcas_nombre_key" ON "Marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedores_nro_documento_key" ON "Proveedores"("nro_documento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Productos_codigo_prod_key" ON "Productos"("codigo_prod");

-- CreateIndex
CREATE UNIQUE INDEX "Ventas_nro_comprobante_key" ON "Ventas"("nro_comprobante");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_nombre_key" ON "Roles"("nombre");
