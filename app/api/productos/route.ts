import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { saveImageFromBase64 } from '@/lib/imageUtils';

// GET: OBTENER TODOS LOS PRODUCTOS CON SU MARCA
export async function GET() {
  try {
    const productos = await prisma.productos.findMany({
      include: {
        marca: true,
      },
    });
    return NextResponse.json(productos, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener productos:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: CREAR UN NUEVO PRODUCTO
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.nombre || !data.codigo_prod || !data.marcaId) {
      return NextResponse.json(
        { message: 'Nombre, código de producto y marca son requeridos' },
        { status: 400 }
      );
    }

    // Validar que la marca existe
    const marcaExiste = await prisma.marca.findUnique({
      where: { id: data.marcaId },
    });

    if (!marcaExiste) {
      return NextResponse.json(
        { message: 'La marca especificada no existe' },
        { status: 400 }
      );
    }

    const newProducto = await prisma.productos.create({
      data: {
        ...data,
        estado: data.estado || 'ACTIVO',
        imagen: data.imagen || '/no-image.png',
      },
      include: {
        marca: true,
      },
    });

    return NextResponse.json(newProducto, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear producto:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT: ACTUALIZAR UN PRODUCTO EXISTENTE
export async function PUT(request: Request) {
  try {
    const producto = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, marca, categoria, presentacion, createdAt, ...productoData } = producto;

    // Manejar la imagen
    let imagePath = productoData.imagen;

    // Si la imagen es base64, guardarla en el sistema de archivos
    if (productoData.imagen && productoData.imagen.startsWith('data:image')) {
      imagePath = await saveImageFromBase64(productoData.imagen, Number(id));
    } else if (!productoData.imagen) {
      imagePath = '/no-image.png';
    }

    // Actualizar el producto con la nueva ruta de imagen
    const updatedProducto = await prisma.productos.update({
      where: { id: Number(id) },
      data: {
        ...productoData,
        imagen: imagePath,
      },
      include: {
        marca: true,
      },
    });

    return NextResponse.json(updatedProducto, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar producto:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
