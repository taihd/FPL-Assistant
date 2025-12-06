import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { AIChat } from './AIChat';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <AIChat />
    </div>
  );
}

