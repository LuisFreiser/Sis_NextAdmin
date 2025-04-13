import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: OBTENER TODAS LAS MARCAS
export async function GET() {
  try {
    const marcas = await prisma.marca.findMany();
    return NextResponse.json(marcas, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener marcas:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al obtener marcas:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: CREAR UNA NUEVA MARCA
export async function POST(req: NextRequest) {
  try {
    const { nombre, estado } = await req.json();

    if (!nombre) {
      return NextResponse.json({ message: 'Nombre is required' }, { status: 400 });
    }

    const newMarca = await prisma.marca.create({
      data: {
        nombre,
        estado: estado || 'ACTIVO',
      },
    });
    return NextResponse.json(newMarca, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear marca:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al crear marca:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: ACTUALIZAR UNA MARCA EXISTENTE
export async function PUT(req: NextRequest) {
  try {
    const { id, nombre, estado } = await req.json();

    if (!id || !nombre) {
      return NextResponse.json({ message: 'ID y nombre son requeridos' }, { status: 400 });
    }

    const existingMarca = await prisma.marca.findUnique({
      where: { id },
    });

    if (!existingMarca) {
      return NextResponse.json({ message: 'Marca no encontrada' }, { status: 404 });
    }

    const updatedMarca = await prisma.marca.update({
      where: { id },
      data: {
        nombre,
        estado: estado || existingMarca.estado,
      },
    });

    return NextResponse.json(updatedMarca, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar marca:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al actualizar marca:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: ELIMINAR UNA MARCA
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get('id') || '');

    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID de marca inválido' }, { status: 400 });
    }

    const existingMarca = await prisma.marca.findUnique({
      where: { id },
    });

    if (!existingMarca) {
      return NextResponse.json({ message: 'Marca no encontrada' }, { status: 404 });
    }

    await prisma.marca.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Marca eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting marca:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error deleting marca:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
