'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

interface User {
  userId: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  logout: () => void;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        userId: (session.user as any).userId || session.user.email || 'google_user',
        name: session.user.name || 'User',
        email: session.user.email || '',
        image: session.user.image || '',
      });
    } else {
      setUser(null);
    }
  }, [session, status]);

  const login = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error || 'Login failed');
    }
    
    router.push('/dashboard');
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    // After successful signup, log them in
    await login(email, password);
  };

  const loginWithGoogle = async () => {
    await nextAuthSignIn('google', { callbackUrl: '/dashboard' });
  };

  const forgotPassword = async (email: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data.message;
  };

  const logout = async () => {
    await nextAuthSignOut({ callbackUrl: '/auth' });
  };

  const isDemo = user?.email === 'priya@example.com' || user?.email === 'srkulkarni1969.74@gmail.com';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading: status === 'loading', 
        login, 
        signup, 
        loginWithGoogle, 
        forgotPassword,
        logout, 
        isDemo 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

