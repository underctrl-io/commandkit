import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth.store';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useClient } from '@/context/client-context';
import Loader from './loader';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const { setAuthenticated } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const client = useClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return client.login(username, password);
    },
    onError() {
      toast.error('Invalid credentials', {
        description: 'The credentials you provided are invalid.',
      });
    },
    onSuccess() {
      toast.success('Login successful', {
        description: 'You have successfully logged in.',
      });
      setAuthenticated(true);
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className={cn('flex flex-col gap-6 w-[20%]', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials below to proceed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                mutate();
              }}
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
