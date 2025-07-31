'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="k.mensah@email.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="ml-auto inline-block text-sm underline text-primary/80 hover:text-primary">
              Forgot your password?
            </Link>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Log In
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Google
        </Button>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p className="w-full">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-primary/80 hover:text-primary">
                Sign up
            </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
