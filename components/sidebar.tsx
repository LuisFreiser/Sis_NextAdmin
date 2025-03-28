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
  Tags,
  BookmarkCheck,
  Box,
  Store,
  ShoppingCart,
  ClipboardList,
  Users,
  FileSearch,
  Settings, // Añadir para Configuración
  Info, // Añadir para Acerca de
  Receipt,
  ChevronLeft,
  ChevronUp,
  Menu,
} from 'lucide-react';

const almacenMenuItems = [
  { icon: Package, label: 'Productos', path: '/productos' },
  { icon: Tags, label: 'Categorias', path: '/categorias' },
  { icon: BookmarkCheck, label: 'Marcas', path: '/marcas' },
  { icon: Box, label: 'Presentación', path: '/presentacion' },
];

const comprasMenuItems = [
  { icon: Store, label: 'Proveedores', path: '' },
  { icon: ShoppingCart, label: 'Registrar Compras', path: '/compras' },
  { icon: ClipboardList, label: 'Consultar Compras', path: '/profile' },
];

const ventasMenuItems = [
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Receipt, label: 'Registrar Ventas', path: '/compras' },
  { icon: FileSearch, label: 'Consultar Ventas', path: '/profile' },
];

const usuariosMenuItems = [{ icon: Users, label: 'Registrar usuarios', path: '/compras' }];

const reportesMenuItems = [
  { icon: Users, label: 'Ventas Diarias', path: '' },
  { icon: Receipt, label: 'Registrar Ventas', path: '/compras' },
  { icon: FileSearch, label: 'Consultar Ventas', path: '/profile' },
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

        <nav className="space-y-4">
          {/* Menu de almacen */}
          <div>
            {isOpen && (
              <p className="text-sm font-medium text-muted-foreground mb-4">MENU PRINCIPAL</p>
            )}
            <Collapsible
              open={activeMenu === 'almacen'}
              onOpenChange={() => handleMenuToggle('almacen')}
              className="transition-all duration-500 ease-in-out"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-stretch space-x-4 px-4">
                  <h4 className="text-lg font-semibold">Almacen</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronUp
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'almacen' && 'rotate-180'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </Button>
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

          {/* Menu de compras */}
          <div>
            <Collapsible
              open={activeMenu === 'compras'}
              onOpenChange={() => handleMenuToggle('compras')}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-stretch space-x-4 px-4">
                  <h4 className="text-lg font-semibold">Compras</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronUp
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'compras' && 'rotate-180'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </Button>
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

          {/* Menu de Ventas */}
          <div>
            <Collapsible
              open={activeMenu === 'ventas'}
              onOpenChange={() => handleMenuToggle('ventas')}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-stretch space-x-4 px-4">
                  <h4 className="text-lg font-semibold mr-4">Ventas</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronUp
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'ventas' && 'rotate-180'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </Button>
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

          {/* Menu de Usuarios */}
          <div>
            <Collapsible
              open={activeMenu === 'usuarios'}
              onOpenChange={() => handleMenuToggle('usuarios')}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-stretch space-x-4 px-4">
                  <h4 className="text-lg font-semibold">Usuarios</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronUp
                        className={cn(
                          'h-4 w-4 transition-transform duration-300',
                          activeMenu !== 'usuarios' && 'rotate-180'
                        )}
                      />

                      <span className="sr-only">Toggle</span>
                    </Button>
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

          {/* Menu de Reportes */}
          <div>
            <Collapsible
              open={activeMenu === 'reportes'}
              onOpenChange={() => handleMenuToggle('reportes')}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-stretch space-x-4 px-4">
                  <h4 className="text-lg font-semibold">Reportes</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronUp
                        className={cn(
                          'h-4 w-4 transition-transform duaration-300',
                          activeMenu !== 'reportes' && 'rotate-180'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </Button>
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

          {/* Menu de soporte */}
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

//Funcion para el sidebar del Mobile
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
        isOpen ? 'w-60' : 'w-[90px]'
      )}
    >
      <SidebarContent />
    </aside>
  );
}
