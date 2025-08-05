
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Doctor } from '@/lib/types';
import { Badge } from './ui/badge';
import { Stethoscope } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center gap-4 p-6">
        <Avatar className="h-16 w-16 border-2 border-primary/50">
          <AvatarImage src={doctor.avatarUrl} alt={doctor.name} data-ai-hint="doctor portrait" />
          <AvatarFallback>{doctor.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold font-headline">{doctor.name}</h3>
          <Badge variant="secondary" className="mt-1 gap-1.5 pl-1.5">
            <Stethoscope className="h-3.5 w-3.5" />
            {doctor.specialty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-grow">
        <p className="text-muted-foreground line-clamp-3">{doctor.bio}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/doctors/${doctor.id}`}>View Profile & Book</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
