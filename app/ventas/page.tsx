"use client";

import { useState, useEffect } from "react";
import { Pedido } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPedido, setEditPedido] = useState<Partial<Pedido> | null>(null);
  const [nuevoPedido, setNuevoPedido] = useState<Partial<Pedido>>({
    cliente: "",
    producto: "",
    cantidad: 0,
    precioUnitario: 0,
    estado: "Pendiente",
  });
  //Use State para el filtro de Productos en select
  const [productos, setProductos] = useState<string[]>([]);

  // FUNCION PARA CARGAR TODOS LOS PEDIDOS EN LA TABLA

  const fetchPedidos = async () => {
    try {
      const response = await fetch("/api/pedidos");
      const data = await response.json();
      setPedidos(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar pedidos");
      setLoading(false);
    }
  };

  // FUNCION PARA CREAR UN NUEVO PEDIDO

  const handleCrearPedido = async () => {
    // Validaciones
    if (!nuevoPedido.cliente || !nuevoPedido.producto) {
      toast.error("Cliente y producto son obligatorios");
      return;
    }
    try {
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPedido),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Pedido creado exitosamente");
        fetchPedidos();
        // Resetear el formulario de nuevo pedido
        setNuevoPedido({
          cliente: "",
          producto: "",
          cantidad: 0,
          precioUnitario: 0,
          estado: "Pendiente",
        });
      } else {
        // Maneja específicamente el error de stock insuficiente
        if (data.error === "Stock insuficiente") {
          toast.error("Stock insuficiente para este producto");
        } else {
          toast.error(data.error || "Error al crear el pedido");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el pedido");
    }
  };

  // FUNCION PARA EDITAR UN PEDIDO

  const handleEditarPedido = async () => {
    if (!editPedido) return;

    try {
      await fetch("/api/pedidos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPedido),
      });
      toast.success("Pedido actualizado");
      fetchPedidos();
      setEditPedido(null);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar pedido");
    }
  };

  // FUNCION PARA ELIMINAR UN PEDIDO X ID RUTA DE API ESTATICA

  const handleEliminarPedido = async (id: number) => {
    toast.custom(
      (t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-red-600 font-bold mb-4">
            ¿Estás seguro de que deseas eliminar este pedido?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                try {
                  const response = await fetch("/api/pedidos", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                  });

                  // Verificar el estado de la respuesta
                  if (!response.ok) {
                    // Intentar obtener el mensaje de error del servidor
                    const errorData = await response.json();
                    throw new Error(
                      errorData.error || "No se pudo eliminar el pedido"
                    );
                  }

                  const data = await response.json();

                  // Mensaje de éxito dependiendo de si se devolvió stock
                  if (data.devueltoAlStock) {
                    toast.success("Pedido eliminado. Stock actualizado.");
                  } else {
                    toast.success("Pedido eliminado");
                  }

                  // Actualizar la lista de pedidos
                  fetchPedidos();
                } catch (error) {
                  console.error("Error al eliminar pedido:", error);

                  // Manejo de errores más específico
                  if (error instanceof Error) {
                    toast.error(
                      error.message || "No se pudo eliminar el pedido"
                    );
                  } else {
                    toast.error(
                      "Ocurrió un error desconocido al eliminar el pedido"
                    );
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        className: "custom-toast-container",
      }
    );
  };

  useEffect(() => {
    // Lógica para cargar a select  productos desde la BD
    const fetchProductos = async () => {
      try {
        const response = await fetch("/api/productos");
        const data = await response.json();
        setProductos(data.map((p: { nombre: string }) => p.nombre));
      } catch (error) {
        console.error("Error al cargar productos", error);
      }
    };
    fetchProductos();
    fetchPedidos();
  }, []);

  //LLAMANDO AL LOADER (CAEGANDO PEDIDOS)

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        <p>Cargando Pedidos...</p>
      </div>
    );

  return (
    <div className="container mx-auto p-4 rounded-lg shadow-lg bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <h1 className="text-3xl font-bold mb-4">Pedidos</h1>

      {/* BOTON DIALOGO PARA CREAR UN NUEVO PEDIDO */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">Nuevo Pedido</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Cliente"
              value={nuevoPedido.cliente || ""}
              onChange={(e) =>
                setNuevoPedido({
                  ...nuevoPedido,
                  cliente: e.target.value,
                })
              }
            />
            <Select
              value={nuevoPedido.producto || ""}
              onValueChange={(value) =>
                setNuevoPedido({
                  ...nuevoPedido,
                  producto: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Producto" />
              </SelectTrigger>
              <SelectContent>
                {productos.map((producto) => (
                  <SelectItem key={producto} value={producto}>
                    {producto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Cantidad"
              value={nuevoPedido.cantidad || ""}
              onChange={(e) =>
                setNuevoPedido({
                  ...nuevoPedido,
                  cantidad: Number(e.target.value),
                })
              }
            />
            <Input
              type="number"
              placeholder="Precio Unitario"
              value={nuevoPedido.precioUnitario || ""}
              onChange={(e) =>
                setNuevoPedido({
                  ...nuevoPedido,
                  precioUnitario: Number(e.target.value),
                })
              }
            />
            <Select
              value={nuevoPedido.estado || ""}
              onValueChange={(value) =>
                setNuevoPedido({
                  ...nuevoPedido,
                  estado: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>
            <DialogClose asChild>
              <Button onClick={handleCrearPedido}>Crear Pedido</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* TABLA EN DESKTOP PANTALLAS GRANDES */}
      <div className="hidden md:block">
        <Table className="border">
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.cliente}</TableCell>
                <TableCell>{pedido.producto}</TableCell>
                <TableCell>{pedido.cantidad}</TableCell>
                <TableCell>{pedido.estado}</TableCell>
                <TableCell>S/. {pedido.precioTotal.toFixed(2)}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {/* BOTON DIALOGO PARA EDITAR UN PEDIDO */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setEditPedido(pedido)}
                      >
                        Editar
                      </Button>
                    </DialogTrigger>
                    <Button
                      variant="destructive"
                      onClick={() => handleEliminarPedido(pedido.id)}
                    >
                      Eliminar
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Pedido</DialogTitle>
                      </DialogHeader>
                      {editPedido && (
                        <div className="grid gap-4">
                          <Input
                            placeholder="Cliente"
                            value={editPedido.cliente || ""}
                            onChange={(e) =>
                              setEditPedido({
                                ...editPedido,
                                cliente: e.target.value,
                              })
                            }
                          />
                          <Input
                            placeholder="Producto"
                            value={editPedido.producto || ""}
                            onChange={(e) =>
                              setEditPedido({
                                ...editPedido,
                                producto: e.target.value,
                              })
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Cantidad"
                            value={editPedido.cantidad || ""}
                            onChange={(e) =>
                              setEditPedido({
                                ...editPedido,
                                cantidad: Number(e.target.value),
                              })
                            }
                          />
                          <Select
                            value={editPedido?.estado || "Pendiente"}
                            onValueChange={(value) =>
                              setEditPedido({
                                ...editPedido,
                                estado: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendiente">
                                Pendiente
                              </SelectItem>
                              <SelectItem value="Entregado">
                                Entregado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <DialogClose asChild>
                            <Button onClick={handleEditarPedido}>
                              Guardar Cambios
                            </Button>
                          </DialogClose>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* PARA TARJETAS EN MOVILES */}
      <div className="md:hidden grid gap-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="p-4 border rounded-lg bg-white shadow dark:bg-slate-800"
          >
            <h2 className="text-lg font-semibold mb-2">
              Pedido #{pedido.id} - {pedido.cliente}
            </h2>
            <p>
              <strong>Producto:</strong> {pedido.producto}
            </p>
            <p>
              <strong>Cantidad:</strong> {pedido.cantidad}
            </p>
            <p>
              <strong>Estado:</strong> {pedido.estado}
            </p>
            <p>
              <strong>Total:</strong> S/ {pedido.precioTotal}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {/* BOTON DIALOGO PARA EDITAR UN PEDIDO */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setEditPedido(pedido)}
                  >
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Pedido</DialogTitle>
                  </DialogHeader>
                  {editPedido && (
                    <div className="grid gap-4">
                      <Input
                        placeholder="Cliente"
                        value={editPedido.cliente || ""}
                        onChange={(e) =>
                          setEditPedido({
                            ...editPedido,
                            cliente: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Producto"
                        value={editPedido.producto || ""}
                        onChange={(e) =>
                          setEditPedido({
                            ...editPedido,
                            producto: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={editPedido.cantidad || ""}
                        onChange={(e) =>
                          setEditPedido({
                            ...editPedido,
                            cantidad: Number(e.target.value),
                          })
                        }
                      />
                      <Select
                        value={editPedido?.estado || "Pendiente"}
                        onValueChange={(value) =>
                          setEditPedido({
                            ...editPedido,
                            estado: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Entregado">Entregado</SelectItem>
                        </SelectContent>
                      </Select>
                      <DialogClose asChild>
                        <Button onClick={handleEditarPedido}>
                          Guardar Cambios
                        </Button>
                      </DialogClose>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                onClick={() => handleEliminarPedido(pedido.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
