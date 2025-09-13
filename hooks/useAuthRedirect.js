'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthRedirect(requiredRole = null, redirectTo = '/') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If no user is logged in, redirect to login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If a role is required and the user doesn't have it, redirect
    if (requiredRole && user.tipo !== requiredRole) {
      router.push(redirectTo);
    }
  }, [user, loading, requiredRole, router, redirectTo]);

  return { user, loading };
}
