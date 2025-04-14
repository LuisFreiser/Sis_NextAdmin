'use client';

import Image from 'next/image';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleTheme } from './theme/toggle-theme';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { isOpen, isMobile } = useSidebar();

  return (
    <header
      className={cn(
        'h-16 border-b fixed top-0 right-0 bg-background z-10 transition-all duration-300',
        isMobile ? 'left-0' : isOpen ? 'left-56' : 'left-[90px]'
      )}
    >
      <div className="h-full flex items-center justify-between px-6">
        <div className="grid gap-0">
          <span className="font-extrabold text-3xl leading-none">FARMALAB SAC</span>
          <span className="text-sm font-semibold">RUC:27283920192</span>
        </div>

        <div className="flex items-center gap-4">
          <ToggleTheme />
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User"
                  width={32}
                  height={32}
                  referrerPolicy="no-referrer"
                  priority
                  className="w-8 h-8 rounded-full"
                />
                <span>Administrador</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
