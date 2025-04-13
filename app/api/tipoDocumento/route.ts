import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: OBTENER TODOS LOS TIPOS DE DOCUMENTO
export async function GET() {
  try {
    const tiposDocumento = await prisma.tipoDocumento.findMany();
    return NextResponse.json(tiposDocumento, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener tipos de documento:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: CREAR UN NUEVO TIPO DE DOCUMENTO
export async function POST(req: NextRequest) {
  try {
    const { documento, estado } = await req.json();

    if (!documento) {
      return NextResponse.json({ message: 'El documento es requerido' }, { status: 400 });
    }

    const newTipoDocumento = await prisma.tipoDocumento.create({
      data: {
        documento,
        estado: estado || 'ACTIVO',
      },
    });
    return NextResponse.json(newTipoDocumento, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear tipo de documento:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: ACTUALIZAR UN TIPO DE DOCUMENTO EXISTENTE
export async function PUT(req: NextRequest) {
  try {
    const { id, documento, estado } = await req.json();

    if (!id || !documento) {
      return NextResponse.json({ message: 'ID y documento son requeridos' }, { status: 400 });
    }

    const existingTipoDocumento = await prisma.tipoDocumento.findUnique({
      where: { id },
    });

    if (!existingTipoDocumento) {
      return NextResponse.json({ message: 'Tipo de documento no encontrado' }, { status: 404 });
    }

    const updatedTipoDocumento = await prisma.tipoDocumento.update({
      where: { id },
      data: {
        documento,
        estado: estado || existingTipoDocumento.estado,
      },
    });

    return NextResponse.json(updatedTipoDocumento, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar tipo de documento:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}