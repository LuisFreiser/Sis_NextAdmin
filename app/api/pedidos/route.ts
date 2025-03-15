//USANDO RUTAS DE API ESTATICAS DE NEXT

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

//POST PARA CREAR UN NUEVO PEDIDO

export async function POST(request: NextRequest) {
  try {
    const {
      cliente,
      producto,
      cantidad,
      precioUnitario,
      estado = "Pendiente",
    } = await request.json();

    // Primero, verificar si hay suficiente stock
    const productoExistente = await prisma.producto.findFirst({
      where: { nombre: producto },
    });

    if (!productoExistente) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (productoExistente.cantidad < cantidad) {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    // Calcular precio total
    const precioTotal = Number(cantidad) * Number(precioUnitario);

    // Crear pedido y actualizar stock en una transacción
    const resultado = await prisma.$transaction(async (prisma) => {
      // Crear pedido
      const nuevoPedido = await prisma.pedido.create({
        data: {
          cliente,
          producto,
          cantidad: Number(cantidad),
          precioUnitario: Number(precioUnitario),
          precioTotal,
          estado,
        },
      });

      // Actualizar stock del producto
      await prisma.producto.update({
        where: { id: productoExistente.id },
        data: {
          cantidad: productoExistente.cantidad - cantidad,
          ultimaActualizacion: new Date(),
        },
      });

      return nuevoPedido;
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear pedido" },
      { status: 500 }
    );
  }
}

//GET PARA OBTENER TODOS LOS PEDIDOS

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany();
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

// PUT PARA ACTUALIZAR UN PEDIDO

export async function PUT(request: NextRequest) {
  try {
    const { id, cliente, producto, cantidad, precioUnitario, estado } =
      await request.json();

    // Calcular precio total
    const precioTotal = cantidad * precioUnitario;

    const pedidoActualizado = await prisma.pedido.update({
      where: { id },
      data: {
        cliente,
        producto,
        cantidad,
        precioUnitario,
        precioTotal,
        estado,
      },
    });

    return NextResponse.json(pedidoActualizado);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar pedido" },
      { status: 500 }
    );
  }
}

// DELETE PARA ELIMINAR UN PEDIDO

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    // Validar que el ID sea un número válido
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de pedido inválido" },
        { status: 400 }
      );
    }

    // Realizar la eliminación del pedido en una transacción
    const resultado = await prisma.$transaction(async (prisma) => {
      // Primero, buscar los detalles del pedido
      const pedido = await prisma.pedido.findUnique({
        where: { id: Number(id) },
        select: {
          estado: true,
          producto: true,
          cantidad: true,
        },
      });

      // Si no se encuentra el pedido, lanzar un error específico
      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      // Solo actualizar stock si el pedido está pendiente
      if (pedido.estado === "Pendiente") {
        // Encontrar el producto
        const producto = await prisma.producto.findFirst({
          where: { nombre: pedido.producto },
        });

        if (!producto) {
          throw new Error(`Producto "${pedido.producto}" no encontrado`);
        }

        // Actualizar el stock del producto
        await prisma.producto.update({
          where: { id: producto.id },
          data: {
            cantidad: producto.cantidad + pedido.cantidad,
            ultimaActualizacion: new Date(),
          },
        });
      }

      // Eliminar el pedido
      return prisma.pedido.delete({
        where: { id: Number(id) },
      });
    });

    return NextResponse.json(
      {
        message: "Pedido eliminado exitosamente",
        devueltoAlStock: resultado.estado === "Pendiente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error detallado al eliminar pedido:", error);

    // Manejo de errores más específico
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message || "Error al eliminar pedido",
          details: error.toString(),
        },
        { status: 500 }
      );
    }

    // Caso genérico para errores no identificados
    return NextResponse.json(
      {
        error: "Error desconocido al eliminar pedido",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
