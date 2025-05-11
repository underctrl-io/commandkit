import { Client } from '@/api/client';
import React, { createContext, use, useState } from 'react';

export interface ClientContext {
  client: Client;
  setClient: React.Dispatch<React.SetStateAction<Client>>;
}

const ClientContext = createContext<ClientContext | null>(null);

export function ClientProvider({ children }: React.PropsWithChildren) {
  const [client, setClient] = useState<Client>(() => new Client());

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient<T extends boolean = boolean>(): Client<T> {
  const context = use(ClientContext);

  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }

  return context.client as Client<T>;
}
