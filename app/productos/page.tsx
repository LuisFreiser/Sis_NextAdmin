'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
//IMPORTO LAS LIBRERIAS DE JSPDF Y AUTOTABLE PARA IMPRIMIR REPORTES
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

//IMPORTAMOS LA IMAGEN POR DEFECTO
import noImage from '@/public/no-image.jpg';

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

type Producto = {
  id: number;
  codigo_prod: string;
  nombre: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_min: number | null;
  categoriaId: number;
  marcaId: number;
  presentacionId: number | null;
  imagen: string | null;
  estado: string;
  marca: {
    id: number;
    nombre: string;
  };
  categoria: {
    id: number;
    nombre: string;
  };
  presentacion: {
    id: number;
    nombre: string;
  } | null;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    codigo_prod: '',
    nombre: '',
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    stock_min: 0,
    categoriaId: 0,
    marcaId: 0,
    presentacionId: null,
    estado: 'VIGENTE',
    imagen: '/no-image.jpg',
  });
  const [editProducto, setEditProducto] = useState<Partial<Producto> | null>(null);
  const [categorias, setCategorias] = useState<Array<{ id: number; nombre: string }>>([]);
  const [marcas, setMarcas] = useState<Array<{ id: number; nombre: string }>>([]);
  const [presentaciones, setPresentaciones] = useState<Array<{ id: number; nombre: string }>>([]);

  // Estados para el manejo de imágenes
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
          toast.success('Productos cargados exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al obtener los productos');
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

  // FUNICION PARA OBTENER MARCAS, CATEGORIAS Y PRESENTACIONES
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, marcasRes, presentacionesRes] = await Promise.all([
          fetch('/api/categorias'),
          fetch('/api/marcas'),
          fetch('/api/presentacion'),
        ]);

        if (!categoriasRes.ok || !marcasRes.ok || !presentacionesRes.ok) {
          throw new Error('Error al cargar los datos relacionados');
        }

        const [categoriasData, marcasData, presentacionesData] = await Promise.all([
          categoriasRes.json(),
          marcasRes.json(),
          presentacionesRes.json(),
        ]);

        setCategorias(categoriasData);
        setMarcas(marcasData);
        setPresentaciones(presentacionesData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los datos necesarios');
      }
    };

    fetchData();
  }, []);

  // FUNCION PARA CREAR UN NUEVO PRODUCTO
  const handleCrearProducto = async () => {
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.codigo_prod ||
      !nuevoProducto.categoriaId ||
      !nuevoProducto.marcaId
    ) {
      toast.error('Nombre, código, categoría y marca son obligatorios');
      return;
    }

    if (
      !nuevoProducto.precio_compra ||
      !nuevoProducto.precio_venta ||
      Number(nuevoProducto.precio_compra) <= 0 ||
      Number(nuevoProducto.precio_venta) <= 0
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
              precio_compra: 0,
              precio_venta: 0,
              stock: 0,
              stock_min: 0,
              categoriaId: 0,
              marcaId: 0,
              presentacionId: null,
              estado: 'VIGENTE',
              imagen: '/no-image.jpg',
            });
            setPreviewImage(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al crear el producto');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando producto...',
        success: 'Producto creado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  // FUNCION PARA EDITAR LOS PRODUCTOS
  const handleEditarProducto = async () => {
    if (!editProducto) return;

    if (
      !editProducto.nombre ||
      !editProducto.codigo_prod ||
      !editProducto.categoriaId ||
      !editProducto.marcaId
    ) {
      toast.error('Nombre, código, categoría y marca son obligatorios');
      return;
    }

    if (
      !editProducto.precio_compra ||
      !editProducto.precio_venta ||
      Number(editProducto.precio_compra) <= 0 ||
      Number(editProducto.precio_venta) <= 0
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
            reject(data.message || 'Error al actualizar el producto');
          }
        } catch (error) {
          console.error('Error de conexión con el servidor:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando producto...',
        success: 'Producto actualizado exitosamente',
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
      // Validar tamaño de archivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 2MB');
        return;
      }

      // Validar tipo de archivo
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
      // Si no hay archivo seleccionado, usar la imagen por defecto
      const defaultImage = '/no-image.jpg';
      if (isEdit) {
        setEditPreviewImage(defaultImage);
        setEditProducto((prev) => (prev ? { ...prev, imagen: defaultImage } : null));
      } else {
        setPreviewImage(defaultImage);
        setNuevoProducto((prev) => ({ ...prev, imagen: defaultImage }));
      }
    }
  };

  // Filtrado de productos
  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo_prod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const paginatedProductos = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  // FUNCION IMPRIMIR REPORTES
  const handleImprimirReporte = () => {
    const doc = new jsPDF();

    // Configurar el título
    doc.setFontSize(20);
    doc.text('Reporte de Productos', 75, 22);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

    // Preparar los datos para la tabla
    const tableRows = productos.map((producto) => [
      producto.codigo_prod,
      producto.nombre,
      producto.marca.nombre,
      producto.presentacion?.nombre || '-',
      producto.stock,
      producto.precio_compra.toFixed(2),
      producto.precio_venta.toFixed(2),
      producto.estado,
    ]);

    // GENERAR LA TABLA PARA EL PDF
    autoTable(doc, {
      head: [
        ['Código', 'Producto', 'Marca', 'Presentación', 'Stock', 'P.Compra', 'P.Venta', 'Estado'],
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

    // Guardar el PDF
    doc.save('reporte-productos.pdf');
    toast.success('Reporte generado exitosamente');
  };

  //LOADER DE LA PAGINA PRODUCTOS
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        <p>Cargando Productos...</p>
      </div>
    );
  }
  //CUERPO DE LA PAGINA PRODUCTOS
  return (
    <div className="container mx-auto p-4 rounded-lg shadow-lg bg-white dark:bg-slate-900 dark:shadow-slate-700">
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

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4">
                <FilePlus2 /> Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Producto</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Código de Barra"
                  value={nuevoProducto.codigo_prod || ''}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      codigo_prod: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Nombre del Producto"
                  value={nuevoProducto.nombre || ''}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      nombre: e.target.value,
                    })
                  }
                />
                <Select
                  onValueChange={(value) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      categoriaId: value === '0' ? 0 : Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cambiamos el valor vacío por "0" */}
                    {/* <SelectItem value="0"></SelectItem> */}
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      marcaId: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cambiamos el valor vacío por "0" */}
                    <SelectItem value="0">Seleccione una marca</SelectItem>
                    {marcas.map((marca) => (
                      <SelectItem key={marca.id} value={marca.id.toString()}>
                        {marca.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      presentacionId: value === 'null' ? null : Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Presentación" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cambiamos el valor vacío por "null" */}
                    <SelectItem value="null">Sin presentación</SelectItem>
                    {presentaciones.map((presentacion) => (
                      <SelectItem key={presentacion.id} value={presentacion.id.toString()}>
                        {presentacion.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={nuevoProducto.stock || ''}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      stock: Math.max(0, Number(e.target.value)),
                    })
                  }
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Stock Mínimo"
                  value={nuevoProducto.stock_min || ''}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      stock_min: Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio de Compra"
                  value={nuevoProducto.precio_compra || ''}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      precio_compra: Math.max(0, Number(e.target.value)),
                    })
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio de Venta"
                  value={nuevoProducto.precio_venta || ''}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      precio_venta: Math.max(0, Number(e.target.value)),
                    })
                  }
                />

                <Select
                  onValueChange={(value) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      estado: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" defaultValue="VIGENTE" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIGENTE">VIGENTE</SelectItem>
                    <SelectItem value="DESCONTINUADO">DESCONTINUADO</SelectItem>
                  </SelectContent>
                </Select>

                {/*AGREGAMOS EL CAMPO DE IMAGEN Y SU VISTA PREVIA*/}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-base font-medium pl-3">Imagen</label>
                    <Input
                      type="file"
                      className="file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e)}
                    />
                  </div>
                  {previewImage && (
                    <div className="flex items-center justify-center">
                      <Image
                        src={previewImage || noImage}
                        alt={previewImage ? 'Vista previa' : 'Sin imagen'}
                        className="max-h-32 object-contain"
                        width={200}
                        height={200}
                      />
                    </div>
                  )}
                </div>

                <DialogClose asChild>
                  <Button onClick={handleCrearProducto}>Crear Producto</Button>
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

      {/*TABLA DE PRODUCTOS*/}
      <div className="hidden border md:block">
        <Table>
          <TableHeader>
            <TableRow className="h-8 bg-slate-100">
              <TableHead className="py-1">Cod.Barra</TableHead>
              <TableHead className="py-1">Producto</TableHead>
              <TableHead className="py-1">Marca</TableHead>
              <TableHead className="py-1">Presentación</TableHead>
              <TableHead className="py-1">Stock</TableHead>
              <TableHead className="py-1">P.Compra</TableHead>
              <TableHead className="py-1">P.Venta</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProductos.map((producto) => (
              <TableRow key={producto.id} className="h-8">
                <TableCell className="py-1">{producto.codigo_prod}</TableCell>
                <TableCell className="py-1">{producto.nombre}</TableCell>
                <TableCell className="py-1">{producto.marca.nombre}</TableCell>
                <TableCell className="py-1">{producto.presentacion?.nombre || '-'}</TableCell>
                <TableCell className="py-1">{producto.stock}</TableCell>
                <TableCell className="py-1">
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                  }).format(producto.precio_compra)}
                </TableCell>
                <TableCell className="py-1">
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                  }).format(producto.precio_venta)}
                </TableCell>
                <TableCell className="py-1">
                  {/*BOTONES DE EDITAR Y VISTA*/}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        title="Editar Producto"
                        onClick={() => {
                          setEditProducto(producto);
                          setEditPreviewImage(producto.imagen || '/no-image.jpg');
                        }}
                      >
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Editar Producto</DialogTitle>
                      </DialogHeader>
                      {editProducto && (
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Código de Barra"
                            value={editProducto.codigo_prod || ''}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                codigo_prod: e.target.value,
                              })
                            }
                          />
                          <Input
                            placeholder="Nombre del Producto"
                            value={editProducto.nombre || ''}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                nombre: e.target.value,
                              })
                            }
                          />
                          <Select
                            defaultValue={editProducto.categoriaId?.toString()}
                            onValueChange={(value) =>
                              setEditProducto({
                                ...editProducto,
                                categoriaId: Number(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias.map((categoria) => (
                                <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                  {categoria.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            defaultValue={editProducto.marcaId?.toString()}
                            onValueChange={(value) =>
                              setEditProducto({
                                ...editProducto,
                                marcaId: Number(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Marca" />
                            </SelectTrigger>
                            <SelectContent>
                              {marcas.map((marca) => (
                                <SelectItem key={marca.id} value={marca.id.toString()}>
                                  {marca.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            defaultValue={editProducto.presentacionId?.toString() || 'null'}
                            onValueChange={(value) =>
                              setEditProducto({
                                ...editProducto,
                                presentacionId: value === 'null' ? null : Number(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Presentación" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Cambiamos el valor vacío por "null" */}
                              <SelectItem value="null">Sin presentación</SelectItem>
                              {presentaciones.map((presentacion) => (
                                <SelectItem
                                  key={presentacion.id}
                                  value={presentacion.id.toString()}
                                >
                                  {presentacion.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Stock"
                            value={editProducto.stock || ''}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                stock: Math.max(0, Number(e.target.value)),
                              })
                            }
                          />
                          <Input
                            type="number"
                            min="0"
                            placeholder="Stock Mínimo"
                            value={editProducto.stock_min || ''}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                stock_min: Number(e.target.value),
                              })
                            }
                          />
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
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Precio de Venta"
                            value={editProducto.precio_venta || ''}
                            onChange={(e) =>
                              setEditProducto({
                                ...editProducto,
                                precio_venta: Math.max(0, Number(e.target.value)),
                              })
                            }
                          />
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
                              <SelectItem value="VIGENTE">VIGENTE</SelectItem>
                              <SelectItem value="DESCONTINUADO">DESCONTINUADO</SelectItem>
                            </SelectContent>
                          </Select>

                          {/*AGREGAMOS EL CAMPO DE IMAGEN Y SU VISTA PREVIA*/}
                          <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-medium">Imagen del Producto</label>
                              <Input
                                type="file"
                                className="file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, true)}
                              />
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
                            <Button onClick={handleEditarProducto}>Guardar Cambios</Button>
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
