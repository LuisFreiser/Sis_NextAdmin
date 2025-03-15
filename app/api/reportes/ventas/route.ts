import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // Asegúrate de configurar prisma en `lib/prisma.ts`

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fechaInicio, fechaFin } = body;

    const ventas = await prisma.pedido.findMany({
      where: {
        createdAt: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
      select: {
        cliente: true,
        producto: true,
        cantidad: true,
        precioTotal: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ventas });
  } catch (error) {
    console.error("Error fetching ventas:", error);
    return NextResponse.json(
      { error: "Error fetching ventas" },
      { status: 500 }
    );
  }
}
