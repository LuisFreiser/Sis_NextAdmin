'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import {
  LayoutDashboard,
  Calendar,
  UserCircle,
  CheckSquare,
  MessageSquare,
  Inbox,
  Receipt,
  Menu,
  ChevronLeft,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/useSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const almacenMenuItems = [
  { icon: LayoutDashboard, label: 'Productos', path: '' },
  { icon: Calendar, label: 'Categorias', path: '/compras' },
  { icon: UserCircle, label: 'Marcas', path: '/profile' },
  { icon: CheckSquare, label: 'Presentacion', path: '/tasks' },
];

const comprasMenuItems = [
  { icon: LayoutDashboard, label: 'Proveedores', path: '' },
  { icon: Calendar, label: 'Registrar Compras', path: '/compras' },
  { icon: UserCircle, label: 'Consultar Compras por Fecha', path: '/profile' },
  { icon: CheckSquare, label: 'Presentacion', path: '/tasks' },
];

const supportMenuItems = [
  { icon: MessageSquare, label: 'Messages', path: '/messages', badge: '5', pro: true },
  { icon: Inbox, label: 'Inbox', path: '/inbox', pro: true },
  { icon: Receipt, label: 'Invoice', path: '/invoice', pro: true },
];

function SidebarContent() {
  const { isOpen, toggle } = useSidebar();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="" className="flex items-center gap-2">
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

        <nav className="space-y-6">
          <div>
            {isOpen && (
              <p className="text-sm font-medium text-muted-foreground mb-4">MENU PRINCIPAL</p>
            )}
            <Collapsible open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <div className="space-y-1">
                <div className="flex items-center justify-stretch space-x-4 px-4">
                  <h4 className="text-sm font-semibold">Almacen</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronUp
                        className={cn(
                          'h-4 w-4 transition-transform',
                          !isDrawerOpen && 'rotate-180'
                        )}
                      />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
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
