/*
  Warnings:

  - You are about to drop the column `tipo_documento` on the `Clientes` table. All the data in the column will be lost.
  - You are about to drop the column `ciudad` on the `Proveedores` table. All the data in the column will be lost.
  - You are about to drop the column `contacto` on the `Proveedores` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_documento` on the `Proveedores` table. All the data in the column will be lost.
  - Added the required column `tipo_documento_id` to the `Clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_documento_id` to the `Proveedores` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TipoDocumento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documento" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "nro_documento" TEXT NOT NULL,
    "tipo_documento_id" INTEGER NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Clientes_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "TipoDocumento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Clientes" ("createdAt", "direccion", "email", "id", "nombre", "nro_documento", "telefono") SELECT "createdAt", "direccion", "email", "id", "nombre", "nro_documento", "telefono" FROM "Clientes";
DROP TABLE "Clientes";
ALTER TABLE "new_Clientes" RENAME TO "Clientes";
CREATE UNIQUE INDEX "Clientes_nro_documento_key" ON "Clientes"("nro_documento");
CREATE TABLE "new_Proveedores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tipo_documento_id" INTEGER NOT NULL,
    "nro_documento" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proveedores_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "TipoDocumento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Proveedores" ("createdAt", "direccion", "email", "estado", "id", "nombre", "nro_documento", "telefono") SELECT "createdAt", "direccion", "email", "estado", "id", "nombre", "nro_documento", "telefono" FROM "Proveedores";
DROP TABLE "Proveedores";
ALTER TABLE "new_Proveedores" RENAME TO "Proveedores";
CREATE UNIQUE INDEX "Proveedores_nro_documento_key" ON "Proveedores"("nro_documento");
CREATE UNIQUE INDEX "Proveedores_email_key" ON "Proveedores"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_documento_key" ON "TipoDocumento"("documento");
