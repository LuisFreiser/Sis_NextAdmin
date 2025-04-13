'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Printer,
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

// DEFINIMOS LOS TIPOS DE DATOS PARA PROVEEDORES Y TIPOS DE DOCUMENTO
type TipoDocumento = {
  id: number;
  documento: string;
  estado: string;
};

type Proveedor = {
  id: number;
  nombre: string;
  tipo_documento_id: number;
  nro_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  tipoDocumento: TipoDocumento;
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [nuevoProveedor, setNuevoProveedor] = useState<Partial<Proveedor>>({
    nombre: '',
    tipo_documento_id: 0,
    nro_documento: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'ACTIVO',
  });

  const [editProveedor, setEditProveedor] = useState<Partial<Proveedor> | null>(null);

  // OBTENER PROVEEDORES Y TIPOS DE DOCUMENTO
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proveedoresRes, tiposDocumentoRes] = await Promise.all([
          fetch('/api/proveedores'),
          fetch('/api/tipoDocumento'),
        ]);

        if (proveedoresRes.ok && tiposDocumentoRes.ok) {
          const [proveedoresData, tiposDocumentoData] = await Promise.all([
            proveedoresRes.json(),
            tiposDocumentoRes.json(),
          ]);

          setProveedores(proveedoresData);
          setTiposDocumento(tiposDocumentoData);
          toast.success('Datos cargados exitosamente');
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FUNCION PARA CREAR PROVEEDORES
  const handleCrearProveedor = async () => {
    if (
      !nuevoProveedor.nombre ||
      !nuevoProveedor.tipo_documento_id ||
      !nuevoProveedor.nro_documento
    ) {
      toast.error('Los campos nombre, tipo de documento y número de documento son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/proveedores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProveedor),
          });

          const data = await response.json();

          if (response.ok) {
            setProveedores((prev) => [...prev, data]);
            setNuevoProveedor({
              nombre: '',
              tipo_documento_id: 0,
              nro_documento: '',
              direccion: '',
              telefono: '',
              email: '',
              estado: 'ACTIVO',
            });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear el proveedor');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando proveedor...',
        success: 'Proveedor creado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA EDITAR PROVEEDORES
  const handleEditarProveedor = async () => {
    if (!editProveedor) return;

    if (!editProveedor.nombre || !editProveedor.tipo_documento_id || !editProveedor.nro_documento) {
      toast.error('Los campos nombre, tipo de documento y número de documento son obligatorios');
      return;
    }

    // Crear objeto con solo los campos permitidos para actualizar
    const dataToUpdate = {
      nombre: editProveedor.nombre,
      tipo_documento_id: editProveedor.tipo_documento_id,
      nro_documento: editProveedor.nro_documento,
      direccion: editProveedor.direccion || null,
      telefono: editProveedor.telefono || null,
      email: editProveedor.email || null,
      estado: editProveedor.estado,
    };

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/proveedores', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editProveedor.id,
              ...dataToUpdate,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setProveedores((prev) => prev.map((p) => (p.id === editProveedor.id ? data : p)));
            setEditProveedor(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar el proveedor');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando proveedor...',
        success: 'Proveedor actualizado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA FILTRAR PROVEEDORES
  const filteredProveedores = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.nro_documento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PAGINACIÓN
  const paginatedProveedores = filteredProveedores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);

  // GENERAR PDF
  const handleImprimirReporte = () => {
    const doc = new jsPDF();

    // CONFIGURAR EL TÍTULO Y LA FECHA DEL PDF
    doc.setFontSize(20);
    doc.text('Reporte de Proveedores', 75, 22);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 94, 30);

    // PREPARAR LOS DATOS DE LA TABLA
    const proveedoresData = proveedores.map((proveedor) => [
      proveedor.id,
      proveedor.nombre,
      `${proveedor.tipoDocumento.documento}: ${proveedor.nro_documento}`,
      proveedor.direccion || '-',
      proveedor.telefono || '-',
      proveedor.email || '-',
      proveedor.estado,
    ]);

    // GENERAR LA TABLA PARA EL PDF
    autoTable(doc, {
      head: [['Id', 'Nombre', 'Documento', 'Direción', 'Teléfono', 'Email', 'Estado']],
      body: proveedoresData,
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

    // GUADAR EL PDF
    doc.save('reporte-proveedores.pdf');
  };

  // LOADER DE LA PAGINA PROVEEDORES
  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando Proveedores...</p>
          </div>
        </div>
      </div>
    );
  }
  //TARJETA COMPLETA DE PROVEEDORES
  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Proveedores</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Compras</span>
            <ChevronRight className="w-4 h-4" />
            <span>Proveedores</span>
          </div>
        </div>

        {/* BOTÓN PARA CREAR NUEVO PROVEEDOR */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4 font-semibold">
                <FilePlus2 /> Agregar Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  <SquarePen className="inline mr-2" />
                  Registrar Proveedor
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium">
                  Nombre
                  <Input
                    placeholder="Nombre del Proveedor"
                    value={nuevoProveedor.nombre || ''}
                    onChange={(e) =>
                      setNuevoProveedor({
                        ...nuevoProveedor,
                        nombre: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Tipo Documento
                  <Select
                    onValueChange={(value) =>
                      setNuevoProveedor({
                        ...nuevoProveedor,
                        tipo_documento_id: Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposDocumento.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.documento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="text-sm font-medium">
                  Nro. Documento
                  <Input
                    placeholder="Número de Documento"
                    value={nuevoProveedor.nro_documento || ''}
                    onChange={(e) =>
                      setNuevoProveedor({
                        ...nuevoProveedor,
                        nro_documento: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Dirección
                  <Input
                    placeholder="Dirección"
                    value={nuevoProveedor.direccion || ''}
                    onChange={(e) =>
                      setNuevoProveedor({
                        ...nuevoProveedor,
                        direccion: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Teléfono
                  <Input
                    placeholder="Teléfono"
                    value={nuevoProveedor.telefono || ''}
                    onChange={(e) =>
                      setNuevoProveedor({
                        ...nuevoProveedor,
                        telefono: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Email
                  <Input
                    type="email"
                    placeholder="Email"
                    value={nuevoProveedor.email || ''}
                    onChange={(e) =>
                      setNuevoProveedor({
                        ...nuevoProveedor,
                        email: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Estado
                  <Select
                    defaultValue="ACTIVO"
                    onValueChange={(value) =>
                      setNuevoProveedor({
                        ...nuevoProveedor,
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
              </div>
              <DialogClose asChild>
                <Button onClick={handleCrearProveedor} className="mt-4 font-semibold">
                  <Save />
                  GUARDAR
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          <Button className="mb-4 font-semibold" onClick={handleImprimirReporte}>
            <Printer />
            Imprimir Reporte
          </Button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="flex-1 mb-4">
        <Input
          type="search"
          placeholder="Buscar por nombre o documento..."
          className="w-[300px] h-[32px] bg-muted max-w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* TABLA DE PROVEEDORES */}
      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProveedores.map((proveedor) => (
              <TableRow
                key={proveedor.id}
                className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
              >
                <TableCell>{proveedor.id}</TableCell>
                <TableCell>{proveedor.nombre}</TableCell>
                <TableCell>
                  {proveedor.tipoDocumento.documento}: {proveedor.nro_documento}
                </TableCell>
                <TableCell>{proveedor.direccion || '-'}</TableCell>
                <TableCell>{proveedor.telefono || '-'}</TableCell>
                <TableCell>{proveedor.email || '-'}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      proveedor.estado === 'ACTIVO'
                        ? 'bg-green-600 text-gray-100'
                        : 'bg-gray-600 text-gray-100'
                    }`}
                  >
                    {proveedor.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        title="Editar Proveedor"
                        onClick={() => setEditProveedor(proveedor)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          <FilePenLine className="inline mr-2" />
                          Editar Proveedor
                        </DialogTitle>
                      </DialogHeader>
                      {editProveedor && (
                        <div className="grid grid-cols-2 gap-4">
                          <label className="text-sm font-medium">
                            Nombre
                            <Input
                              placeholder="Nombre del Proveedor"
                              value={editProveedor.nombre || ''}
                              onChange={(e) =>
                                setEditProveedor({
                                  ...editProveedor,
                                  nombre: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Tipo Documento
                            <Select
                              defaultValue={editProveedor.tipo_documento_id?.toString() || ''}
                              onValueChange={(value) =>
                                setEditProveedor({
                                  ...editProveedor,
                                  tipo_documento_id: Number(value),
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {tiposDocumento.map((tipo) => (
                                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                    {tipo.documento}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </label>
                          <label className="text-sm font-medium">
                            Nro. Documento
                            <Input
                              placeholder="Número de Documento"
                              value={editProveedor.nro_documento || ''}
                              onChange={(e) =>
                                setEditProveedor({
                                  ...editProveedor,
                                  nro_documento: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Dirección
                            <Input
                              placeholder="Dirección"
                              value={editProveedor.direccion || ''}
                              onChange={(e) =>
                                setEditProveedor({
                                  ...editProveedor,
                                  direccion: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Teléfono
                            <Input
                              placeholder="Teléfono"
                              value={editProveedor.telefono || ''}
                              onChange={(e) =>
                                setEditProveedor({
                                  ...editProveedor,
                                  telefono: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Email
                            <Input
                              type="email"
                              placeholder="Email"
                              value={editProveedor.email || ''}
                              onChange={(e) =>
                                setEditProveedor({
                                  ...editProveedor,
                                  email: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Estado
                            <Select
                              defaultValue={editProveedor.estado}
                              onValueChange={(value) =>
                                setEditProveedor({
                                  ...editProveedor,
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
                        </div>
                      )}
                      <DialogClose asChild>
                        <Button onClick={handleEditarProveedor} className="mt-4 font-semibold">
                          <Save />
                          GUARDAR CAMBIOS
                        </Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN DE PROVEEDORES */}
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
