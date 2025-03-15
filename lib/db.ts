// lib/db.ts
import { PrismaClient, Prisma } from "@prisma/client";

// Tipo extendido de PrismaClient
type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

// Función de singleton con tipado
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
  });

  // Extensiones con tipado explícito
  const extendedClient = client.$extends({
    model: {
      usuario: {
        // Método tipado para buscar por email
        async findByEmail(
          email: string, 
          select?: Prisma.UsuarioSelect
        ) {
          return client.usuario.findUnique({ 
            where: { email: email.toLowerCase().trim() },
            select
          });
        },
        
        // Método tipado para crear usuario
        async createSecure(
          data: Prisma.UsuarioCreateInput, 
          options?: Prisma.UsuarioCreateArgs
        ) {
          // Sanitización de datos
          const sanitizedData: Prisma.UsuarioCreateInput = {
            ...data,
            email: data.email.toLowerCase().trim(),
          };

          return client.usuario.create({ 
            ...options,
            data: sanitizedData 
          });
        }
      },
      
      producto: {
        // Método tipado para productos en stock
        async findAvailableStock(
          options?: Prisma.ProductoFindManyArgs
        ) {
          return client.producto.findMany({
            ...options,
            where: {
              ...options?.where,
              stock: { gt: 0 }
            }
          });
        }
      }
    }
  });

  // Conexión con manejo de errores
  extendedClient.$connect()
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Conexión a base de datos establecida');
      }
    })
    .catch((error) => {
      console.error('❌ Error de conexión a base de datos:', error);
      process.exit(1);
    });

  return extendedClient;
};

// Declaración global con tipos
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ExtendedPrismaClient | undefined;
}

// Singleton optimizado
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// Solo en desarrollo
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

// Exportación de tipos útiles
export type {
  Usuario,
  Producto,
  Prisma
} from '@prisma/client';