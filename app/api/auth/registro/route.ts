import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
      },
    });
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener usuarios:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password, rol, estado } = await req.json();

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { message: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: rol || 'USUARIO',
        estado: estado || 'ACTIVO',
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear usuario:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, nombre, email, rol, estado } = await req.json();

    if (!id || !nombre || !email) {
      return NextResponse.json(
        { message: 'ID, nombre y email son requeridos' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.usuarios.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo email ya existe en otro usuario
    if (email !== existingUser.email) {
      const emailExists = await prisma.usuarios.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: 'El email ya está en uso' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.usuarios.update({
      where: { id },
      data: {
        nombre,
        email,
        rol,
        estado: estado || existingUser.estado,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar usuario:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
