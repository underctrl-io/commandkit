import React, { useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { LoginForm } from './login-form';
import { useAuth } from '@/store/auth.store';

export function ProtectedRoute({ children }: React.PropsWithChildren) {
  const { authenticated, setAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const data = sessionStorage.getItem('authenticated');

      if (data === 'true') {
        setAuthenticated(true);
      }

      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen grid place-items-center">
        <FaSpinner className="size-8 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="h-screen grid place-items-center">
        <LoginForm />
      </div>
    );
  }

  return <>{children}</>;
}
