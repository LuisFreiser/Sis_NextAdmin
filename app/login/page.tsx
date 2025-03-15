
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-4 text-center">
          <p>
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" className="text-blue-600 hover:underline">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}