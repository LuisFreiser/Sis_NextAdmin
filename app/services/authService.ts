import bcrypt from 'bcryptjs'; // Importa la biblioteca bcryptjs para el encriptado de contraseñas
import { prisma } from '@/lib/prisma';
import {
  UsuarioSchema,
  UsuarioCrearInput,
  LoginInput,
  LoginSchema,
} from '@/app/schemas/usuarioSchema';

export const authService = {
  async registrar(datos: UsuarioCrearInput) {
    const validado = UsuarioSchema.parse(datos);
    const passwordHash = await bcrypt.hash(validado.password, 10);

    try {
      const usuario = await prisma.usuarios.create({
        data: {
          ...validado,
          password: passwordHash,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          estado: true,
        },
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
    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecta) {
      throw new Error('Credenciales inválidas');
    }

    if (!usuario.estado) {
      throw new Error('Usuario inactivo');
    }

    // await prisma.usuarios.update({
    //   where: { id: usuario.id },
    //   data: { ultimoLogin: new Date() },
    // });

    const { ...usuarioSinPassword } = usuario;

    return usuarioSinPassword;
  },
};
