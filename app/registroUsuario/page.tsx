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
  UserPlus,
  FilePenLine,
  Search,
  UserCog,
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
// Primero, importa los iconos necesarios (agregar junto a los otros imports de lucide-react)
import { Eye, EyeOff } from 'lucide-react';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
};

export default function RegistroUsuarioPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoUsuario, setNuevoUsuario] = useState<Partial<Usuario>>({
    nombre: '',
    email: '',
    rol: 'USUARIO',
    estado: 'ACTIVO',
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editUsuario, setEditUsuario] = useState<Partial<Usuario> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('/api/auth/registro');
        if (response.ok) {
          const data = await response.json();
          setUsuarios(data);
          toast.success('Usuarios cargados exitosamente');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al obtener los usuarios');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleCrearUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...nuevoUsuario, password }),
          });

          const data = await response.json();

          if (response.ok) {
            setUsuarios((prev) => [...prev, data]);
            setNuevoUsuario({ nombre: '', email: '', rol: 'USUARIO', estado: 'ACTIVO' });
            setPassword('');
            resolve('success');
          } else {
            reject(data.message || 'Error al crear el usuario');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Creando usuario...',
        success: 'Usuario creado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const handleEditarUsuario = async () => {
    if (!editUsuario) return;

    if (!editUsuario.nombre || !editUsuario.email) {
      toast.error('El nombre y email son obligatorios');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/auth/registro', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editUsuario),
          });

          const data = await response.json();

          if (response.ok) {
            setUsuarios((prev) => prev.map((u) => (u.id === editUsuario.id ? data : u)));
            setEditUsuario(null);
            resolve('success');
          } else {
            reject(data.message || 'Error al actualizar el usuario');
          }
        } catch (error) {
          console.error('Error:', error);
          reject('Error de conexión con el servidor');
        }
      }),
      {
        loading: 'Actualizando usuario...',
        success: 'Usuario actualizado exitosamente',
        error: (err) => `${err}`,
      }
    );
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsuarios = filteredUsuarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  if (loading) {
    return (
      <div className="container mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground">Cargando Usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-[83rem] mt-4 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 dark:shadow-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Registro de Usuarios</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-5">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Usuarios</span>
            <ChevronRight className="w-4 h-4" />
            <span>Registro de Usuarios</span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4 font-semibold">
              <UserPlus /> Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <UserCog className="inline mr-2" />
                Registrar Usuario
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <label className="text-sm font-medium">
                Nombre
                <Input
                  placeholder="Nombre completo"
                  value={nuevoUsuario.nombre || ''}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      nombre: e.target.value,
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Email
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={nuevoUsuario.email || ''}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      email: e.target.value,
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Contraseña
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </label>
              <label className="text-sm font-medium">
                Rol
                <Select
                  defaultValue="USUARIO"
                  onValueChange={(value) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      rol: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="USUARIO">Usuario</SelectItem>
                    <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="text-sm font-medium">
                Estado
                <Select
                  defaultValue="ACTIVO"
                  onValueChange={(value) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
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
                <Button className="font-semibold" onClick={handleCrearUsuario}>
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
          id="searchUsuario"
          name="searchUsuario"
          placeholder="Buscar por nombre o email..."
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
              <TableHead className="py-1">Nombre</TableHead>
              <TableHead className="py-1">Email</TableHead>
              <TableHead className="py-1">Rol</TableHead>
              <TableHead className="py-1">Estado</TableHead>
              <TableHead className="py-1">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsuarios.map((usuario) => (
              <TableRow
                key={usuario.id}
                className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
              >
                <TableCell>{usuario.id}</TableCell>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.rol}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.estado === 'ACTIVO'
                        ? 'bg-green-600 text-gray-100'
                        : 'bg-gray-600 text-gray-100'
                    }`}
                  >
                    {usuario.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" onClick={() => setEditUsuario(usuario)}>
                        <FilePenLine />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          <FilePenLine className="inline mr-2" />
                          Editar Usuario
                        </DialogTitle>
                      </DialogHeader>
                      {editUsuario && (
                        <div className="grid gap-4">
                          <label className="text-sm font-medium">
                            Nombre
                            <Input
                              placeholder="Nombre completo"
                              value={editUsuario.nombre || ''}
                              onChange={(e) =>
                                setEditUsuario({
                                  ...editUsuario,
                                  nombre: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Email
                            <Input
                              type="email"
                              placeholder="correo@ejemplo.com"
                              value={editUsuario.email || ''}
                              onChange={(e) =>
                                setEditUsuario({
                                  ...editUsuario,
                                  email: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Rol
                            <Select
                              defaultValue={editUsuario.rol}
                              onValueChange={(value) =>
                                setEditUsuario({
                                  ...editUsuario,
                                  rol: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="USUARIO">Usuario</SelectItem>
                                <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                          <label className="text-sm font-medium">
                            Estado
                            <Select
                              defaultValue={editUsuario.estado}
                              onValueChange={(value) =>
                                setEditUsuario({
                                  ...editUsuario,
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
                            <Button className="font-semibold" onClick={handleEditarUsuario}>
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
