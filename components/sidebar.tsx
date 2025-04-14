'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/useSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// Actualizar las importaciones de iconos
import {
  Package,
  BookmarkCheck,
  Store,
  ShoppingCart,
  ClipboardList,
  Users,
  FileSearch,
  Settings, // Añadir para Configuración
  Info, // Añadir para Acerca de
  Receipt,
  ChevronLeft,
  ChevronDown,
  Menu,
} from 'lucide-react';

const almacenMenuItems = [
  { icon: Package, label: 'Productos', path: '/productos' },
  { icon: BookmarkCheck, label: 'Marcas', path: '/marcas' },
];

const comprasMenuItems = [
  { icon: Store, label: 'Proveedores', path: '/proveedores' },
  { icon: ShoppingCart, label: 'Registrar Compras', path: '/compras' },
  { icon: ClipboardList, label: 'Consultar Compras', path: '/profile' },
];

const ventasMenuItems = [
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Receipt, label: 'Registrar Ventas', path: '/compras' },
  { icon: FileSearch, label: 'Consultar Ventas', path: '/profile' },
];

const usuariosMenuItems = [{ icon: Users, label: 'Registrar usuarios', path: '/registroUsuario' }];

const reportesMenuItems = [
  { icon: Users, label: 'Ventas Diarias', path: '' },
  { icon: Receipt, label: 'Registrar Ventas', path: '/compras' },
  { icon: FileSearch, label: 'Consultar Ventas', path: '/profile' },
];

const documentosMenuItems = [
  { icon: Users, label: 'Tipo Documento', path: '/tipoDocumento' },
  { icon: Receipt, label: 'Tipo Comprobante', path: '/tipoComprobante' },
  { icon: FileSearch, label: 'Serie Comprobante', path: '/serieComprobante' },
];

const supportMenuItems = [
  { icon: Settings, label: 'Configuración', path: '/messages' },
  { icon: Info, label: 'Acerca de', path: '/inbox' },
];

function SidebarContent() {
  const { isOpen, toggle } = useSidebar();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuToggle = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            {isOpen && <span className="font-semibold text-xl">NextAdmin</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className=" ml-2 h-8 w-12 lg:flex hidden"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', !isOpen && 'rotate-180')} />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        <nav className="space-y-4 space-x-2">
          {/* MENU PRINCIPAL */}
          <div>
            {isOpen && (
              <p className="text-sm font-medium text-muted-foreground mb-4">MENU PRINCIPAL</p>
            )}
          </div>

          {/* MENU DE VENTAS */}
          <div>
            <Collapsible
              open={activeMenu === 'ventas'}
              onOpenChange={() => handleMenuToggle('ventas')}
            >
              <div className="space-y-1">
                <div
                  className={cn(
                    'flex justify-between',
                    activeMenu === 'ventas' && 'bg-slate-200 dark:bg-slate-800 rounded-sm'
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lg font-semibold hover:bg-transparent dark:hover:bg-transparent"
                    >
                      Ventas
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleTrigger asChild>
                    <span className="my-auto">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'ventas' && 'rotate-90'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {ventasMenuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-2',
                          !isOpen && 'justify-center px-2',
                          item.path === '/pages' && 'text-primary'
                        )}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        {isOpen && <span>{item.label}</span>}
                        {!isOpen && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* MENU DE COMPRAS */}
          <div>
            <Collapsible
              open={activeMenu === 'compras'}
              onOpenChange={() => handleMenuToggle('compras')}
            >
              <div className="space-y-1">
                <div
                  className={cn(
                    'flex justify-between',
                    activeMenu === 'compras' && 'bg-slate-200 dark:bg-slate-800 rounded-sm'
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lg font-semibold hover:bg-transparent dark:hover:bg-transparent"
                    >
                      Compras
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleTrigger asChild>
                    <span className="my-auto">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'compras' && 'rotate-90'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {comprasMenuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-2',
                          !isOpen && 'justify-center px-2',
                          item.path === '/pages' && 'text-primary'
                        )}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        {isOpen && <span>{item.label}</span>}
                        {!isOpen && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* MENU DE ALMACENES */}
          <div>
            <Collapsible
              open={activeMenu === 'almacen'}
              onOpenChange={() => handleMenuToggle('almacen')}
              className="transition-all duration-500 ease-in-out"
            >
              <div className="space-y-1">
                <div
                  className={cn(
                    'flex justify-between',
                    activeMenu === 'almacen' && 'bg-slate-200 dark:bg-slate-800 rounded-sm'
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lg font-semibold hover:bg-transparent dark:hover:bg-transparent"
                    >
                      Almacen
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleTrigger asChild>
                    <span className="my-auto">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'almacen' && 'rotate-90'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="transition-all duration-500 ease-in-out">
                  {almacenMenuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-2',
                          !isOpen && 'justify-center px-2',
                          item.path === '/pages' && 'text-primary'
                        )}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        {isOpen && <span>{item.label}</span>}
                        {!isOpen && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* MENU DE USUARIOS */}
          <div>
            <Collapsible
              open={activeMenu === 'usuarios'}
              onOpenChange={() => handleMenuToggle('usuarios')}
            >
              <div className="space-y-1">
                <div
                  className={cn(
                    'flex justify-between',
                    activeMenu === 'usuarios' && 'bg-slate-200 dark:bg-slate-800 rounded-sm'
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lg font-semibold hover:bg-transparent dark:hover:bg-transparent"
                    >
                      Usuarios
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleTrigger asChild>
                    <span className="my-auto">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'usuarios' && 'rotate-90'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {usuariosMenuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-2',
                          !isOpen && 'justify-center px-2',
                          item.path === '/pages' && 'text-primary'
                        )}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        {isOpen && <span>{item.label}</span>}
                        {!isOpen && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* MENU DE REPORTES */}
          <div>
            <Collapsible
              open={activeMenu === 'reportes'}
              onOpenChange={() => handleMenuToggle('reportes')}
            >
              <div className="space-y-1">
                <div
                  className={cn(
                    'flex justify-between',
                    activeMenu === 'reportes' && 'bg-slate-200 dark:bg-slate-800 rounded-sm'
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lg font-semibold hover:bg-transparent dark:hover:bg-transparent"
                    >
                      Reportes
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleTrigger asChild>
                    <span className="my-auto">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'reportes' && 'rotate-90'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {reportesMenuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-2',
                          !isOpen && 'justify-center px-2',
                          item.path === '/pages' && 'text-primary'
                        )}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        {isOpen && <span>{item.label}</span>}
                        {!isOpen && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* MENU DE DOCUMENTOS */}
          <div>
            <Collapsible
              open={activeMenu === 'documentos'}
              onOpenChange={() => handleMenuToggle('documentos')}
            >
              <div className="space-y-1">
                <div
                  className={cn(
                    'flex justify-between',
                    activeMenu === 'documentos' && 'bg-slate-200 dark:bg-slate-800 rounded-sm'
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lg font-semibold hover:bg-transparent dark:hover:bg-transparent"
                    >
                      Administrador
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleTrigger asChild>
                    <span className="my-auto">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'documentos' && 'rotate-90'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {documentosMenuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-2',
                          !isOpen && 'justify-center px-2',
                          item.path === '/pages' && 'text-primary'
                        )}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        {isOpen && <span>{item.label}</span>}
                        {!isOpen && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* MENU DE SOPORTE */}
          <div>
            {isOpen && <p className="text-sm font-medium text-muted-foreground mb-4">SOPORTE</p>}
            <div className="space-y-1">
              {supportMenuItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={cn('w-full justify-start gap-2', !isOpen && 'justify-center px-2')}
                  >
                    <item.icon className="w-6 h-6 shrink-0" />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                      </>
                    )}
                    {!isOpen && <span className="sr-only">{item.label}</span>}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

//FUNCION PARA MOSTRAR EL SIDEBAR EN MOVIL
export function AppSidebar() {
  const { isOpen, isMobile, toggle } = useSidebar();

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-50"
          onClick={toggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Sheet open={isOpen} onOpenChange={toggle}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    //AQUI CONSTROLO EL SIDEBAR SU ANCHO AL ABRIR Y CERRAR
    <aside
      className={cn(
        'h-screen fixed top-0 border-r bg-background transition-all duration-300',
        isOpen ? 'w-56' : 'w-[90px]'
      )}
    >
      <SidebarContent />
    </aside>
  );
}
