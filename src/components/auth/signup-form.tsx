'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, BriefcaseMedical } from 'lucide-react';

export function SignupForm() {
  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
        <CardDescription>Join eClinic GH to manage your health online.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullname">Full Name</Label>
          <Input id="fullname" placeholder="Kwame Mensah" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="k.mensah@email.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="space-y-3">
            <Label>I am a...</Label>
            <RadioGroup defaultValue="patient" className="grid grid-cols-2 gap-4">
                <div>
                    <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                    <Label
                        htmlFor="patient"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <User className="mb-3 h-6 w-6" />
                        Patient
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                    <Label
                        htmlFor="doctor"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <BriefcaseMedical className="mb-3 h-6 w-6" />
                        Doctor
                    </Label>
                </div>
            </RadioGroup>
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </CardContent>
       <CardFooter className="text-center text-sm">
        <p className="w-full">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary/80 hover:text-primary">
                Log In
            </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
