import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'denied'>('loading');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setStatus('denied');
      return;
    }

    // Verify the admin token is still valid
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) setStatus('authenticated');
        else {
          localStorage.removeItem('admin_token');
          setStatus('denied');
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
        setStatus('denied');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Verifying admin access…</span>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
