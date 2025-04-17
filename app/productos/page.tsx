'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
//IMPORTO LAS LIBRERIAS DE JSPDF Y AUTOTABLE PARA IMPRIMIR REPORTES
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

//IMPORTAMOS LA IMAGEN POR DEFECTO
import noImage from '@/public/no-image.png';

//IMPORTAMOS LOS COMPONENTES
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
import { cn } from '@/lib/utils';
import {
  Loader2,
  Home,
  ChevronRight,
  FilePlus2,
  FilePenLine,
  Search,
  Printer,
  SquarePen,
  Check,
  ChevronsUpDown,
  Save,
  Barcode,
  FileSearch,
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

//DEFINIMOS EL TIPO DE DATOS DE LOS PRODUCTOS Y SUS RELACIONES
type Producto = {
  id: number;
  codigo_prod: string;
  nombre: string;
  marcaId: number;
  unidades_por_caja: number;
  stock_cajas: number;
  stock_unidades: number | null;
  stock_min_cajas: number | null;
  precio_compra: number;
  precio_venta_caja: number;
  precio_venta_unit: number;
  imagen: string | null;
  estado: string;
  marca: {
    id: number;
    nombre: string;
  };
};

//FUNCIONES DE LA PAGINA PRODUCTOS
export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  //CONSTANTE PARA EL NUMERO DE PAGINACIÓN
  const itemsPerPage = 10;

  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    codigo_prod: '',
    nombre: '',
    marcaId: 0,
    unidades_por_caja: 0,
    stock_cajas: 0,
    stock_unidades: 0,
    stock_min_cajas: 0,
    precio_compra: 0,
    precio_venta_caja: 0,
    precio_venta_unit: 0,
    estado: 'ACTIVO',
    imagen: '/no-image.jpg',
  });

  //  ESTADOS PARA EDITAR UN PRODUCTO Y SU MARCA
  const [editProducto, setEditProducto] = useState<Partial<Producto> | null>(null);
  const [marcas, setMarcas] = useState<Array<{ id: number; nombre: string }>>([]);

  // ESTADOS PARA PREVISUALIZAR IMAGENES
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editPreviewImage, setEditPreviewImage] = useState<string | null>(null);

  // FUNCION PARA OBTENER LOS PRODUCTOS
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('/api/productos');
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
          toast.success('Productos Cargados Exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al Obtener los Productos');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // FUNCION PARA OBTENER MARCAS DE PRODUCTOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marcasRes] = await Promise.all([fetch('/api/marcas')]);

        if (!marcasRes.ok) {
          throw new Error('Error al cargar los datos relacionados');
        }
        const [marcasData] = await Promise.all([marcasRes.json()]);

        setMarcas(marcasData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los datos necesarios');
      }
    };

    fetchData();
  }, []);

  // FUNCION PARA CREAR UN NUEVO PRODUCTO
  const handleCrearProducto = async () => {
    if (!nuevoProducto.codigo_prod || !nuevoProducto.nombre || !nuevoProducto.marcaId) {
      toast.error('Código, Nombre y Marca son Obligatorios');
      return;
    }

    if (
      !nuevoProducto.precio_compra ||
      !nuevoProducto.precio_venta_caja ||
      Number(nuevoProducto.precio_compra) <= 0 ||
      Number(nuevoProducto.precio_venta_caja) <= 0
    ) {
      toast.error('Los precios deben ser mayores a 0');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto),
          });

          const data = await response.json();

          if (response.ok) {
            setProductos((prev) => [...prev, data]);
            setNuevoProducto({
              codigo_prod: '',
              nombre: '',
              marcaId: 0,
              unidades_por_caja: 0,
              stock_cajas: 0,
              stock_unidades: 0,
              stock_min_cajas: 0,
              precio_compra: 0,
              precio_venta_caja: 0,
              precio_venta_unit: 0,
              estado: 'ACTIVO',
              imagen: '/no-image.jpg',
            });
            setPreviewImage(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al Crear el Producto');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando Producto...',
        success: 'Producto Creado Exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA EDITAR LOS PRODUCTOS
  const handleEditarProducto = async () => {
    if (!editProducto) return;

    if (!editProducto.codigo_prod || !editProducto.nombre || !editProducto.marcaId) {
      toast.error('Código, Nombre, y Marca son Obligatorios');
      return;
    }

    if (
      !editProducto.precio_compra ||
      !editProducto.precio_venta_caja ||
      Number(editProducto.precio_compra) <= 0 ||
      Number(editProducto.precio_venta_caja) <= 0
    ) {
      toast.error('Los precios deben ser mayores a 0');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/productos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editProducto),
          });

          const data = await response.json();

          if (response.ok) {
            setProductos((prev) => prev.map((p) => (p.id === editProducto.id ? data : p)));
            setEditProducto(null);
            setEditPreviewImage(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al Actualizar el Producto');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando Producto...',
        success: 'Producto Actualizado Exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA MANEJAR LA CARGA DE IMAGENES
  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // VALIDAR TAMAÑO DE ARCHIVO (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 2MB');
        return;
      }

      // VALIDAR TIPO DE ARCHIVO
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen');
        return;
      }
      //CONVERTIR LA IMAGEN A BASE64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit) {
          setEditPreviewImage(base64String);
          setEditProducto((prev) => (prev ? { ...prev, imagen: base64String } : null));
        } else {
          setPreviewImage(base64String);
          setNuevoProducto((prev) => ({ ...prev, imagen: base64String }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      // USAR NO-IMAGE.PNG POR DEFECTO
      const defaultImage = '/no-image.png';
      if (isEdit) {
        setEditPreviewImage(defaultImage);
        setEditProducto((prev) => (prev ? { ...prev, imagen: defaultImage } : null));
      } else {
        setPreviewImage(defaultImage);
        setNuevoProducto((prev) => ({ ...prev, imagen: defaultImage }));
      }
    }
  };

  // FILTRAR LOS PRODUCTOS POR CODIGO, NOMBRE O MARCA
  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo_prod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // FUNCION PARA IMPRIMIR REPORTES
  const handleImprimirReporte = () => {
    const doc = new jsPDF();

    // CONFIGURAR EL TITULO DEL PDF
    doc.setFontSize(20);
    doc.text('Reporte de Productos', 75, 22);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 94, 30);

    // PREPARAR LOS DATOS DE LA TABLA
    const tableRows = productos.map((producto) => [
      producto.codigo_prod,
      producto.nombre,
      producto.marca.nombre,
      producto.stock_cajas,
      producto.stock_unidades,
      producto.precio_compra.toFixed(2),
      producto.precio_venta_caja.toFixed(2),
      producto.estado,
    ]);

    // GENERAR LA TABLA PARA EL PDF
    autoTable(doc, {
      head: [
        [
          'Código',
          'Producto',
          'Marca',
          'Stock Cajas',
          'Stock Unid.',
          'P.Costo',
          'P.Venta',
          'Estado',
        ],
      ],
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

    // GUADAR EL PDF
    doc.save('reporte-productos.pdf');
    toast.success('Reporte Generado Exitosamente');
  };

  //LOADER DE LA PAGINA PRODUCTOS
  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando inventario...</p>
          </div>
        </div>
      </div>
    );
  }

  // PAGINACION DE LA TABLA PRODUCTOS
  const paginatedProductos = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  //FRONT-END DE LA PAGINA PRODUCTOS
  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Productos</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Almacen</span>
            <ChevronRight className="w-4 h-4" />
            <span>Productos</span>
          </div>
        </div>
        {/* DIALOGO PARA CREAR UNA NUEVA CATEGORIA */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="mb-4 font-semibold"
                onClick={() => {
                  // Establecer la imagen por defecto al abrir el modal
                  setPreviewImage('/no-image.png');
                  // Reiniciar el formulario con valores por defecto
                  setNuevoProducto({
                    codigo_prod: '',
                    nombre: '',
                    marcaId: 0,
                    unidades_por_caja: 0,
                    stock_cajas: 0,
                    stock_unidades: 0,
                    stock_min_cajas: 0,
                    precio_compra: 0,
                    precio_venta_caja: 0,
                    precio_venta_unit: 0,
                    estado: 'ACTIVO',
                    imagen: '/no-image.jpg',
                  });
                }}
              >
                <FilePlus2 /> Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  <SquarePen className="inline mr-2" />
                  Registrar Producto
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium">
                  <Barcode size={16} className="inline mr-1" />
                  Cod.Interno
                  <Input
                    placeholder="CL363793"
                    className="focus-visible:ring-offset-0"
                    value={nuevoProducto.codigo_prod || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        codigo_prod: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  Descripción
                  <Input
                    placeholder="Nombre del Producto"
                    className="focus-visible:ring-offset-0"
                    value={nuevoProducto.nombre || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        nombre: e.target.value,
                      })
                    }
                  />
                </label>

                {/*COMBOBOX SEARCH DE MARCAS */}
                <label className="text-sm font-medium">
                  Marca
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {nuevoProducto.marcaId ? (
                          marcas.find((marca) => marca.id === nuevoProducto.marcaId)?.nombre
                        ) : (
                          <span className="text-gray-600">Seleccionar Marca</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar marca..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron marcas.</CommandEmpty>
                          <CommandGroup>
                            {marcas.map((marca) => (
                              <CommandItem
                                key={marca.id}
                                value={marca.nombre}
                                onSelect={() => {
                                  setNuevoProducto({
                                    ...nuevoProducto,
                                    marcaId: marca.id,
                                  });
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    nuevoProducto.marcaId === marca.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {marca.nombre}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </label>

                {/*INPUT DE UNID X CAJA DE PRODUCTO*/}
                <label className="text-sm font-medium">
                  Unid x Caja
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="focus-visible:ring-offset-0"
                    value={nuevoProducto.unidades_por_caja || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        unidades_por_caja: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                </label>

                {/*INPUT DE STOCK_CAJAS DE PRODUCTO*/}
                <label className="text-sm font-medium">
                  Stock
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="focus-visible:ring-offset-0"
                    value={nuevoProducto.stock_cajas || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        stock_cajas: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                </label>

                {/*INPUT DE STOCK MIN DE PRODUCTO*/}
                <label className="text-sm font-medium">
                  Stock Min
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="focus-visible:ring-offset-0"
                    value={nuevoProducto.stock_min_cajas || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        stock_min_cajas: Number(e.target.value),
                      })
                    }
                  />
                </label>

                {/*INPUT DE PRECIO COMPRA DE PRODUCTO*/}
                <label className="text-sm font-medium">
                  Precio Compra
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={nuevoProducto.precio_compra || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        precio_compra: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                </label>

                {/*INPUT DE PRECIO VENTA X CAJA*/}
                <label className="text-sm font-medium">
                  P. Venta x Caja
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="apparency-none"
                    value={nuevoProducto.precio_venta_caja || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        precio_venta_caja: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                </label>

                {/*INPUT DE PRECIO VENTA X UNIDAD*/}
                <label className="text-sm font-medium">
                  P. Venta x Unid
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="focus-visible:ring-offset-0"
                    value={nuevoProducto.precio_venta_unit || ''}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        precio_venta_unit: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                </label>

                {/*SELECT DE ESTADO DE PRODUCTO*/}
                <label className="text-sm font-medium">
                  Estado
                  <Select
                    onValueChange={(value) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        estado: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ACTIVO" defaultValue="ACTIVO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                      <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                {/*CAMPO DE IMAGEN Y VISTA PREVIA*/}
                <label className="text-sm font-medium">
                  Imagen
                  <Input
                    type="file"
                    className="file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-primary-foreground hover:file:bg-opacity-95 file:cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e)}
                  />
                </label>
                {previewImage && (
                  <div className="flex items-center justify-center">
                    <Image
                      src={previewImage || noImage}
                      alt={previewImage ? 'Vista previa' : 'Sin imagen'}
                      className="max-h-32 object-contain"
                      width={150}
                      height={150}
                    />
                  </div>
                )}

                <DialogClose asChild>
                  <Button className="font-semibold" onClick={handleCrearProducto}>
                    <Save />
                    REGISTRAR
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          {/*BOTON DE IMPRIMIR REPORTES*/}
          <Button className="mb-4 font-semibold" onClick={handleImprimirReporte}>
            <Printer />
            Imprimir Reporte
          </Button>
        </div>
      </div>

      {/*BOTON PARA BUSCAR PRODUCTOS*/}
      <div className="flex-1 mb-4">
        <Input
          type="search"
          id="searchProduct"
          name="searchProduct"
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

      {/*TABLA DE PAGINA INVENTARIO DE PRODUCTOS*/}
      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow className="h-8 text-sm bg-slate-100">
              <TableHead className="py-1">Cod.Barra</TableHead>
              <TableHead className="py-1">Producto</TableHead>
              <TableHead className="py-1">Marca</TableHead>
              <TableHead className="py-1">Stock</TableHead>
              <TableHead className="py-1">Costo</TableHead>
              <TableHead className="py-1">Prec.Caja</TableHead>
              <TableHead className="py-1">Prec.Unid</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProductos.map((producto) => (
              <TableRow
                key={producto.id}
                className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
              >
                <TableCell>{producto.codigo_prod}</TableCell>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.marca.nombre}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      producto.stock_cajas === 0
                        ? 'bg-red-600 text-gray-50'
                        : producto.stock_min_cajas !== null &&
                          producto.stock_cajas <= producto.stock_min_cajas
                        ? 'bg-orange-400 text-gray-50'
                        : ''
                    }`}
                  >
                    {producto.stock_cajas === 0
                      ? 'AGOTADO'
                      : producto.stock_min_cajas !== null &&
                        producto.stock_cajas <= producto.stock_min_cajas
                      ? 'EN MINIMO'
                      : producto.stock_cajas}
                  </span>
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                  }).format(producto.precio_compra)}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                  }).format(producto.precio_venta_caja)}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                  }).format(producto.precio_venta_unit)}
                </TableCell>
                <TableCell className="py-1">
                  {/*BOTON DE EDITAR PRODUCTO*/}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        title="Editar Producto"
                        onClick={() => {
                          setEditProducto(producto);
                          setEditPreviewImage(producto.imagen || '/no-image.png');
                        }}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          <FilePenLine className="inline mr-2" />
                          Editar Producto
                        </DialogTitle>
                      </DialogHeader>
                      {editProducto && (
                        <div className="grid grid-cols-2 gap-4">
                          {/*INPUT CODIGO DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            <Barcode size={16} className="inline mr-1" />
                            Cod.Interno
                            <Input
                              placeholder="Código de Barra"
                              className="focus-visible:ring-offset-0"
                              value={editProducto.codigo_prod || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  codigo_prod: e.target.value,
                                })
                              }
                            />
                          </label>
                          {/*INPUT DESCRIPCION DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            Descripción
                            <Input
                              placeholder="Nombre del Producto"
                              className="focus-visible:ring-offset-0"
                              value={editProducto.nombre || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  nombre: e.target.value,
                                })
                              }
                            />
                          </label>

                          {/*COMBOBOX SEARCH DE MARCAS */}
                          <label className="text-sm font-medium">
                            Marca
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between"
                                >
                                  {editProducto.marcaId ? (
                                    marcas.find((marca) => marca.id === editProducto.marcaId)
                                      ?.nombre
                                  ) : (
                                    <span className="text-gray-600">Seleccionar Marca</span>
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar Marca..." />
                                  <CommandList>
                                    <CommandEmpty>No se Encontraron Marcas.</CommandEmpty>
                                    <CommandGroup>
                                      {marcas.map((marca) => (
                                        <CommandItem
                                          key={marca.id}
                                          value={marca.nombre}
                                          onSelect={() => {
                                            setEditProducto({
                                              ...editProducto,
                                              marcaId: marca.id,
                                            });
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              'mr-2 h-4 w-4',
                                              editProducto.marcaId === marca.id
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                            )}
                                          />
                                          {marca.nombre}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </label>

                          {/*INPUT DE UNID X CAJA DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            Unid x Caja
                            <Input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              value={editProducto.unidades_por_caja || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  unidades_por_caja: Math.max(0, Number(e.target.value)),
                                })
                              }
                            />
                          </label>

                          {/*INPUT DE STOCK X CAJA DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            Stock
                            <Input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              value={editProducto.stock_cajas || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  stock_cajas: Math.max(0, Number(e.target.value)),
                                })
                              }
                            />
                          </label>

                          {/*INPUT DE STOCK MIN DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            Stock Min
                            <Input
                              type="number"
                              min="0"
                              placeholder="Stock Mínimo"
                              value={editProducto.stock_min_cajas || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  stock_min_cajas: Number(e.target.value),
                                })
                              }
                            />
                          </label>

                          {/*INPUT DE PRECIO COMPRA DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            Precio Compra
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Precio de Compra"
                              value={editProducto.precio_compra || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  precio_compra: Math.max(0, Number(e.target.value)),
                                })
                              }
                            />
                          </label>

                          {/*INPUT DE PRECIO VENTA X CAJA DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            P. Venta x Caja
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Precio de Venta"
                              value={editProducto.precio_venta_caja || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  precio_venta_caja: Math.max(0, Number(e.target.value)),
                                })
                              }
                            />
                          </label>

                          {/*INPUT DE PRECIO VENTA X UNID DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            P. Venta x Unid
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Precio de Venta"
                              value={editProducto.precio_venta_unit || ''}
                              onChange={(e) =>
                                setEditProducto({
                                  ...editProducto,
                                  precio_venta_unit: Math.max(0, Number(e.target.value)),
                                })
                              }
                            />
                          </label>

                          {/*SELECT DE ESTADO DE PRODUCTO*/}
                          <label className="text-sm font-medium">
                            Estado
                            <Select
                              defaultValue={editProducto.estado}
                              onValueChange={(value) =>
                                setEditProducto({
                                  ...editProducto,
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

                          {/*AGREGAMOS EL CAMPO DE IMAGEN Y SU VISTA PREVIA*/}
                          <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-medium">
                                Imagen
                                <Input
                                  type="file"
                                  className="file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-primary-foreground hover:file:bg-opacity-95 file:cursor-pointer"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(e, true)}
                                />
                              </label>
                            </div>
                            {editPreviewImage && (
                              <div className="flex items-center justify-center">
                                <Image
                                  src={editPreviewImage || noImage}
                                  alt={editPreviewImage ? 'Vista previa' : 'Sin imagen'}
                                  className="max-h-32 object-contain border border-1 rounded-lg p-2"
                                  width={200}
                                  height={200}
                                />
                              </div>
                            )}
                          </div>

                          <DialogClose asChild>
                            <Button className="font-semibold" onClick={handleEditarProducto}>
                              <Save />
                              GUARDAR CAMBIOS
                            </Button>
                          </DialogClose>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  {/*BOTON DE VISTA PRODUCTOS*/}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="ml-2" title="Ver Detalles">
                        <FileSearch />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          <FileSearch className="inline mr-2" />
                          Detalle del Producto
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        {/* IMAGEN DEL PRODUCTO */}
                        <div className="col-span-2 flex justify-center">
                          <Image
                            src={producto.imagen || noImage}
                            alt={producto.nombre}
                            width={200}
                            height={200}
                            className="rounded-lg border p-2"
                          />
                        </div>

                        {/* INFORMACIÓN DEL PRODUCTO */}
                        <div className="col-span-2 gap-28 flex justify-center">
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Código: </span>
                              {producto.codigo_prod}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Nombre: </span>
                              {producto.nombre}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Marca: </span>
                              {producto.marca.nombre}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Stock Cajas: </span>
                              <span
                                className={cn(
                                  'px-2 py-1 rounded-full text-sm font-semibold',
                                  producto.stock_cajas === 0
                                    ? 'bg-red-600 text-white'
                                    : 'bg-green-600 text-white'
                                )}
                              >
                                {producto.stock_cajas === 0 ? 'AGOTADO' : producto.stock_cajas}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Stock Unid: </span>
                              {producto.stock_unidades}
                            </p>
                          </div>

                          {/* Información de stock y precios */}
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Precio Compra: </span>
                              {new Intl.NumberFormat('es-PE', {
                                style: 'currency',
                                currency: 'PEN',
                              }).format(producto.precio_compra)}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">P.Venta x Caja: </span>
                              {new Intl.NumberFormat('es-PE', {
                                style: 'currency',
                                currency: 'PEN',
                              }).format(producto.precio_venta_caja)}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">P.Venta x Unid: </span>
                              {new Intl.NumberFormat('es-PE', {
                                style: 'currency',
                                currency: 'PEN',
                              }).format(producto.precio_venta_unit)}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Estado: </span>
                              <span
                                className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium',
                                  producto.estado === 'ACTIVO'
                                    ? 'bg-green-600 text-gray-100'
                                    : 'bg-gray-600 text-gray-100'
                                )}
                              >
                                {producto.estado}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/*NUMERAL DE PAGINACION PRODUCTOS*/}
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
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
                  className={
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
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

      {
        //   /* Vista para móviles */
        //   <div className="md:hidden grid gap-4">
        //     {paginatedProductos.map((producto) => (
        //       <div
        //         key={producto.id}
        //         className="p-4 border rounded-lg bg-white shadow dark:bg-slate-800"
        //       >
        //         <h2 className="text-lg font-semibold mb-2">{producto.nombre}</h2>
        //         <div className="grid grid-cols-2 gap-2 text-sm">
        //           <p>
        //             <strong>Código:</strong> {producto.codigo_prod}
        //           </p>
        //           <p>
        //             <strong>Marca:</strong> {producto.marca.nombre}
        //           </p>
        //           <p>
        //             <strong>Presentación:</strong> {producto.presentacion?.nombre || '-'}
        //           </p>
        //           <p>
        //             <strong>Stock:</strong> {producto.stock}
        //           </p>
        //           <p>
        //             <strong>P.Compra:</strong>{' '}
        //             {new Intl.NumberFormat('es-PE', {
        //               style: 'currency',
        //               currency: 'PEN',
        //             }).format(producto.precio_compra)}
        //           </p>
        //           <p>
        //             <strong>P.Venta:</strong>{' '}
        //             {new Intl.NumberFormat('es-PE', {
        //               style: 'currency',
        //               currency: 'PEN',
        //             }).format(producto.precio_venta)}
        //           </p>
        //           <p>
        //             <strong>Estado:</strong>
        //             <span
        //               className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
        //                 producto.estado === 'VIGENTE'
        //                   ? 'bg-green-100 text-green-700'
        //                   : 'bg-gray-100 text-gray-700'
        //               }`}
        //             >
        //               {producto.estado}
        //             </span>
        //           </p>
        //         </div>
        //         <div className="mt-3">
        //           <Dialog>
        //             <DialogTrigger asChild>
        //               <Button variant="outline" size="sm" onClick={() => setEditProducto(producto)}>
        //                 Editar
        //               </Button>
        //             </DialogTrigger>
        //             <DialogContent>
        //               <DialogHeader>
        //                 <DialogTitle>Editar Producto</DialogTitle>
        //               </DialogHeader>
        //               {/* Mismo contenido del diálogo de edición que en la vista de escritorio */}
        //             </DialogContent>
        //           </Dialog>
        //         </div>
        //       </div>
        //     ))}
        //     {/* Paginación para móviles */}
        //     <div className="flex justify-center mt-4">
        //       <Pagination>
        //         <PaginationContent>
        //           <PaginationItem>
        //             <PaginationPrevious
        //               aria-disabled={currentPage === 1}
        //               className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
        //               onClick={(e) => {
        //                 e.preventDefault();
        //                 if (currentPage > 1) {
        //                   setCurrentPage(currentPage - 1);
        //                 }
        //               }}
        //             />
        //           </PaginationItem>
        //           <PaginationItem>
        //             <PaginationLink isActive={true}>
        //               {currentPage} / {totalPages}
        //             </PaginationLink>
        //           </PaginationItem>
        //           <PaginationItem>
        //             <PaginationNext
        //               aria-disabled={currentPage === totalPages}
        //               className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
        //               onClick={(e) => {
        //                 e.preventDefault();
        //                 if (currentPage < totalPages) {
        //                   setCurrentPage(currentPage + 1);
        //                 }
        //               }}
        //             />
        //           </PaginationItem>
        //         </PaginationContent>
        //       </Pagination>
        //     </div>
        //   </div>
      }
    </div>
  );
}
