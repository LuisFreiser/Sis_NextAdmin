import { prisma } from '@/lib/prisma';
import { DetalleCompras } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

//FUNCION PARA OBTENER TODAS LAS COMPRAS
export async function GET() {
  try {
    const compras = await prisma.compras.findMany({
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
            nro_documento: true,
          },
        },
        tipoComprobante: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        detalleCompras: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        fecha_compra: 'desc',
      },
    });
    return NextResponse.json(compras, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener compras:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

//FUNCION PARA CREAR UNA COMPRA Y SUS DETALLES
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { detalleCompras, ...compraData } = data;

    // Validar datos requeridos
    if (!compraData.proveedorId || !compraData.tipo_comprobante_id || !compraData.nro_comprobante) {
      return NextResponse.json(
        { message: 'Proveedor, tipo de comprobante y número son requeridos' },
        { status: 400 }
      );
    }

    // Crear la compra y sus detalles en una transacción
    const nuevaCompra = await prisma.$transaction(async (prisma) => {
      // Crear la compra
      const compra = await prisma.compras.create({
        data: {
          ...compraData,
          detalleCompras: {
            create: detalleCompras.map((detalle: DetalleCompras) => ({
              productoId: detalle.productoId,
              lote_productoId: detalle.lote_productoId,
              cantidad: detalle.cantidad,
              precio_compra: detalle.precio_compra,
            })),
          },
        },
        include: {
          proveedor: {
            select: {
              id: true,
              nombre: true,
              nro_documento: true,
            },
          },
          tipoComprobante: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          detalleCompras: {
            include: {
              producto: true,
            },
          },
        },
      });

      // ACTUALIZAR EL STOCK DE LOS PRODUCTOS
      for (const detalle of detalleCompras) {
        await prisma.productos.update({
          where: { id: detalle.productoId },
          data: {
            stock_cajas: {
              increment: detalle.cantidad,
            },
          },
        });
      }

      return compra;
    });

    return NextResponse.json(nuevaCompra, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear compra:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

//FUNCION PUT PARA ACTUALIZAR UNA COMPRA
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, detalleCompras, ...compraData } = data;

    if (!id) {
      return NextResponse.json({ message: 'ID de compra es requerido' }, { status: 400 });
    }

    // Actualizar la compra y sus detalles en una transacción
    const compraActualizada = await prisma.$transaction(async (prisma) => {
      // Obtener detalles actuales para revertir el stock
      const compraActual = await prisma.compras.findUnique({
        where: { id },
        include: {
          detalleCompras: true,
        },
      });

      if (!compraActual) {
        throw new Error('Compra no encontrada');
      }

      // REVERTIR EL STOCK ANTERIOR
      for (const detalle of compraActual.detalleCompras) {
        await prisma.productos.update({
          where: { id: detalle.productoId },
          data: {
            stock_cajas: {
              decrement: detalle.cantidad,
            },
          },
        });
      }

      // ELIMINAR DETALLES ANTERIORES
      await prisma.detalleCompras.deleteMany({
        where: { compraId: id },
      });

      // ACTUALIZAR LA COMPRA Y SUS DETALLES
      const compra = await prisma.compras.update({
        where: { id },
        data: {
          ...compraData,
          detalleCompras: {
            create: detalleCompras.map((detalle: DetalleCompras) => ({
              productoId: detalle.productoId,
              lote_productoId: detalle.lote_productoId,
              cantidad: detalle.cantidad,
              precio_compra: detalle.precio_compra,
            })),
          },
        },
        include: {
          proveedor: {
            select: {
              id: true,
              nombre: true,
              nro_documento: true,
            },
          },
          tipoComprobante: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          detalleCompras: {
            include: {
              producto: true,
            },
          },
        },
      });

      // ACTUALIZAR EL STOCK CON EL NUEVO DETALLE
      for (const detalle of detalleCompras) {
        await prisma.productos.update({
          where: { id: detalle.productoId },
          data: {
            stock_cajas: {
              increment: detalle.cantidad,
            },
          },
        });
      }

      return compra;
    });

    return NextResponse.json(compraActualizada, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar compra:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

//FUNCION PATCH PARA ACTUALIZAR EL ESTADO DE UNA COMPRA
export async function PATCH(req: NextRequest) {
  try {
    const { id, estado } = await req.json();

    if (!id || !estado) {
      return NextResponse.json({ message: 'ID y estado son requeridos' }, { status: 400 });
    }

    const compraActualizada = await prisma.compras.update({
      where: { id },
      data: { estado },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
            nro_documento: true,
          },
        },
        tipoComprobante: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        detalleCompras: {
          include: {
            producto: true,
          },
        },
      },
    });

    return NextResponse.json(compraActualizada, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar estado de compra:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
