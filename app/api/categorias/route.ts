import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categorias.findMany();
    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener categorias:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al obtener categorias:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear una nueva categoría
export async function POST(req: NextRequest) {
  try {
    const { nombre, estado } = await req.json();

    if (!nombre) {
      return NextResponse.json({ message: 'Nombre is required' }, { status: 400 });
    }

    const newCategoria = await prisma.categorias.create({
      data: {
        nombre,
        estado: estado || 'VIGENTE',
      },
    });
    return NextResponse.json(newCategoria, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear categoria:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al crear categoria:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: Actualizar una categoría existente
export async function PUT(req: NextRequest) {
  try {
    const { id, nombre, estado } = await req.json();

    if (!id || !nombre) {
      return NextResponse.json({ message: 'ID y nombre son requeridos' }, { status: 400 });
    }

    // Verificar si la categoría existe
    const existingCategoria = await prisma.categorias.findUnique({
      where: { id },
    });

    if (!existingCategoria) {
      return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 });
    }

    const updatedCategoria = await prisma.categorias.update({
      where: { id },
      data: {
        nombre,
        estado: estado || existingCategoria.estado,
      },
    });

    return NextResponse.json(updatedCategoria, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar categoria:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al actualizar categoria:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar una categoría existente
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get('id') || '');

    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID de categoría inválido' }, { status: 400 });
    }

    // Verificar si la categoría existe
    const existingCategoria = await prisma.categorias.findUnique({
      where: { id },
    });

    if (!existingCategoria) {
      return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 });
    }

    await prisma.categorias.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting categoria:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error deleting categoria:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
