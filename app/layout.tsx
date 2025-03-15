import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SidebarProvider } from '@/hooks/useSidebar';
import { AppSidebar } from '@/components/sidebar';
import { AppHeader } from '@/components/header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js Admin Dashboard',
  description: 'A modern admin dashboard built with Next.js 14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="min-h-screen">
              <AppSidebar />
              <div className="lg:pl-64 transition-all duration-300">
                <AppHeader />
                <main className="pt-16">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
