// app/components/auth/RegistroForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UsuarioSchema, UsuarioCrearInput } from '@/app/schemas/usuarioSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RegistroForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<UsuarioCrearInput>({
    resolver: zodResolver(UsuarioSchema)
  });

  const onSubmit = async (data: UsuarioCrearInput) => {
    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Registro exitoso');
        setError(null);
      } else {
        setError(result.error);
        setSuccess(null);
      }
    } catch (error) {
      console.error('Error en el registro', error);
      setError('Error en el registro');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registro de Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input 
              {...register('nombre')}
              placeholder="Ingresa tu nombre" 
            />
            {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
          </div>
          
          <div>
            <Label>Email</Label>
            <Input 
              {...register('email')}
              type="email" 
              placeholder="Ingresa tu email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          
          <div>
            <Label>Contraseña</Label>
            <Input 
              {...register('password')}
              type="password" 
              placeholder="Ingresa tu contraseña"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            
            <Button type="submit" className="w-full">
              Registrarse
            </Button>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                {success}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }