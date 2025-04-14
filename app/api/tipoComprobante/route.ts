import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const tiposComprobante = await prisma.tipoComprobante.findMany();
    return NextResponse.json(tiposComprobante, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener tipos de comprobante:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { codigo, nombre, estado } = await req.json();

    if (!codigo || !nombre) {
      return NextResponse.json(
        { message: 'El código y nombre son requeridos' },
        { status: 400 }
      );
    }

    const newTipoComprobante = await prisma.tipoComprobante.create({
      data: {
        codigo,
        nombre,
        estado: estado || 'ACTIVO',
      },
    });
    return NextResponse.json(newTipoComprobante, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear tipo de comprobante:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, codigo, nombre, estado } = await req.json();

    if (!id || !codigo || !nombre) {
      return NextResponse.json(
        { message: 'ID, código y nombre son requeridos' },
        { status: 400 }
      );
    }

    const existingTipoComprobante = await prisma.tipoComprobante.findUnique({
      where: { id },
    });

    if (!existingTipoComprobante) {
      return NextResponse.json(
        { message: 'Tipo de comprobante no encontrado' },
        { status: 404 }
      );
    }

    const updatedTipoComprobante = await prisma.tipoComprobante.update({
      where: { id },
      data: {
        codigo,
        nombre,
        estado: estado || existingTipoComprobante.estado,
      },
    });

    return NextResponse.json(updatedTipoComprobante, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar tipo de comprobante:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}