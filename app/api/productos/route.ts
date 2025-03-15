//USANDO RUTAS DE API ESTATICAS DE NEXT

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST PARA CREAR UN NUEVO PRODUCTO

export async function POST(request: Request) {
  const body = await request.json();

  const { nombre, cantidad, unidad, ultimaActualizacion } = body;

  // Validar y convertir la fecha
  const fechaActualizacion = ultimaActualizacion
    ? new Date(ultimaActualizacion)
    : new Date(); // Si no se proporciona fecha, usar la fecha actual

  // Validar que la fecha sea válida
  if (isNaN(fechaActualizacion.getTime())) {
    return NextResponse.json(
      { error: "Formato de fecha inválido" },
      { status: 400 }
    );
  }

  try {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        cantidad,
        unidad,
        ultimaActualizacion: fechaActualizacion,
      },
    });
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}

// GET PARA OBTENER TODOS LOS PRODUCTOS

export async function GET() {
  try {
    const productos = await prisma.producto.findMany();
    return NextResponse.json(productos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}
