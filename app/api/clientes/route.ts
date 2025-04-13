import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: OBTENER TODOS LOS CLIENTES
export async function GET() {
  try {
    const clientes = await prisma.clientes.findMany({
      include: {
        tipodocumento: true,
      },
    });
    return NextResponse.json(clientes, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener clientes:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: CREAR UN NUEVO CLIENTE
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.nombre || !data.tipo_documento_id || !data.nro_documento) {
      return NextResponse.json(
        { message: 'Nombre, tipo de documento y número de documento son requeridos' },
        { status: 400 }
      );
    }

    const newCliente = await prisma.clientes.create({
      data,
      include: {
        tipodocumento: true,
      },
    });
    return NextResponse.json(newCliente, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear cliente:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: ACTUALIZAR UN CLIENTE EXISTENTE
export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'ID es requerido' }, { status: 400 });
    }

    const existingCliente = await prisma.clientes.findUnique({
      where: { id },
    });

    if (!existingCliente) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    const updatedCliente = await prisma.clientes.update({
      where: { id },
      data: {
        nombre: data.nombre,
        tipo_documento_id: data.tipo_documento_id,
        nro_documento: data.nro_documento,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
      },
      include: {
        tipodocumento: true,
      },
    });

    return NextResponse.json(updatedCliente, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar cliente:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}