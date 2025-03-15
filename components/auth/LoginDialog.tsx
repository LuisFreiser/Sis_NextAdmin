'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from './LoginForm';
import { useRouter } from 'next/navigation';

interface LoginDialogProps {
  open?: boolean;
}

export function LoginDialog({ open }: LoginDialogProps) {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Iniciar Sesión</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales para acceder al sistema
          </DialogDescription>
        </DialogHeader>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </DialogContent>
    </Dialog>
  );
}
