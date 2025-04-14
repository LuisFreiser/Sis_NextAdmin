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

type SerieComprobante = {
  id: number;
  tipo_comprobante_id: number;
  serie: string;
  correlativo_actual: number;
  estado: string | null;
  tipoComprobante: {
    codigo: string;
    nombre: string;
  };
};

type TipoComprobante = {
  id: number;
  codigo: string;
  nombre: string;
};

export default function SerieComprobantePage() {
  const [seriesComprobante, setSeriesComprobante] = useState<SerieComprobante[]>([]);
  const [tiposComprobante, setTiposComprobante] = useState<TipoComprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaSerieComprobante, setNuevaSerieComprobante] = useState<Partial<SerieComprobante>>({
    serie: '',
    correlativo_actual: 0,
    estado: 'ACTIVO',
  });
  const [editSerieComprobante, setEditSerieComprobante] =
    useState<Partial<SerieComprobante> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seriesResponse, tiposResponse] = await Promise.all([
          fetch('/api/serieComprobante'),
          fetch('/api/tipoComprobante'),
        ]);

        if (seriesResponse.ok && tiposResponse.ok) {
          const [seriesData, tiposData] = await Promise.all([
            seriesResponse.json(),
            tiposResponse.json(),
          ]);
          setSeriesComprobante(seriesData);
          setTiposComprobante(tiposData);
          toast.success('Datos cargados exitosamente');
        } else {
          toast.error('Error al obtener los datos');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCrearSerieComprobante = async () => {
    if (!nuevaSerieComprobante.tipo_comprobante_id || !nuevaSerieComprobante.serie) {
      toast.error('El tipo de comprobante y la serie son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/serieComprobante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaSerieComprobante),
          });

          const data = await response.json();

          if (response.ok) {
            setSeriesComprobante((prev) => [...prev, data]);
            setNuevaSerieComprobante({
              serie: '',
              correlativo_actual: 0,
              estado: 'ACTIVO',
            });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear la serie');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando serie de comprobante...',
        success: 'Serie de comprobante creada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const handleEditarSerieComprobante = async () => {
    if (!editSerieComprobante) return;

    if (!editSerieComprobante.tipo_comprobante_id || !editSerieComprobante.serie) {
      toast.error('El tipo de comprobante y la serie son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/serieComprobante', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editSerieComprobante),
          });

          const data = await response.json();

          if (response.ok) {
            setSeriesComprobante((prev) =>
              prev.map((s) => (s.id === editSerieComprobante.id ? data : s))
            );
            setEditSerieComprobante(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar la serie');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando serie de comprobante...',
        success: 'Serie de comprobante actualizada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const filteredSeriesComprobante = seriesComprobante.filter(
    (serie) =>
      serie.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serie.tipoComprobante.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSeriesComprobante = filteredSeriesComprobante.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredSeriesComprobante.length / itemsPerPage);

  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando Series de Comprobante...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Serie de Comprobante</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Documentos</span>
            <ChevronRight className="w-4 h-4" />
            <span>Serie de Comprobante</span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4 font-semibold">
              <FilePlus2 /> Agregar Series
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <SquarePen className="inline mr-2" />
                Registrar Serie
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <label className="text-sm font-medium">
                Tipo de Comprobante
                <Select
                  onValueChange={(value) =>
                    setNuevaSerieComprobante({
                      ...nuevaSerieComprobante,
                      tipo_comprobante_id: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposComprobante.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="text-sm font-medium">
                Serie
                <Input
                  placeholder="Serie (ej: F001)"
                  value={nuevaSerieComprobante.serie || ''}
                  onChange={(e) =>
                    setNuevaSerieComprobante({
                      ...nuevaSerieComprobante,
                      serie: e.target.value.toUpperCase(),
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Correlativo Actual
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={nuevaSerieComprobante.correlativo_actual || 0}
                  onChange={(e) =>
                    setNuevaSerieComprobante({
                      ...nuevaSerieComprobante,
                      correlativo_actual: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Estado
                <Select
                  defaultValue="ACTIVO"
                  onValueChange={(value) =>
                    setNuevaSerieComprobante({
                      ...nuevaSerieComprobante,
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
                <Button className="font-semibold" onClick={handleCrearSerieComprobante}>
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
          id="searchSerie"
          name="searchSerie"
          placeholder="Buscar por serie o tipo..."
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
              <TableHead className="py-1">Tipo Comprobante</TableHead>
              <TableHead className="py-1">Serie</TableHead>
              <TableHead className="py-1">Correlativo</TableHead>
              <TableHead className="py-1">Estado</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSeriesComprobante.map((serie) => (
              <TableRow key={serie.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                <TableCell>{serie.id}</TableCell>
                <TableCell>{serie.tipoComprobante.nombre}</TableCell>
                <TableCell>{serie.serie}</TableCell>
                <TableCell>{serie.correlativo_actual}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serie.estado === 'ACTIVO'
                        ? 'bg-green-600 text-gray-100'
                        : 'bg-gray-600 text-gray-100'
                    }`}
                  >
                    {serie.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setEditSerieComprobante(serie)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          <FilePenLine className="inline mr-2" />
                          Editar Serie
                        </DialogTitle>
                      </DialogHeader>
                      {editSerieComprobante && (
                        <div className="grid gap-4">
                          <label className="text-sm font-medium">
                            Tipo de Comprobante
                            <Select
                              defaultValue={editSerieComprobante.tipo_comprobante_id?.toString()}
                              onValueChange={(value) =>
                                setEditSerieComprobante({
                                  ...editSerieComprobante,
                                  tipo_comprobante_id: parseInt(value),
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {tiposComprobante.map((tipo) => (
                                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                    {tipo.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </label>
                          <label className="text-sm font-medium">
                            Serie
                            <Input
                              placeholder="Serie (ej: F001)"
                              value={editSerieComprobante.serie || ''}
                              onChange={(e) =>
                                setEditSerieComprobante({
                                  ...editSerieComprobante,
                                  serie: e.target.value.toUpperCase(),
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Correlativo Actual
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={editSerieComprobante.correlativo_actual || 0}
                              onChange={(e) =>
                                setEditSerieComprobante({
                                  ...editSerieComprobante,
                                  correlativo_actual: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Estado
                            <Select
                              defaultValue={editSerieComprobante.estado || 'ACTIVO'}
                              onValueChange={(value) =>
                                setEditSerieComprobante({
                                  ...editSerieComprobante,
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
                            <Button
                              className="font-semibold"
                              onClick={handleEditarSerieComprobante}
                            >
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
