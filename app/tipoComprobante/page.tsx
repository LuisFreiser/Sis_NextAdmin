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
import {
  Loader2,
  Home,
  ChevronRight,
  FilePlus2,
  FilePenLine,
  Search,
  SquarePen,
  Save,
} from 'lucide-react';
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

type TipoComprobante = {
  id: number;
  codigo: string;
  nombre: string;
  estado: string | null;
};

export default function TipoComprobantePage() {
  const [tiposComprobante, setTiposComprobante] = useState<TipoComprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoTipoComprobante, setNuevoTipoComprobante] = useState<Partial<TipoComprobante>>({
    codigo: '',
    nombre: '',
    estado: 'ACTIVO',
  });
  const [editTipoComprobante, setEditTipoComprobante] = useState<Partial<TipoComprobante> | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchTiposComprobante = async () => {
      try {
        const response = await fetch('/api/tipoComprobante');
        if (response.ok) {
          const data = await response.json();
          setTiposComprobante(data);
          toast.success('Tipos de comprobante cargados exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al obtener los tipos de comprobante');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchTiposComprobante();
  }, []);

  const handleCrearTipoComprobante = async () => {
    if (!nuevoTipoComprobante.codigo || !nuevoTipoComprobante.nombre) {
      toast.error('El código y nombre son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/tipoComprobante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoTipoComprobante),
          });

          const data = await response.json();

          if (response.ok) {
            setTiposComprobante((prev) => [...prev, data]);
            setNuevoTipoComprobante({ codigo: '', nombre: '', estado: 'ACTIVO' });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear el tipo de comprobante');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando tipo de comprobante...',
        success: 'Tipo de comprobante creado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const handleEditarTipoComprobante = async () => {
    if (!editTipoComprobante) return;

    if (!editTipoComprobante.codigo || !editTipoComprobante.nombre) {
      toast.error('El código y nombre son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/tipoComprobante', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editTipoComprobante),
          });

          const data = await response.json();

          if (response.ok) {
            setTiposComprobante((prev) =>
              prev.map((t) => (t.id === editTipoComprobante.id ? data : t))
            );
            setEditTipoComprobante(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar el tipo de comprobante');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando tipo de comprobante...',
        success: 'Tipo de comprobante actualizado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const filteredTiposComprobante = tiposComprobante.filter(
    (tipo) =>
      tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTiposComprobante = filteredTiposComprobante.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredTiposComprobante.length / itemsPerPage);

  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando Tipos de Comprobante...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Tipo de Comprobante</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Documentos</span>
            <ChevronRight className="w-4 h-4" />
            <span>Tipo de Comprobante</span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4 font-semibold">
              <FilePlus2 /> Agregar Comprobante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <SquarePen className="inline mr-2" />
                Registrar Comprobante
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <label className="text-sm font-medium">
                Código
                <Input
                  placeholder="Código del comprobante"
                  value={nuevoTipoComprobante.codigo || ''}
                  onChange={(e) =>
                    setNuevoTipoComprobante({
                      ...nuevoTipoComprobante,
                      codigo: e.target.value,
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Nombre
                <Input
                  placeholder="Nombre del comprobante"
                  value={nuevoTipoComprobante.nombre || ''}
                  onChange={(e) =>
                    setNuevoTipoComprobante({
                      ...nuevoTipoComprobante,
                      nombre: e.target.value,
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Estado
                <Select
                  defaultValue="ACTIVO"
                  onValueChange={(value) =>
                    setNuevoTipoComprobante({
                      ...nuevoTipoComprobante,
                      estado: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                    <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <DialogClose asChild>
                <Button className="font-semibold" onClick={handleCrearTipoComprobante}>
                  <Save />
                  GUARDAR
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 mb-4">
        <Input
          type="search"
          id="searchComprobante"
          name="searchComprobante"
          placeholder="Buscar por código o nombre..."
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
            <TableRow>
              <TableHead className="py-1">ID</TableHead>
              <TableHead className="py-1">Código</TableHead>
              <TableHead className="py-1">Nombre</TableHead>
              <TableHead className="py-1">Estado</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTiposComprobante.map((tipo) => (
              <TableRow
                key={tipo.id}
                className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
              >
                <TableCell>{tipo.id}</TableCell>
                <TableCell>{tipo.codigo}</TableCell>
                <TableCell>{tipo.nombre}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tipo.estado === 'ACTIVO'
                        ? 'bg-green-600 text-gray-100'
                        : 'bg-gray-600 text-gray-100'
                    }`}
                  >
                    {tipo.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setEditTipoComprobante(tipo)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          <FilePenLine className="inline mr-2" />
                          Editar Comprobante
                        </DialogTitle>
                      </DialogHeader>
                      {editTipoComprobante && (
                        <div className="grid gap-4">
                          <label className="text-sm font-medium">
                            Código
                            <Input
                              placeholder="Código del comprobante"
                              value={editTipoComprobante.codigo || ''}
                              onChange={(e) =>
                                setEditTipoComprobante({
                                  ...editTipoComprobante,
                                  codigo: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Nombre
                            <Input
                              placeholder="Nombre del comprobante"
                              value={editTipoComprobante.nombre || ''}
                              onChange={(e) =>
                                setEditTipoComprobante({
                                  ...editTipoComprobante,
                                  nombre: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Estado
                            <Select
                              defaultValue={editTipoComprobante.estado || 'ACTIVO'}
                              onValueChange={(value) =>
                                setEditTipoComprobante({
                                  ...editTipoComprobante,
                                  estado: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                                <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                          <DialogClose asChild>
                            <Button className="font-semibold" onClick={handleEditarTipoComprobante}>
                              <Save />
                              GUARDAR CAMBIOS
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

      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  isActive={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}