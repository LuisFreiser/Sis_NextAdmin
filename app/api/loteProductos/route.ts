import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: OBTENER TODOS LOS LOTES DE PRODUCTOS
export async function GET() {
  try {
    const lotes = await prisma.loteProductos.findMany({
      include: {
        detalleCompras: true,
      },
    });
    return NextResponse.json(lotes, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener lotes:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al obtener lotes:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: CREAR UN NUEVO LOTE DE PRODUCTOS
export async function POST(req: NextRequest) {
  try {
    const { numero_lote, fecha_vencimiento } = await req.json();

    if (!numero_lote || !fecha_vencimiento) {
      return NextResponse.json(
        { message: 'Número de lote y fecha de vencimiento son requeridos' },
        { status: 400 }
      );
    }

    const newLote = await prisma.loteProductos.create({
      data: {
        numero_lote,
        fecha_vencimiento: new Date(fecha_vencimiento),
      },
    });
    return NextResponse.json(newLote, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear lote:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al crear lote:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: ACTUALIZAR UN LOTE EXISTENTE
export async function PUT(req: NextRequest) {
  try {
    const { id, numero_lote, fecha_vencimiento } = await req.json();

    if (!id || !numero_lote || !fecha_vencimiento) {
      return NextResponse.json(
        { message: 'ID, número de lote y fecha de vencimiento son requeridos' },
        { status: 400 }
      );
    }

    const existingLote = await prisma.loteProductos.findUnique({
      where: { id },
    });

    if (!existingLote) {
      return NextResponse.json({ message: 'Lote no encontrado' }, { status: 404 });
    }

    const updatedLote = await prisma.loteProductos.update({
      where: { id },
      data: {
        numero_lote,
        fecha_vencimiento: new Date(fecha_vencimiento),
      },
    });

    return NextResponse.json(updatedLote, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar lote:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('Error al actualizar lote:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
