"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Producto = {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  ultimaActualizacion: string;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    nombre: "",
    cantidad: 0,
    unidad: "",
  });
  const [editProducto, setEditProducto] = useState<Partial<Producto> | null>(
    null
  );

  //FUNCION PARA OBTENER TODOS LOS PRODUCTOS EN API RUTAS ESTATICAS

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("/api/productos");
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        } else {
          console.error("Error al obtener los productos");
        }
      } catch (error) {
        console.error("Error al conectar con la API", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  //FUNCION PARA CREAR PRODUCTOS EN API RUTAS ESTATICAS

  const handleCrearProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.cantidad) {
      toast.error("Nombre y cantidad son obligatorios");
      return;
    }

    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto),
      });

      if (response.ok) {
        toast.success("Producto creado exitosamente");
        const newProducto = await response.json();
        setProductos((prev) => [...prev, newProducto]);
        setNuevoProducto({ nombre: "", cantidad: 0, unidad: "" });
      } else {
        toast.error("Error al crear el producto");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el producto");
    }
  };

  //FUNCION PARA EDITAR PRODUCTOS X ID EN API RUTAS DINAMICAS

  const handleEditarProducto = async () => {
    if (!editProducto) return;

    try {
      await fetch(`/api/productos/${editProducto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProducto),
      });
      toast.success("Producto actualizado");
      setProductos((prev) =>
        prev.map((p) =>
          p.id === editProducto.id ? { ...p, ...editProducto } : p
        )
      );
      setEditProducto(null);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el producto");
    }
  };

  //FUNCION PARA ELIMINAR PRODUCTOS X ID EN API RUTAS DINAMICAS

  const handleDelete = async (id: number) => {
    toast.custom(
      (t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-red-600 font-bold mb-4">
            ¿Estás seguro de que deseas eliminar este producto?
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
                  const response = await fetch(`/api/productos/${id}`, {
                    method: "DELETE",
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                      errorData.error || "No se pudo eliminar el producto"
                    );
                  }

                  setProductos((prev) =>
                    prev.filter((producto) => producto.id !== id)
                  );
                  toast.success("Producto eliminado");
                } catch (error) {
                  console.error("Error al eliminar el producto", error);
                  toast.error("Error al eliminar el producto");
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

  // CARGANDO LOADER DE PRODUCTOS
  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        <p>Cargando Productos...</p>
      </div>
    );

  return (
    <div className="container mx-auto p-4 rounded-lg shadow-lg bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <h1 className="text-3xl font-bold mb-4">Productos</h1>

      {/* BOTON DIALOGO PARA CREAR UN NUEVO PRODUCTO */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">Agregar Producto</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Producto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Nombre"
              value={nuevoProducto.nombre || ""}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  nombre: e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Cantidad"
              value={nuevoProducto.cantidad || ""}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  cantidad: Number(e.target.value),
                })
              }
            />
            <Input
              placeholder="Unidad"
              value={nuevoProducto.unidad || ""}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  unidad: e.target.value,
                })
              }
            />
            <DialogClose asChild>
              <Button onClick={handleCrearProducto}>Crear Producto</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* TABLA EN PANTALLAS GRANDE DESKTOP */}
      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.id}</TableCell>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.cantidad}</TableCell>
                <TableCell>{producto.unidad}</TableCell>
                <TableCell>
                  {new Date(producto.ultimaActualizacion).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {/* BOTON DIALOGO PARA EDITAR UN PRODUCTO */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setEditProducto(producto)}
                      >
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Producto</DialogTitle>
                      </DialogHeader>
                      {editProducto && (
                        <div className="grid gap-4">
                          <Input
                            placeholder="Nombre"
                            value={editProducto.nombre || ""}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                nombre: e.target.value,
                              })
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Cantidad"
                            value={editProducto.cantidad || ""}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                cantidad: Number(e.target.value),
                              })
                            }
                          />
                          <Input
                            placeholder="Unidad"
                            value={editProducto.unidad || ""}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                unidad: e.target.value,
                              })
                            }
                          />
                          <DialogClose asChild>
                            <Button onClick={handleEditarProducto}>
                              Guardar Cambios
                            </Button>
                          </DialogClose>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(producto.id)}
                    className="ml-2"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* TARJETAS PARA PANTALLAS MOBILES */}
      <div className="md:hidden grid gap-4">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="p-4 border rounded-lg bg-white shadow dark:bg-slate-800"
          >
            <h2 className="text-lg font-semibold mb-2">{producto.nombre}</h2>
            <p>
              <strong>ID:</strong> {producto.id}
            </p>
            <p>
              <strong>Stock:</strong> {producto.cantidad}
            </p>
            <p>
              <strong>Unidad:</strong> {producto.unidad}
            </p>
            <p>
              <strong>Última Actualización:</strong>{" "}
              {new Date(producto.ultimaActualizacion).toLocaleDateString()}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {/* BOTON DIALOGO PARA EDITAR UN PRODUCTO */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setEditProducto(producto)}
                  >
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Producto</DialogTitle>
                  </DialogHeader>
                  {editProducto && (
                    <div className="grid gap-4">
                      <Input
                        placeholder="Nombre"
                        value={editProducto.nombre || ""}
                        onChange={(e) =>
                          setEditProducto({
                            ...editProducto,
                            nombre: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={editProducto.cantidad || ""}
                        onChange={(e) =>
                          setEditProducto({
                            ...editProducto,
                            cantidad: Number(e.target.value),
                          })
                        }
                      />
                      <Input
                        placeholder="Unidad"
                        value={editProducto.unidad || ""}
                        onChange={(e) =>
                          setEditProducto({
                            ...editProducto,
                            unidad: e.target.value,
                          })
                        }
                      />
                      <DialogClose asChild>
                        <Button onClick={handleEditarProducto}>
                          Guardar Cambios
                        </Button>
                      </DialogClose>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                onClick={() => handleDelete(producto.id)}
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
