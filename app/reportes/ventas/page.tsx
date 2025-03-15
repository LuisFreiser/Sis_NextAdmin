"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { CalendarDays } from "lucide-react";

export default function ReporteVentas() {
  type Venta = {
    cliente: string;
    producto: string;
    cantidad: number;
    precioTotal: number;
    createdAt: string;
  };

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);

  // Estados separados para controlar cada Popover
  const [isOpenInicio, setIsOpenInicio] = useState(false);
  const [isOpenFin, setIsOpenFin] = useState(false);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [graficoDatos, setGraficoDatos] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "Ingresos por Día",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  });

  const generarReporte = async () => {
    // Tu código de generación de reporte existente
    const response = await fetch("/api/reportes/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaInicio, fechaFin }),
    });

    const data = await response.json();
    setVentas(data.ventas);

    const ventasPorDia = data.ventas.reduce(
      (acc: Record<string, number>, venta: Venta) => {
        const fecha = new Date(venta.createdAt).toLocaleDateString();
        acc[fecha] = (acc[fecha] || 0) + venta.precioTotal;
        return acc;
      },
      {}
    );

    setGraficoDatos({
      labels: Object.keys(ventasPorDia),
      datasets: [
        {
          label: "Ingresos por Día",
          data: Object.values(ventasPorDia),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    });
  };

  const handleDateSelectInicio = (date: Date | undefined) => {
    setFechaInicio(date);
    // Cierra solo el Popover de inicio
    setIsOpenInicio(false);
  };

  const handleDateSelectFin = (date: Date | undefined) => {
    setFechaFin(date);
    // Cierra solo el Popover de fin
    setIsOpenFin(false);
  };

  const calcularIngresosTotales = () => {
    return ventas
      .reduce((total, venta) => total + venta.precioTotal, 0)
      .toFixed(2);
  };

  return (
    <div className="p-4 sm:p-6 w-full mx-auto rounded-lg shadow-lg bg-white">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 text-center sm:text-left">
        Reporte de Ventas
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Fecha de Inicio */}
        <div className="flex items-center">
          <Popover open={isOpenInicio} onOpenChange={setIsOpenInicio}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left"
              >
                {fechaInicio ? (
                  format(fechaInicio, "yyyy-MM-dd")
                ) : (
                  <span className="text-gray-400">Fecha de Inicio</span>
                )}
                <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fechaInicio}
                onSelect={handleDateSelectInicio}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Fecha de Fin */}
        <div className="flex items-center">
          <Popover open={isOpenFin} onOpenChange={setIsOpenFin}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left"
              >
                {fechaFin ? (
                  format(fechaFin, "yyyy-MM-dd")
                ) : (
                  <span className="text-gray-400">Fecha de Fin</span>
                )}
                <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fechaFin}
                onSelect={handleDateSelectFin}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Botón para generar el reporte */}
        <Button onClick={generarReporte}>Generar Reporte</Button>
      </div>

      {/* Tabla y gráficos */}
      {ventas.length > 0 && (
        <div>
          {/* Contenedor para tabla */}
          <div className="overflow-x-auto mb-4">
            <Table className="min-w-full border">
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((venta, index) => (
                  <TableRow key={index}>
                    <TableCell>{venta.cliente}</TableCell>
                    <TableCell>{venta.producto}</TableCell>
                    <TableCell>
                      {new Date(venta.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{venta.cantidad}</TableCell>
                    <TableCell>S/. {venta.precioTotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {/* Fila para el total */}
                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={4} className="text-right">
                    Total:
                  </TableCell>
                  <TableCell>S/. {calcularIngresosTotales()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Contenedor para gráfico */}
          <div className="mt-6">
            <Bar data={graficoDatos} className="w-full h-64 sm:h-96" />
          </div>
        </div>
      )}
    </div>
  );
}
