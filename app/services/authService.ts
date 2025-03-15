
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UsuarioSchema, UsuarioCrearInput, LoginInput, LoginSchema } from '@/app/schemas/usuarioSchema';

export const authService = {
  async registrar(datos: UsuarioCrearInput) {
    const validado = UsuarioSchema.parse(datos);
    const passwordHash = await bcrypt.hash(validado.password, 10);

    try {
      const usuario = await prisma.usuario.create({
        data: {
          ...validado,
          password: passwordHash,
          ultimoLogin: null
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true
        }
      });
      
      return usuario;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('P2002')) {
          throw new Error('El email ya está registrado');
        }
      }
      throw error;
    }
  },

  async login(credenciales: LoginInput) {
    const { email, password } = LoginSchema.parse(credenciales);
    const usuario = await prisma.usuario.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);
    
    if (!passwordCorrecta) {
      throw new Error('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new Error('Usuario inactivo');
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() }
    });

    const {...usuarioSinPassword } = usuario;
    
    return usuarioSinPassword;
  }
};