import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Obtener todas las presentaciones
export async function GET() {
  try {
    const presentaciones = await prisma.presentacion.findMany();
    return NextResponse.json(presentaciones, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener presentaciones:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al obtener presentaciones:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear una nueva presentación
export async function POST(req: NextRequest) {
  try {
    const { nombre, siglas, estado } = await req.json();

    if (!nombre || !siglas) {
      return NextResponse.json({ message: 'Nombre y siglas son requeridos' }, { status: 400 });
    }

    const newPresentacion = await prisma.presentacion.create({
      data: {
        nombre,
        siglas,
        estado: estado || 'VIGENTE',
      },
    });
    return NextResponse.json(newPresentacion, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear presentación:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al crear presentación:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: Actualizar una presentación existente
export async function PUT(req: NextRequest) {
  try {
    const { id, nombre, siglas, estado } = await req.json();

    if (!id || !nombre || !siglas) {
      return NextResponse.json({ message: 'ID, nombre y siglas son requeridos' }, { status: 400 });
    }

    const existingPresentacion = await prisma.presentacion.findUnique({
      where: { id },
    });

    if (!existingPresentacion) {
      return NextResponse.json({ message: 'Presentación no encontrada' }, { status: 404 });
    }

    const updatedPresentacion = await prisma.presentacion.update({
      where: { id },
      data: {
        nombre,
        siglas,
        estado: estado || existingPresentacion.estado,
      },
    });

    return NextResponse.json(updatedPresentacion, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar presentación:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al actualizar presentación:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}