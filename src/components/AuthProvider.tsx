'use client'

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: any;
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}

export { AuthProvider };
