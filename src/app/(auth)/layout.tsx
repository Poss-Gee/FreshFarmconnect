import { Stethoscope } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <Stethoscope className="h-6 w-6" />
          <span className="text-xl font-bold">eClinic GH</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
