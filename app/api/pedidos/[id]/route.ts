//USANDO RUTAS DE API DINAMICAS DE NEXT

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

//PATCH PARA ACTUALIZAR CAMPOS ESPECIFICOS DE UN PEDIDO (ESTADO)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { estado } = await request.json();

    // Actualizar el estado del pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { estado },
    });

    return NextResponse.json(pedidoActualizado, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el pedido:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  } finally {
    // Es buena práctica desconectar el cliente de Prisma
    await prisma.$disconnect();
  }
}
