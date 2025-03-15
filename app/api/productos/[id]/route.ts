//USANDO RUTAS DE API DINAMICAS DE NEXT

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// DELETE PARA ELIMINAR UN PRODUCTO X ID

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.producto.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}

// PUT PARA ACTUALIZAR UN PRODUCTO X ID

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { nombre, cantidad, unidad } = await request.json();

  try {
    const updatedProducto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { nombre, cantidad, unidad, ultimaActualizacion: new Date() },
    });
    return NextResponse.json(updatedProducto);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}
