import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const seriesComprobante = await prisma.seriesComprobante.findMany({
      include: {
        tipoComprobante: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
      },
    });
    return NextResponse.json(seriesComprobante, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener series de comprobante:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tipo_comprobante_id, serie, estado, correlativo_actual } = await req.json();

    if (!tipo_comprobante_id || !serie) {
      return NextResponse.json(
        { message: 'El tipo de comprobante y serie son requeridos' },
        { status: 400 }
      );
    }

    const newSerieComprobante = await prisma.seriesComprobante.create({
      data: {
        tipo_comprobante_id,
        serie: serie.toUpperCase(),
        estado: estado || 'ACTIVO',
        correlativo_actual: correlativo_actual || 0,
      },
      include: {
        tipoComprobante: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
      },
    });
    return NextResponse.json(newSerieComprobante, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear serie de comprobante:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, tipo_comprobante_id, serie, estado, correlativo_actual } = await req.json();

    if (!id || !tipo_comprobante_id || !serie) {
      return NextResponse.json(
        { message: 'ID, tipo de comprobante y serie son requeridos' },
        { status: 400 }
      );
    }

    const existingSerieComprobante = await prisma.seriesComprobante.findUnique({
      where: { id },
    });

    if (!existingSerieComprobante) {
      return NextResponse.json(
        { message: 'Serie de comprobante no encontrada' },
        { status: 404 }
      );
    }

    const updatedSerieComprobante = await prisma.seriesComprobante.update({
      where: { id },
      data: {
        tipo_comprobante_id,
        serie: serie.toUpperCase(),
        estado: estado || existingSerieComprobante.estado,
        correlativo_actual: correlativo_actual || existingSerieComprobante.correlativo_actual,
      },
      include: {
        tipoComprobante: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSerieComprobante, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar serie de comprobante:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}