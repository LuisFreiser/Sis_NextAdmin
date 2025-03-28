'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Home, ChevronRight, FilePlus2, FilePenLine, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type Categoria = {
  id: number;
  nombre: string;
  estado: 'VIGENTE' | 'DESCONTINUADO'; // Define el tipo 'estado' como un string literal
};

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaCategoria, setNuevaCategoria] = useState<Partial<Categoria>>({
    nombre: '',
    estado: 'VIGENTE',
  });
  const [editCategoria, setEditCategoria] = useState<Partial<Categoria> | null>(null);

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // FUNCION PARA OBTENER TODAS LAS CATEGORIAS EN API RUTAS ESTATICAS
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('/api/categorias');
        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
          toast.success('Categorías cargadas exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al obtener las categorías');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  // FUNCION PARA CREAR CATEGORIAS EN API RUTAS ESTATICAS
  const handleCrearCategoria = async () => {
    if (!nuevaCategoria.nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCategoria),
          });

          const data = await response.json();

          if (response.ok) {
            setCategorias((prev) => [...prev, data]);
            setNuevaCategoria({ nombre: '', estado: 'VIGENTE' });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear la categoría');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando categoría...',
        success: 'Categoría creada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA EDITAR CATEGORIAS EN API RUTAS ESTATICAS
  const handleEditarCategoria = async () => {
    if (!editCategoria) return;

    if (!editCategoria.nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/categorias', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editCategoria),
          });

          const data = await response.json();

          if (response.ok) {
            setCategorias((prev) => prev.map((c) => (c.id === editCategoria.id ? data : c)));
            setEditCategoria(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar la categoría');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando categoría...',
        success: 'Categoría actualizada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA FILTRAR CATEGORIAS
  const filteredCategorias = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const paginatedCategorias = filteredCategorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);

  // CARGANDO LOADER DE CATEGORIAS
  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        <p>Cargando Categorias...</p>
      </div>
    );

  return (
    <div className="container mx-auto p-4 rounded-lg shadow-lg bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Categorias</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Almacen</span>
            <ChevronRight className="w-4 h-4" />
            <span>Categorias</span>
          </div>
        </div>

        {/* BOTON DIALOGO PARA CREAR UNA NUEVA CATEGORIA */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4">
              {' '}
              <FilePlus2 /> Agregar Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoria</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <Input
                placeholder="Nombre"
                value={nuevaCategoria.nombre || ''}
                onChange={(e) =>
                  setNuevaCategoria({
                    ...nuevaCategoria,
                    nombre: e.target.value,
                  })
                }
              />

              <Select
                onValueChange={(value) =>
                  setNuevaCategoria({
                    ...nuevaCategoria,
                    estado: value as 'VIGENTE' | 'DESCONTINUADO',
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estado" defaultValue="VIGENTE" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIGENTE">VIGENTE</SelectItem>
                  <SelectItem value="DESCONTINUADO">DESCONTINUADO</SelectItem>
                </SelectContent>
              </Select>

              <DialogClose asChild>
                <Button onClick={handleCrearCategoria}>Crear Categoria</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* BOTON INPUT PARA BUSCAR CATEGORIAS */}
      <div className="flex-1 mb-4">
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-[300px] h-[32px] bg-muted max-w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA EN PANTALLAS GRANDE DESKTOP */}
      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow className="h-8 bg-slate-100">
              <TableHead className="py-1">ID</TableHead>
              <TableHead className="py-1">Nombre</TableHead>
              <TableHead className="py-1">Estado</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategorias.map((categoria) => (
              <TableRow key={categoria.id} className="h-8">
                <TableCell className="py-1">{categoria.id}</TableCell>
                <TableCell className="py-1">{categoria.nombre}</TableCell>
                <TableCell className="py-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      categoria.estado === 'VIGENTE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {categoria.estado}
                  </span>
                </TableCell>
                <TableCell className="py-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        title="Editar Categoria"
                        onClick={() => setEditCategoria(categoria)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Categoria</DialogTitle>
                      </DialogHeader>
                      {editCategoria && (
                        <div className="grid gap-4">
                          <Input
                            placeholder="Nombre"
                            value={editCategoria.nombre || ''}
                            onChange={(e) =>
                              setEditCategoria({
                                ...editCategoria,
                                nombre: e.target.value,
                              })
                            }
                          />

                          <Select
                            defaultValue={editCategoria.estado}
                            onValueChange={(value) =>
                              setEditCategoria({
                                ...editCategoria,
                                estado: value as 'VIGENTE' | 'DESCONTINUADO',
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VIGENTE">VIGENTE</SelectItem>
                              <SelectItem value="DESCONTINUADO">DESCONTINUADO</SelectItem>
                            </SelectContent>
                          </Select>

                          <DialogClose asChild>
                            <Button onClick={handleEditarCategoria}>Guardar Cambios</Button>
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

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                />
              </PaginationItem>

              {totalPages > 0 &&
                [...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index + 1}>
                    <PaginationLink
                      isActive={currentPage === index + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(index + 1);
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              <PaginationItem>
                <PaginationNext
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* TARJETAS PARA PANTALLAS MOBILES */}
      <div className="md:hidden grid gap-4">
        {filteredCategorias.map((categoria) => (
          <div
            key={categoria.id}
            className="p-4 border rounded-lg bg-white shadow dark:bg-slate-800"
          >
            <h2 className="text-lg font-semibold mb-2">{categoria.nombre}</h2>
            <p>
              <strong>ID:</strong> {categoria.id}
            </p>
            <p>
              <strong>Estado:</strong>{' '}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  categoria.estado === 'VIGENTE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {categoria.estado}
              </span>
            </p>
            <div className="mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Editar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Categoria</DialogTitle>
                  </DialogHeader>
                  {editCategoria && (
                    <div className="grid gap-4">
                      <Input
                        placeholder="Nombre"
                        value={editCategoria.nombre || ''}
                        onChange={(e) =>
                          setEditCategoria({
                            ...editCategoria,
                            nombre: e.target.value,
                          })
                        }
                      />

                      <Select
                        defaultValue={editCategoria.estado}
                        onValueChange={(value) =>
                          setEditCategoria({
                            ...editCategoria,
                            estado: value as 'VIGENTE' | 'DESCONTINUADO',
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIGENTE">VIGENTE</SelectItem>
                          <SelectItem value="DESCONTINUADO">DESCONTINUADO</SelectItem>
                        </SelectContent>
                      </Select>

                      <DialogClose asChild>
                        <Button onClick={handleEditarCategoria}>Guardar Cambios</Button>
                      </DialogClose>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
