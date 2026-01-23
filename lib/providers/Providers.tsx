'use client';

import { ReactNode } from 'react';
import { AudioProvider } from './AudioProvider';
import { useInputInit } from '@/lib/game/input';

function InputInitializer({ children }: { children: ReactNode }) {
  useInputInit();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      <InputInitializer>
        {children}
      </InputInitializer>
    </AudioProvider>
  );
}
