'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to login
        router.push('/');
      } else if (requiredRole && user.tipo !== requiredRole) {
        // User logged in but doesn't have the required role
        router.push('/');
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || (requiredRole && user.tipo !== requiredRole)) {
    return null; // or a loading/error component
  }

  return children;
}
