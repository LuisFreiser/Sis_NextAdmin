'use client';

import { useEffect, useState } from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';


export default function DashboardPage() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setShowLogin(true);
  }, []);

  return (
    <main>
      <LoginDialog open={showLogin} />      
    </main>
  );
}
