import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: OBTENER TODOS LOS PROVEEDORES
export async function GET() {
  try {
    const proveedores = await prisma.proveedores.findMany({
      include: {
        tipoDocumento: true,
      },
    });
    return NextResponse.json(proveedores, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener proveedores:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: CREAR UN NUEVO PROVEEDOR
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.nombre || !data.tipo_documento_id || !data.nro_documento) {
      return NextResponse.json(
        { message: 'Nombre, tipo de documento y número de documento son requeridos' },
        { status: 400 }
      );
    }

    const newProveedor = await prisma.proveedores.create({
      data,
      include: {
        tipoDocumento: true,
      },
    });
    return NextResponse.json(newProveedor, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear proveedor:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: ACTUALIZAR UN PROVEEDOR EXISTENTE
export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'ID es requerido' }, { status: 400 });
    }

    const existingProveedor = await prisma.proveedores.findUnique({
      where: { id },
    });

    if (!existingProveedor) {
      return NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
    }

    const updatedProveedor = await prisma.proveedores.update({
      where: { id },
      data: {
        nombre: data.nombre,
        tipo_documento_id: data.tipo_documento_id,
        nro_documento: data.nro_documento,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        estado: data.estado,
      },
      include: {
        tipoDocumento: true,
      },
    });

    return NextResponse.json(updatedProveedor, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar proveedor:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
