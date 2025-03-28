'use client';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

import {
  LayoutGrid,
  Boxes,
  ShoppingBag,
  FileText,
  Tags,
  Gift,
  Users,
  Settings,
  BarChart,
  UserCog,
  Database,
  Home,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-3">
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary">Settings</span>
        </div>
      </div>

      {/* Sección de Enlaces Rapidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <LayoutGrid className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">POS</CardTitle>
          </CardContent>
        </Card>

        <Link href="/productos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Boxes className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <ShoppingBag className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Facturas abiertas</CardTitle>
          </CardContent>
        </Card>

        <Link href="/categorias">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Tags className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Gift className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Tarjeta de regalo</CardTitle>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Configuración</CardTitle>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <BarChart className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Reportes</CardTitle>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <UserCog className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Database className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
          </CardContent>
        </Card>
      </div>

      {/* SECCION DE GRAFICOS */}
    </div>
  );
}
