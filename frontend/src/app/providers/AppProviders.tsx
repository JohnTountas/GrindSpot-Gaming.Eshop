/**
 * Application-level provider composition.
 */
import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/providers/queryClient';

function AppProviders({ children }: PropsWithChildren) {
  // Keep global provider wiring in one place so the Vite entrypoint and the app
  // shell stay focused on rendering, not bootstrapping.
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default AppProviders;
