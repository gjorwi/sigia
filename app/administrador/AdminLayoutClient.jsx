'use client';

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useEffect, useState } from 'react';
import Menu from "@/components/menu";
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const {user, logout} = useAuth();
  const { loading } = useAuthRedirect('administrador');
  const [isMounted, setIsMounted] = useState(false);

  // Add a small delay to prevent flash of unauthorized content
  useEffect(() => {
    // if(user){
    //   if(/usuarios/i.test(pathname)){
    //     if(!user.can_crud_user){
    //       router.replace('/administrador');
    //     }
    //   }
    // }
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Menu />
      <main className="min-h-screen bg-white/98 overflow-hidden relative z-10">
        <div className="relative z-10 min-h-screen mt-16">
          {children}
        </div>
      </main>
    </>
  );
}
