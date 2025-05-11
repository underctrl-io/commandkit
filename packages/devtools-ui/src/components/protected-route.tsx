import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { LoginForm } from './login-form';
import { useAuth } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useClient } from '@/context/client-context';

export function ProtectedRoute({ children }: React.PropsWithChildren) {
  const { authenticated, setAuthenticated } = useAuth();
  const client = useClient();

  const { isLoading, isError } = useQuery({
    queryKey: [],
    enabled: !authenticated,
    queryFn: async () => {
      const user = await client.fetchMe();

      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }

      return user;
    },
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="h-screen grid place-items-center">
        <FaSpinner className="size-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen grid place-items-center">
        <h1 className="text-2xl text-red-500">
          An error occurred while fetching user data.
        </h1>
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
