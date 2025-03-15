
import { z } from 'zod';

export const ROLES = ['USUARIO', 'ADMIN', 'SUPERVISOR'] as const;

export const UsuarioSchema = z.object({
  nombre: z.string()
    .min(2, { message: "Nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "Nombre no puede exceder 50 caracteres" }),
  
  email: z.string()
    .email({ message: "Email inválido" })
    .toLowerCase(),
  
  password: z.string()
    .min(8, { message: "Contraseña debe tener al menos 8 caracteres" })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 
      { message: "Contraseña debe contener letras y números" }),
  
  rol: z.enum(ROLES).optional().default('USUARIO'),
  activo: z.boolean().optional().default(true)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type UsuarioCrearInput = z.infer<typeof UsuarioSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;