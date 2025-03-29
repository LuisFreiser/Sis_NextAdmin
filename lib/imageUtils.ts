import fs from 'fs';
import path from 'path';

// Función para guardar una imagen desde base64 al sistema de archivos
export async function saveImageFromBase64(
  base64String: string,
  productId: number
): Promise<string> {
  // Verificar si es una cadena base64 válida
  if (!base64String || !base64String.startsWith('data:image')) {
    return '/no-image.png';
  }

  try {
    // Extraer el tipo de imagen y los datos
    const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      console.error('Formato de imagen base64 inválido');
      return '/no-image.png';
    }

    const imageType = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'productos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generar nombre de archivo único basado en ID y timestamp
    const fileName = `producto_${productId}_${Date.now()}.${imageType}`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar el archivo
    fs.writeFileSync(filePath, buffer);

    // Devolver la ruta relativa para guardar en la base de datos
    return `/images/productos/${fileName}`;
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    return '/no-image.png';
  }
}
