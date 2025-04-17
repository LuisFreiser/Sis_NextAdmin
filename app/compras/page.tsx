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
  Printer,
  Save,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  Store,
  FileDown,
  Check,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Proveedor = {
  id: number;
  nombre: string;
  nro_documento: string;
};

type Marca = {
  id: number;
  nombre: string;
};

type Producto = {
  id: number;
  nombre: string;
  precio_compra: number;
  stock_cajas: number;
  marca?: Marca; // Agregamos la relación con marca
};

type TipoComprobante = {
  id: number;
  codigo: string;
  nombre: string;
};

type LoteProducto = {
  id: number;
  numero_lote: string;
  fecha_vencimiento: Date;
};

type DetalleCompra = {
  id?: number;
  productoId: number;
  cantidad: number;
  precio_compra: number;
  lote_productoId?: number;
  producto?: Producto;
  lote?: LoteProducto;
  subtotal?: number;
};

type Compra = {
  id: number;
  proveedorId: number;
  tipo_comprobante_id: number;
  nro_comprobante: string;
  fecha_compra: string;
  fecha_vencimiento: string;
  tipo_moneda: string;
  forma_pago: string;
  estado: string;
  proveedor: Proveedor;
  tipoComprobante: TipoComprobante;
  detalleCompras: DetalleCompra[];
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiposComprobante, setTiposComprobante] = useState<TipoComprobante[]>([]);
  // AGREGAR ESTADO PARA LOTES DE PRODUCTOS
  const [lotes, setLotes] = useState<LoteProducto[]>([]);
  // AGREGAR ESTADO PARA CREAR NUEVO LOTE
  const [nuevoLote, setNuevoLote] = useState({
    numero_lote: '',
    fecha_vencimiento: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [nuevaCompra, setNuevaCompra] = useState<Partial<Compra>>({
    proveedorId: 0,
    tipo_comprobante_id: 0,
    nro_comprobante: '',
    fecha_compra: new Date().toISOString(), // Cambiado para incluir la hora
    fecha_vencimiento: new Date().toISOString(), // Cambiado para incluir la hora
    tipo_moneda: 'PEN',
    forma_pago: 'CONTADO',
    estado: 'CANCELADO',
  });

  const [detallesCompra, setDetallesCompra] = useState<DetalleCompra[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedLoteId, setSelectedLoteId] = useState<string>('');
  const [cantidad, setCantidad] = useState<string>('');
  const [precioCompra, setPrecioCompra] = useState<string>('');
  // Estados para controlar la apertura de los Popovers de fecha
  const [fechaCompraOpen, setFechaCompraOpen] = useState(false);
  const [fechaVencimientoOpen, setFechaVencimientoOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comprasRes, proveedoresRes, productosRes, tiposComprobanteRes, lotesRes] =
          await Promise.all([
            fetch('/api/compras'),
            fetch('/api/proveedores'),
            fetch('/api/productos'),
            fetch('/api/tipoComprobante'),
            fetch('/api/loteProductos'),
          ]);

        if (!comprasRes.ok || !proveedoresRes.ok || !productosRes.ok || !tiposComprobanteRes.ok) {
          throw new Error('Error al cargar los datos');
        }

        const [comprasData, proveedoresData, productosData, tiposComprobanteData, lotesData] =
          await Promise.all([
            comprasRes.json(),
            proveedoresRes.json(),
            productosRes.json(),
            tiposComprobanteRes.json(),
            lotesRes.json(),
          ]);

        setCompras(comprasData);
        setProveedores(proveedoresData);
        setProductos(productosData);
        setTiposComprobante(tiposComprobanteData);
        setLotes(lotesData);
        toast.success('Datos cargados exitosamente');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //FUNCION PARA CREAR UN NUEVO LOTE
  const handleCrearLote = async () => {
    if (!nuevoLote.numero_lote || !nuevoLote.fecha_vencimiento) {
      toast.error('Por favor complete todos los campos del lote');
      return;
    }

    try {
      const response = await fetch('/api/loteProductos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoLote),
      });

      if (response.ok) {
        const loteCreado = await response.json();
        setLotes([...lotes, loteCreado]);
        setSelectedLoteId(loteCreado.id.toString());
        toast.success('Lote creado exitosamente');
      } else {
        toast.error('Error al crear el lote');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el lote');
    }
  };

  //FUNCION PARA AGREGAR DETALLE DE COMPRA
  const handleAgregarDetalle = () => {
    const productoId = Number(selectedProductId);
    const lote_productoId = Number(selectedLoteId);
    const cantidadNum = Number(cantidad);
    const precioCompraNum = Number(precioCompra);

    if (!productoId || !lote_productoId || !cantidadNum || !precioCompraNum) {
      toast.error('Por favor complete todos los campos del detalle');
      return;
    }
    //BUSCAMOS PRODUCTO Y LOTE POR ID USAMOS EN POPOVER
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;
    const lote = lotes.find((l) => l.id === lote_productoId);
    if (!lote) return;

    const subtotal = cantidadNum * precioCompraNum;

    const nuevoDetalle: DetalleCompra = {
      productoId,
      lote_productoId,
      cantidad: cantidadNum,
      precio_compra: precioCompraNum,
      producto,
      lote,
      subtotal,
    };

    setDetallesCompra([...detallesCompra, nuevoDetalle]);

    // LIMPIAMOS LOS CAMPOS AL AGREGAR DETALLE
    setSelectedProductId('');
    setSelectedLoteId('');
    setCantidad('');
    setPrecioCompra('');
  };

  //FUNCION PARA CREAR LA COMPRA DE PRODUCTOS
  const handleCrearCompra = async () => {
    if (
      !nuevaCompra.proveedorId ||
      !nuevaCompra.tipo_comprobante_id ||
      !nuevaCompra.nro_comprobante
    ) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (detallesCompra.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    const compraData = {
      ...nuevaCompra,
      fecha_compra:
        new Date(nuevaCompra.fecha_compra || new Date()).toISOString().split('.')[0] + 'Z',
      fecha_vencimiento:
        new Date(nuevaCompra.fecha_vencimiento || new Date()).toISOString().split('.')[0] + 'Z',
      detalleCompras: detallesCompra.map((detalle) => ({
        productoId: detalle.productoId,
        lote_productoId: detalle.lote_productoId,
        cantidad: detalle.cantidad,
        precio_compra: detalle.precio_compra,
      })),
    };

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/compras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(compraData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear la compra');
          }

          const data = await response.json();
          setCompras((prev) => [...prev, data]);
          setNuevaCompra({
            proveedorId: 0,
            tipo_comprobante_id: 0,
            nro_comprobante: '',
            fecha_compra: new Date().toISOString().split('T')[0],
            fecha_vencimiento: new Date().toISOString().split('T')[0],
            tipo_moneda: 'PEN',
            forma_pago: 'CONTADO',
            estado: 'CANCELADO',
          });
          setDetallesCompra([]);
          resolve('success');
        } catch (error) {
          console.error('Error:', error);
          reject(error || 'Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Registrando compra...',
        success: 'Compra registrada exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  //FUNCION PARA CALCULAR EL TOTAL DE LA COMPRA
  const calcularTotal = (detalles: DetalleCompra[]) => {
    return detalles.reduce((total, detalle) => {
      const subtotal = detalle.cantidad * detalle.precio_compra;
      return total + subtotal;
    }, 0);
  };

  //FILTRO DE COMPRAS X PROVEEDOR Y NRO DE COMPROBANTE
  const filteredCompras = compras.filter(
    (compra) =>
      compra.nro_comprobante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //PAGINACION DE TABLA COMPRAS
  const paginatedCompras = filteredCompras.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCompras.length / itemsPerPage);

  //LOADER DE CARGA DE COMPRAS
  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando compras...</p>
          </div>
        </div>
      </div>
    );
  }
  //FRONT END TOTAL DE COMPRAS CON SU DETALLE
  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Compras</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Compras</span>
            <ChevronRight className="w-4 h-4" />
            <span>Registro de Compras</span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4 font-semibold">
              <FilePlus2 /> Nueva Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>
                <FileText className="inline mr-2" />
                Registrar Nueva Compra
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4">
              {/* DATOS PRINCIPALES DE LA COMPRA */}
              <label className="text-sm font-medium">
                <Store className="inline mr-1" size={16} />
                Proveedor
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {nuevaCompra.proveedorId ? (
                        proveedores.find((p) => p.id === nuevaCompra.proveedorId)?.nombre
                      ) : (
                        <span className="text-gray-600">Seleccionar proveedor</span>
                      )}
                      <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar proveedor..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
                        <CommandGroup>
                          {proveedores.map((proveedor) => (
                            <CommandItem
                              key={proveedor.id}
                              value={proveedor.nombre}
                              onSelect={() => {
                                setNuevaCompra({
                                  ...nuevaCompra,
                                  proveedorId: proveedor.id,
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  nuevaCompra.proveedorId === proveedor.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {proveedor.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </label>

              <label className="text-sm font-medium">
                <FileText className="inline mr-1" size={16} />
                Tipo Comprobante
                <Select
                  onValueChange={(value) =>
                    setNuevaCompra({
                      ...nuevaCompra,
                      tipo_comprobante_id: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
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
                Nro. Comprobante
                <Input
                  placeholder="Número de comprobante"
                  value={nuevaCompra.nro_comprobante || ''}
                  onChange={(e) =>
                    setNuevaCompra({
                      ...nuevaCompra,
                      nro_comprobante: e.target.value,
                    })
                  }
                />
              </label>
              {/* SELECT FECHA DE COMPRA */}
              <label className="text-sm font-medium">
                Fecha Compra
                <Popover open={fechaCompraOpen} onOpenChange={setFechaCompraOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !nuevaCompra.fecha_compra && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nuevaCompra.fecha_compra ? (
                        format(new Date(nuevaCompra.fecha_compra), 'PPP', { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        nuevaCompra.fecha_compra ? new Date(nuevaCompra.fecha_compra) : undefined
                      }
                      onSelect={(date) => {
                        setNuevaCompra({
                          ...nuevaCompra,
                          fecha_compra: date?.toISOString() || new Date().toISOString(),
                        });
                        setFechaCompraOpen(false); // Cierra el Popover al seleccionar
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </label>
              {/* SELECT FECHA DE VENCIMIENTO */}
              <label className="text-sm font-medium">
                Fecha Vencimiento
                <Popover open={fechaVencimientoOpen} onOpenChange={setFechaVencimientoOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !nuevaCompra.fecha_vencimiento && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nuevaCompra.fecha_vencimiento ? (
                        format(new Date(nuevaCompra.fecha_vencimiento), 'PPP', { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        nuevaCompra.fecha_vencimiento
                          ? new Date(nuevaCompra.fecha_vencimiento)
                          : undefined
                      }
                      onSelect={(date) => {
                        setNuevaCompra({
                          ...nuevaCompra,
                          fecha_vencimiento: date?.toISOString() || new Date().toISOString(),
                        });
                        setFechaVencimientoOpen(false); // Cierra el Popover al seleccionar
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </label>

              {/* SELECT MONEDA */}
              <label className="text-sm font-medium">
                <DollarSign className="inline mr-1" size={16} />
                Moneda
                <Select
                  defaultValue="PEN"
                  onValueChange={(value) =>
                    setNuevaCompra({
                      ...nuevaCompra,
                      tipo_moneda: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className="text-sm font-medium">
                Forma de Pago
                <Select
                  defaultValue="CONTADO"
                  onValueChange={(value) =>
                    setNuevaCompra({
                      ...nuevaCompra,
                      forma_pago: value,
                      estado: value === 'CONTADO' ? 'CANCELADO' : 'PENDIENTE',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONTADO">Contado</SelectItem>
                    <SelectItem value="CREDITO">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {/*BOTONES DE AGREGAR PROVEEDOR, PRODUCTO Y LOTE */}
              <div className="grid grid-cols-3 col-span-2 gap-4 mt-5">
                <Button className="text-xs font-semibold">
                  <FilePlus2 />
                  Agregar Proveedor
                </Button>
                <Button className="text-xs font-semibold">
                  <FilePlus2 />
                  Agregar Producto
                </Button>
                {/*BOTON CON FORMULARIO DE LOTE */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="text-xs font-semibold">
                      <FilePlus2 />
                      Agregar Lote
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        <FileText className="inline mr-2" />
                        Registrar Nuevo Lote
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <label className="text-sm font-medium">
                        Número de Lote
                        <Input
                          id="numero_lote"
                          placeholder="Número de Lote"
                          className="ring-offset-0 focus-visible:ring-offset-0"
                          onChange={(e) =>
                            setNuevoLote({
                              ...nuevoLote,
                              numero_lote: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="text-sm font-medium">
                        Fecha Vencimiento
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !nuevoLote.fecha_vencimiento && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {nuevoLote.fecha_vencimiento ? (
                                format(new Date(nuevoLote.fecha_vencimiento), 'PPP', { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown" // Añade esta línea
                              fromYear={new Date().getFullYear() - 5} // Opcional: Define el año inicial
                              toYear={new Date().getFullYear() + 20} // Opcional: Define el año final
                              selected={
                                nuevoLote.fecha_vencimiento
                                  ? new Date(nuevoLote.fecha_vencimiento)
                                  : undefined
                              }
                              onSelect={(date) =>
                                setNuevoLote({
                                  ...nuevoLote,
                                  fecha_vencimiento:
                                    date?.toISOString() || new Date().toISOString(),
                                })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </label>
                      <DialogClose asChild>
                        <Button className="font-semibold" onClick={handleCrearLote}>
                          <Save />
                          GUARDAR
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* FORMULARIO DE DETALLES DE COMPRAS */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Detalle de Productos</h3>
              <div className="grid grid-cols-9 gap-2 mb-2">
                <label className="col-span-4">
                  {/*SELECT DE POPOVER LOTE PRODUCTOS */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedProductId ? (
                          productos.find((p) => p.id === Number(selectedProductId))?.nombre
                        ) : (
                          <span className="text-gray-600">Buscar producto..</span>
                        )}
                        <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar producto..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron productos..</CommandEmpty>
                          <CommandGroup>
                            {productos.map((producto) => (
                              <CommandItem
                                key={producto.id}
                                value={producto.nombre}
                                onSelect={() => {
                                  setSelectedProductId(producto.id.toString());
                                  setPrecioCompra(producto.precio_compra.toString());
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedProductId === producto.id.toString()
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {producto.nombre}
                                {producto.marca?.nombre ? ` - ${producto.marca.nombre}` : ''}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </label>

                {/*SELECT DE POPOVER LOTE PRODUCTOS */}
                <label className="col-span-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedLoteId ? (
                          lotes.find((p) => p.id === Number(selectedLoteId))?.numero_lote
                        ) : (
                          <span className="text-gray-600">Buscar lote..</span>
                        )}
                        <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar lote.." />
                        <CommandList>
                          <CommandEmpty>No se encontraron lotes..</CommandEmpty>
                          <CommandGroup>
                            {lotes.map((lote) => (
                              <CommandItem
                                key={lote.id}
                                value={lote.numero_lote}
                                onSelect={() => {
                                  setSelectedLoteId(lote.id.toString());
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedLoteId === lote.id.toString()
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {lote.numero_lote}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </label>

                <Input
                  type="number"
                  placeholder="Cantidad"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="P.Costo"
                  step="0.01"
                  min="0"
                  value={precioCompra}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                />
                <Button onClick={handleAgregarDetalle} className="font-semibold">
                  <FileDown />
                  Agregar
                </Button>
              </div>
              {/*TABLA DE DETALLES DE COMPRAS */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detallesCompra.map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell>{detalle.producto?.nombre}</TableCell>
                      <TableCell>{detalle.lote?.numero_lote}</TableCell>
                      <TableCell>{detalle.cantidad}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('es-PE', {
                          style: 'currency',
                          currency: 'PEN',
                        }).format(detalle.precio_compra)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('es-PE', {
                          style: 'currency',
                          currency: 'PEN',
                        }).format(detalle.subtotal || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-4">
                <div className="text-lg font-semibold">
                  Total:{' '}
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                  }).format(calcularTotal(detallesCompra))}
                </div>
              </div>
            </div>

            <DialogClose asChild>
              <Button className="mt-4 font-semibold" onClick={handleCrearCompra}>
                <Save />
                REGISTRAR COMPRA
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
      {/*BOTON DE FILTRAR POR FECHA Y NUMERO DE COMPROBANTE */}
      <div className="flex-1 mb-4">
        <Input
          type="search"
          placeholder="Buscar por nro de comprobante o proveedor..."
          className="w-[300px] h-[32px] bg-muted max-w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      {/*TABLA DE LISTADO DE COMPRAS */}
      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comprobante</TableHead>
              <TableHead>Nro. Comprobante</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo Pago</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCompras.map((compra) => (
              <TableRow key={compra.id}>
                <TableCell>{compra.tipoComprobante?.nombre}</TableCell>
                <TableCell>{compra.nro_comprobante}</TableCell>
                <TableCell>{compra.proveedor.nombre}</TableCell>
                <TableCell>{new Date(compra.fecha_compra).toLocaleDateString()}</TableCell>
                <TableCell>{compra.forma_pago}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: compra.tipo_moneda,
                  }).format(calcularTotal(compra.detalleCompras))}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      compra.estado === 'CANCELADO'
                        ? 'bg-green-600 text-white'
                        : compra.estado === 'PENDIENTE'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {compra.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2">
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4" />
                  </Button>
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
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
