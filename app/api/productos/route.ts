import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { saveImageFromBase64 } from '@/lib/imageUtils';

// GET: OBTENER TODOS LOS PRODUCTOS CON SU MARCA, CATEGORIA Y PRESENTACION
export async function GET() {
  try {
    const productos = await prisma.productos.findMany({
      include: {
        marca: true,
        presentacion: true,
        categoria: true,
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

    if (!data.nombre || !data.codigo_prod) {
      return NextResponse.json(
        { message: 'Nombre y código de producto son requeridos' },
        { status: 400 }
      );
    }

    // Si no hay imagen, usar la imagen por defecto
    let imagePath = '/no-image.png';

    // Crear primero el producto para obtener el ID
    const newProducto = await prisma.productos.create({
      data: {
        ...data,
        imagen: imagePath, // Inicialmente con imagen por defecto
      },
      include: {
        marca: true,
        presentacion: true,
        categoria: true,
      },
    });

    // Si hay una imagen en base64, guardarla y actualizar el producto
    if (data.imagen && data.imagen.startsWith('data:image')) {
      imagePath = await saveImageFromBase64(data.imagen, newProducto.id);

      // Actualizar el producto con la ruta de la imagen
      const updatedProducto = await prisma.productos.update({
        where: { id: newProducto.id },
        data: { imagen: imagePath },
        include: {
          marca: true,
          presentacion: true,
          categoria: true,
        },
      });

      return NextResponse.json(updatedProducto, { status: 201 });
    }

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
        presentacion: true,
        categoria: true,
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
