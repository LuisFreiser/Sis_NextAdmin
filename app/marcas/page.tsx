'use client';

import { useEffect, useState } from 'react';
//IMPORTO LAS LIBRERIAS DE JSPDF Y AUTOTABLE PARA IMPRIMIR REPORTES
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
import { Loader2, Home, ChevronRight, FilePlus2, FilePenLine, Search, Printer } from 'lucide-react';
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

type Marca = {
  id: number;
  nombre: string;
  estado: 'VIGENTE' | 'DESCONTINUADO';
};

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaMarca, setNuevaMarca] = useState<Partial<Marca>>({
    nombre: '',
    estado: 'VIGENTE',
  });
  const [editMarca, setEditMarca] = useState<Partial<Marca> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ESTADOS PARA PAGINACION DE MARCAS
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // FUNCION PARA OBTENER TODAS LAS MARCAS
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await fetch('/api/marcas');
        if (response.ok) {
          const data = await response.json();
          setMarcas(data);
          toast.success('Marcas cargadas exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al obtener las marcas');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  // FUNCION PARA CREAR MARCAS
  const handleCrearMarca = async () => {
    if (!nuevaMarca.nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/marcas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaMarca),
          });

          const data = await response.json();

          if (response.ok) {
            setMarcas((prev) => [...prev, data]);
            setNuevaMarca({ nombre: '', estado: 'VIGENTE' });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear la marca');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando marca...',
        success: 'Marca creada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA EDITAR MARCAS
  const handleEditarMarca = async () => {
    if (!editMarca) return;

    if (!editMarca.nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/marcas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editMarca),
          });

          const data = await response.json();

          if (response.ok) {
            setMarcas((prev) => prev.map((m) => (m.id === editMarca.id ? data : m)));
            setEditMarca(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar la marca');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando marca...',
        success: 'Marca actualizada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA FILTRAR MARCAS
  const filteredMarcas = marcas.filter((marca) =>
    marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // FUNCION PARA LA PAGINACION DE MARCAS
  const paginatedMarcas = filteredMarcas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredMarcas.length / itemsPerPage);

  // LOADER DE MARCAS
  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        <p>Cargando Marcas...</p>
      </div>
    );

  // FUNCION PARA IMPRIMIR REPORTE DE MARCAS
  const handleImprimirReporte = () => {
    const doc = new jsPDF();

    // Configurar el título
    doc.setFontSize(20);
    doc.text('Reporte de Marcas', 75, 22);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

    // Preparar los datos para la tabla
    const tableRows = marcas.map((marca) => [marca.id, marca.nombre, marca.estado]);

    // Generar la tabla
    autoTable(doc, {
      head: [['ID', 'Nombre', 'Estado']],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
    });

    // Guardar el PDF
    doc.save('reporte-marcas.pdf');
    toast.success('Reporte generado exitosamente');
  };

  return (
    <div className="container mx-auto p-4 rounded-lg shadow-lg bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Marcas</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Almacen</span>
            <ChevronRight className="w-4 h-4" />
            <span>Marcas</span>
          </div>
        </div>

        {/* BOTON DIALOGO PARA CREAR UNA NUEVA  */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4">
                <FilePlus2 /> Agregar Marca
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Marca</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <Input
                  placeholder="Nombre"
                  value={nuevaMarca.nombre || ''}
                  onChange={(e) =>
                    setNuevaMarca({
                      ...nuevaMarca,
                      nombre: e.target.value,
                    })
                  }
                />

                <Select
                  onValueChange={(value) =>
                    setNuevaMarca({
                      ...nuevaMarca,
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
                  <Button onClick={handleCrearMarca}>Crear Marca</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="mb-4" onClick={handleImprimirReporte}>
            <Printer />
            Imprimir Reporte
          </Button>
        </div>
      </div>

      {/* BOTON INPUT PARA BUSCAR MARCAS */}
      <div className="flex-1 mb-4">
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-[300px] h-[32px] bg-muted max-w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Restablece la página actual al filtrar
          }}
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
            {paginatedMarcas.map((marca) => (
              <TableRow key={marca.id} className="h-8">
                <TableCell className="py-1">{marca.id}</TableCell>
                <TableCell className="py-1">{marca.nombre}</TableCell>
                <TableCell className="py-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      marca.estado === 'VIGENTE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {marca.estado}
                  </span>
                </TableCell>
                <TableCell className="py-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        title="Editar Marca"
                        onClick={() => setEditMarca(marca)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Marca</DialogTitle>
                      </DialogHeader>
                      {editMarca && (
                        <div className="grid gap-4">
                          <Input
                            placeholder="Nombre"
                            value={editMarca.nombre || ''}
                            onChange={(e) =>
                              setEditMarca({
                                ...editMarca,
                                nombre: e.target.value,
                              })
                            }
                          />

                          <Select
                            defaultValue={editMarca.estado}
                            onValueChange={(value) =>
                              setEditMarca({
                                ...editMarca,
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
                            <Button onClick={handleEditarMarca}>Guardar Cambios</Button>
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

        {/* PAGINACIÓN DE LA TABLA */}
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
        {filteredMarcas.map((marca) => (
          <div key={marca.id} className="p-4 border rounded-lg bg-white shadow dark:bg-slate-800">
            <h2 className="text-lg font-semibold mb-2">{marca.nombre}</h2>
            <p>
              <strong>ID:</strong> {marca.id}
            </p>
            <p>
              <strong>Estado:</strong>{' '}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  marca.estado === 'VIGENTE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {marca.estado}
              </span>
            </p>
            <div className="mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Editar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Marca</DialogTitle>
                  </DialogHeader>
                  {editMarca && (
                    <div className="grid gap-4">
                      <Input
                        placeholder="Nombre"
                        value={editMarca.nombre || ''}
                        onChange={(e) =>
                          setEditMarca({
                            ...editMarca,
                            nombre: e.target.value,
                          })
                        }
                      />

                      <Select
                        defaultValue={editMarca.estado}
                        onValueChange={(value) =>
                          setEditMarca({
                            ...editMarca,
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
                        <Button onClick={handleEditarMarca}>Guardar Cambios</Button>
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
