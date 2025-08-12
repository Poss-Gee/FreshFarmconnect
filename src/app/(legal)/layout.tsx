
import { Stethoscope } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
       <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">HealthLink Hub</h1>
        </Link>
         <Button asChild variant="outline">
            <Link href="/">
                Back to Home
            </Link>
         </Button>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-4xl mx-auto bg-card p-8 rounded-lg">
            {children}
        </div>
      </main>
       <footer className="bg-card border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} HealthLink Hub. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
             <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
             <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
