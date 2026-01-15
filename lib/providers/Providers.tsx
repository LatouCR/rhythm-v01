'use client';

import { ReactNode } from 'react';
import { AudioProvider } from './AudioProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  );
}
