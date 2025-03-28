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

type Presentacion = {
  id: number;
  nombre: string;
  siglas: string;
  estado: 'VIGENTE' | 'DESCONTINUADO';
};

export default function PresentacionPage() {
  const [presentaciones, setPresentaciones] = useState<Presentacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaPresentacion, setNuevaPresentacion] = useState<Partial<Presentacion>>({
    nombre: '',
    siglas: '',
    estado: 'VIGENTE',
  });
  const [editPresentacion, setEditPresentacion] = useState<Partial<Presentacion> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPresentaciones = async () => {
      try {
        const response = await fetch('/api/presentacion');
        if (response.ok) {
          const data = await response.json();
          setPresentaciones(data);
          toast.success('Presentaciones cargadas exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al obtener las presentaciones');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentaciones();
  }, []);

  const handleCrearPresentacion = async () => {
    if (!nuevaPresentacion.nombre || !nuevaPresentacion.siglas) {
      toast.error('El nombre y las siglas son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/presentacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaPresentacion),
          });

          const data = await response.json();

          if (response.ok) {
            setPresentaciones((prev) => [...prev, data]);
            setNuevaPresentacion({ nombre: '', siglas: '', estado: 'VIGENTE' });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear la presentación');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando presentación...',
        success: 'Presentación creada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const handleEditarPresentacion = async () => {
    if (!editPresentacion) return;

    if (!editPresentacion.nombre || !editPresentacion.siglas) {
      toast.error('El nombre y las siglas son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/presentacion', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editPresentacion),
          });

          const data = await response.json();

          if (response.ok) {
            setPresentaciones((prev) => prev.map((p) => (p.id === editPresentacion.id ? data : p)));
            setEditPresentacion(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar la presentación');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando presentación...',
        success: 'Presentación actualizada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // Filtrado de presentaciones
  const filteredPresentaciones = presentaciones.filter(
    (presentacion) =>
      presentacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presentacion.siglas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const paginatedPresentaciones = filteredPresentaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredPresentaciones.length / itemsPerPage);

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        <p>Cargando Presentaciones...</p>
      </div>
    );

  return (
    <div className="container mx-auto p-4 rounded-lg shadow-lg bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Presentación</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Almacen</span>
            <ChevronRight className="w-4 h-4" />
            <span>Presentación</span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <FilePlus2 /> Agregar Presentación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Presentación</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <Input
                placeholder="Nombre"
                value={nuevaPresentacion.nombre || ''}
                onChange={(e) =>
                  setNuevaPresentacion({
                    ...nuevaPresentacion,
                    nombre: e.target.value,
                  })
                }
              />

              <Input
                placeholder="Siglas"
                value={nuevaPresentacion.siglas || ''}
                onChange={(e) =>
                  setNuevaPresentacion({
                    ...nuevaPresentacion,
                    siglas: e.target.value,
                  })
                }
              />

              <Select
                onValueChange={(value) =>
                  setNuevaPresentacion({
                    ...nuevaPresentacion,
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
                <Button onClick={handleCrearPresentacion}>Crear Presentación</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 mb-4">
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-[300px] h-[32px] bg-muted max-w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow className="h-8 bg-slate-100">
              <TableHead className="py-1">ID</TableHead>
              <TableHead className="py-1">Nombre</TableHead>
              <TableHead className="py-1">Siglas</TableHead>
              <TableHead className="py-1">Estado</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPresentaciones.map((presentacion) => (
              <TableRow key={presentacion.id} className="h-8">
                <TableCell className="py-1">{presentacion.id}</TableCell>
                <TableCell className="py-1">{presentacion.nombre}</TableCell>
                <TableCell className="py-1">{presentacion.siglas}</TableCell>
                <TableCell className="py-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      presentacion.estado === 'VIGENTE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {presentacion.estado}
                  </span>
                </TableCell>
                <TableCell className="py-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        title="Editar Presentación"
                        onClick={() => setEditPresentacion(presentacion)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Presentación</DialogTitle>
                      </DialogHeader>
                      {editPresentacion && (
                        <div className="grid gap-4">
                          <Input
                            placeholder="Nombre"
                            value={editPresentacion.nombre || ''}
                            onChange={(e) =>
                              setEditPresentacion({
                                ...editPresentacion,
                                nombre: e.target.value,
                              })
                            }
                          />

                          <Input
                            placeholder="Siglas"
                            value={editPresentacion.siglas || ''}
                            onChange={(e) =>
                              setEditPresentacion({
                                ...editPresentacion,
                                siglas: e.target.value,
                              })
                            }
                          />

                          <Select
                            defaultValue={editPresentacion.estado}
                            onValueChange={(value) =>
                              setEditPresentacion({
                                ...editPresentacion,
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
                            <Button onClick={handleEditarPresentacion}>Guardar Cambios</Button>
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

      <div className="md:hidden grid gap-4">
        {filteredPresentaciones.map((presentacion) => (
          <div
            key={presentacion.id}
            className="p-4 border rounded-lg bg-white shadow dark:bg-slate-800"
          >
            <h2 className="text-lg font-semibold mb-2">{presentacion.nombre}</h2>
            <p>
              <strong>ID:</strong> {presentacion.id}
            </p>
            <p>
              <strong>Siglas:</strong> {presentacion.siglas}
            </p>
            <p>
              <strong>Estado:</strong>{' '}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  presentacion.estado === 'VIGENTE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {presentacion.estado}
              </span>
            </p>
            <div className="mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Editar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Presentación</DialogTitle>
                  </DialogHeader>
                  {editPresentacion && (
                    <div className="grid gap-4">
                      <Input
                        placeholder="Nombre"
                        value={editPresentacion.nombre || ''}
                        onChange={(e) =>
                          setEditPresentacion({
                            ...editPresentacion,
                            nombre: e.target.value,
                          })
                        }
                      />

                      <Input
                        placeholder="Siglas"
                        value={editPresentacion.siglas || ''}
                        onChange={(e) =>
                          setEditPresentacion({
                            ...editPresentacion,
                            siglas: e.target.value,
                          })
                        }
                      />

                      <Select
                        defaultValue={editPresentacion.estado}
                        onValueChange={(value) =>
                          setEditPresentacion({
                            ...editPresentacion,
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
                        <Button onClick={handleEditarPresentacion}>Guardar Cambios</Button>
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
