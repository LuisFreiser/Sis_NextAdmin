
import { RegistroForm } from '@/components/auth/RegistroForm';
import Link from 'next/link';

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <RegistroForm />
        <div className="mt-4 text-center">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

