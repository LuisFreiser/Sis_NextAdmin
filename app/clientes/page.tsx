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

// DEFINIMOS LOS TIPOS DE DATOS
type TipoDocumento = {
  id: number;
  documento: string;
  estado: string;
};

type Cliente = {
  id: number;
  nombre: string;
  tipo_documento_id: number;
  nro_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipodocumento: TipoDocumento;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [nuevoCliente, setNuevoCliente] = useState<Partial<Cliente>>({
    nombre: '',
    tipo_documento_id: 0,
    nro_documento: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  const [editCliente, setEditCliente] = useState<Partial<Cliente> | null>(null);

  // OBTENER CLIENTES Y TIPOS DE DOCUMENTO
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, tiposDocumentoRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/tipoDocumento'),
        ]);

        if (clientesRes.ok && tiposDocumentoRes.ok) {
          const [clientesData, tiposDocumentoData] = await Promise.all([
            clientesRes.json(),
            tiposDocumentoRes.json(),
          ]);

          setClientes(clientesData);
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

  // FUNCION PARA CREAR CLIENTES
  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.tipo_documento_id || !nuevoCliente.nro_documento) {
      toast.error('Los campos nombre, tipo de documento y número de documento son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCliente),
          });

          const data = await response.json();

          if (response.ok) {
            setClientes((prev) => [...prev, data]);
            setNuevoCliente({
              nombre: '',
              tipo_documento_id: 0,
              nro_documento: '',
              direccion: '',
              telefono: '',
              email: '',
            });
            resolve('success');
          } else {
            reject(data.message || 'Error al crear el cliente');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando cliente...',
        success: 'Cliente creado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA EDITAR CLIENTE
  const handleEditarCliente = async () => {
    if (!editCliente) return;

    if (!editCliente.nombre || !editCliente.tipo_documento_id || !editCliente.nro_documento) {
      toast.error('Los campos nombre, tipo de documento y número de documento son obligatorios');
      return;
    }

    // Crear un objeto con solo los campos permitidos
    const dataToUpdate = {
      nombre: editCliente.nombre,
      tipo_documento_id: editCliente.tipo_documento_id,
      nro_documento: editCliente.nro_documento,
      direccion: editCliente.direccion || null,
      telefono: editCliente.telefono || null,
      email: editCliente.email || null,
    };

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/clientes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editCliente.id,
              ...dataToUpdate,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setClientes((prev) => prev.map((c) => (c.id === editCliente.id ? data : c)));
            setEditCliente(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar el cliente');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando cliente...',
        success: 'Cliente actualizado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA FILTRAR CLIENTES
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.nro_documento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PAGINACION DE CLIENTES
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  // GENERAR PDF DE CLIENTES
  const handleImprimirReporte = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Reporte de Clientes', 75, 22);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 94, 30);

    const clientesData = clientes.map((cliente) => [
      cliente.id.toString(),
      cliente.nombre,
      `${cliente.tipodocumento.documento}: ${cliente.nro_documento}`,
      cliente.direccion || '-',
      cliente.telefono || '-',
      cliente.email || '-',
    ]);

    autoTable(doc, {
      head: [['Id', 'Nombre', 'Documento', 'Dirección', 'Teléfono', 'Email']],
      body: clientesData,
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
    //GUARDAR PDF
    doc.save('reporte-clientes.pdf');
    toast.success('Reporte Generado Exitosamente');
  };

  //LOADER DE PAGINA CLIENTES
  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando Clientes...</p>
          </div>
        </div>
      </div>
    );
  }
  //TARJETA TOTAL DE CLIENTES
  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Clientes</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Ventas</span>
            <ChevronRight className="w-4 h-4" />
            <span>Clientes</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4 font-semibold">
                <FilePlus2 /> Agregar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  <SquarePen className="inline mr-2" />
                  Registrar Cliente
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium">
                  Nombre
                  <Input
                    placeholder="Nombre del Cliente"
                    value={nuevoCliente.nombre || ''}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        nombre: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Tipo Documento
                  <Select
                    onValueChange={(value) =>
                      setNuevoCliente({
                        ...nuevoCliente,
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
                    value={nuevoCliente.nro_documento || ''}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        nro_documento: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Dirección
                  <Input
                    placeholder="Dirección"
                    value={nuevoCliente.direccion || ''}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        direccion: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Teléfono
                  <Input
                    placeholder="Teléfono"
                    value={nuevoCliente.telefono || ''}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
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
                    value={nuevoCliente.email || ''}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        email: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <DialogClose asChild>
                <Button onClick={handleCrearCliente} className="mt-4 font-semibold">
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

      {/*TABLA CLIENTES EN PANTALLAS GRANDES DESKTOP*/}
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
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.map((cliente) => (
              <TableRow
                key={cliente.id}
                className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
              >
                <TableCell>{cliente.id}</TableCell>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>
                  {cliente.tipodocumento.documento}: {cliente.nro_documento}
                </TableCell>
                <TableCell>{cliente.direccion || '-'}</TableCell>
                <TableCell>{cliente.telefono || '-'}</TableCell>
                <TableCell>{cliente.email || '-'}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        title="Editar Cliente"
                        onClick={() => setEditCliente(cliente)}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          <FilePenLine className="inline mr-2" />
                          Editar Cliente
                        </DialogTitle>
                      </DialogHeader>
                      {editCliente && (
                        <div className="grid grid-cols-2 gap-4">
                          <label className="text-sm font-medium">
                            Nombre
                            <Input
                              placeholder="Nombre del Cliente"
                              value={editCliente.nombre || ''}
                              onChange={(e) =>
                                setEditCliente({
                                  ...editCliente,
                                  nombre: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Tipo Documento
                            <Select
                              defaultValue={editCliente.tipo_documento_id?.toString() || ''}
                              onValueChange={(value) =>
                                setEditCliente({
                                  ...editCliente,
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
                              value={editCliente.nro_documento || ''}
                              onChange={(e) =>
                                setEditCliente({
                                  ...editCliente,
                                  nro_documento: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Dirección
                            <Input
                              placeholder="Dirección"
                              value={editCliente.direccion || ''}
                              onChange={(e) =>
                                setEditCliente({
                                  ...editCliente,
                                  direccion: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Teléfono
                            <Input
                              placeholder="Teléfono"
                              value={editCliente.telefono || ''}
                              onChange={(e) =>
                                setEditCliente({
                                  ...editCliente,
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
                              value={editCliente.email || ''}
                              onChange={(e) =>
                                setEditCliente({
                                  ...editCliente,
                                  email: e.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                      )}
                      <DialogClose asChild>
                        <Button onClick={handleEditarCliente} className="mt-4 font-semibold">
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

      {/*PAGINACION DE LA TABLA CLIENTES*/}
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
