//Libreria de zod para validar los datos
import { z } from 'zod';
export const ESTADOS = ['ACTIVO', 'INACTIVO'] as const;

export const UsuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, { message: 'Nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'Nombre no puede exceder 50 caracteres' }),

  email: z.string().email({ message: 'Email inválido' }).toLowerCase(),

  password: z
    .string()
    .min(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message: 'Contraseña debe contener letras y números',
    }),

  rol: z.string({
    required_error: 'Seleccione un Permiso',
    invalid_type_error: 'Permiso inválido',
  }),

  estado: z.enum(ESTADOS).optional().default('ACTIVO'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type UsuarioCrearInput = z.infer<typeof UsuarioSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
