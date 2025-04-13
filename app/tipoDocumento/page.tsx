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

type TipoDocumento = {
  id: number;
  documento: string;
  estado: 'ACTIVO' | 'INACTIVO';
};

export default function TipoDocumentoPage() {
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState<Partial<TipoDocumento>>({
    documento: '',
    estado: 'ACTIVO',
  });
  const [editTipoDocumento, setEditTipoDocumento] = useState<Partial<TipoDocumento> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await fetch('/api/tipoDocumento');
        if (response.ok) {
          const data = await response.json();
          setTiposDocumento(data);
          toast.success('Tipos de documento cargados exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al obtener los tipos de documento');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchTiposDocumento();
  }, []);

  const handleCrearTipoDocumento = async () => {
    if (!nuevoTipoDocumento.documento) {
      toast.error('El documento es obligatorio');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/tipoDocumento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoTipoDocumento),
          });

          const data = await response.json();

          if (response.ok) {
            setTiposDocumento((prev) => [...prev, data]);
            setNuevoTipoDocumento({ documento: '', estado: 'ACTIVO' });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear el tipo de documento');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando tipo de documento...',
        success: 'Tipo de documento creado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const handleEditarTipoDocumento = async () => {
    if (!editTipoDocumento) return;

    if (!editTipoDocumento.documento) {
      toast.error('El documento es obligatorio');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/tipoDocumento', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editTipoDocumento),
          });

          const data = await response.json();

          if (response.ok) {
            setTiposDocumento((prev) =>
              prev.map((t) => (t.id === editTipoDocumento.id ? data : t))
            );
            setEditTipoDocumento(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar el tipo de documento');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando tipo de documento...',
        success: 'Tipo de documento actualizado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const filteredTiposDocumento = tiposDocumento.filter((tipo) =>
    tipo.documento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTiposDocumento = filteredTiposDocumento.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredTiposDocumento.length / itemsPerPage);

  //LOADER DE LA PAGINA TIPO DOCUMENTO
  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando Tipos de Documento...</p>
          </div>
        </div>
      </div>
    );
  }

  // TARJETA TOTAL DE TIPO DOCUMENTO
  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Tipo de Documento</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Documentos</span>
            <ChevronRight className="w-4 h-4" />
            <span>Tipo de Documento</span>
          </div>
        </div>

        {/* BOTON DIALOGO PARA CREAR UNA NUEVO TIPO DOCUMENTO */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4 font-semibold">
              <FilePlus2 /> Agregar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <SquarePen className="inline mr-2" />
                Registrar Documento
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <label className="text-sm font-medium">
                Documento
                <Input
                  placeholder="Nombre del documento"
                  value={nuevoTipoDocumento.documento || ''}
                  onChange={(e) =>
                    setNuevoTipoDocumento({
                      ...nuevoTipoDocumento,
                      documento: e.target.value,
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Estado
                <Select
                  defaultValue="ACTIVO"
                  onValueChange={(value) =>
                    setNuevoTipoDocumento({
                      ...nuevoTipoDocumento,
                      estado: value as 'ACTIVO' | 'INACTIVO',
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
                <Button className="font-semibold" onClick={handleCrearTipoDocumento}>
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
          placeholder="Buscar por nombre..."
          className="w-[300px] h-[32px] bg-muted max-w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/*TABLA TIPO DOCUMENTO EN PANTALLAS GRANDES DESKTOP*/}
      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-1">ID</TableHead>
              <TableHead className="py-1">Documento</TableHead>
              <TableHead className="py-1">Estado</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTiposDocumento.map((tipo) => (
              <TableRow className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50" key={tipo.id}>
                <TableCell>{tipo.id}</TableCell>
                <TableCell>{tipo.documento}</TableCell>
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
                  {/* BOTON DIALOGO PARA EDITAR TIPO DOCUMENTO */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setEditTipoDocumento(tipo)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          <FilePenLine className="inline mr-2" />
                          Editar Documento
                        </DialogTitle>
                      </DialogHeader>
                      {editTipoDocumento && (
                        <div className="grid gap-4">
                          <label className="text-sm font-medium">
                            Documento
                            <Input
                              placeholder="Nombre del documento"
                              value={editTipoDocumento.documento || ''}
                              onChange={(e) =>
                                setEditTipoDocumento({
                                  ...editTipoDocumento,
                                  documento: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Estado
                            <Select
                              defaultValue={editTipoDocumento.estado}
                              onValueChange={(value) =>
                                setEditTipoDocumento({
                                  ...editTipoDocumento,
                                  estado: value as 'ACTIVO' | 'INACTIVO',
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
                            <Button className="font-semibold" onClick={handleEditarTipoDocumento}>
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

      {/* PAGINACIÓN DE LA TABLA TIPO DOCUMENTO */}
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
