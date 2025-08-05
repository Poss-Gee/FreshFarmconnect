
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Check, Stethoscope } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDoctor = async () => {
        setLoading(true);
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === 'doctor') {
          const data = docSnap.data();
          setDoctor({
            id: docSnap.id,
            uid: data.uid,
            name: data.fullName,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            specialty: data.specialty,
            hospital: data.hospital,
            avatarUrl: data.avatarUrl || `https://placehold.co/128x128.png?text=${data.fullName.charAt(0)}`,
            bio: data.bio || 'No biography provided.',
            qualifications: data.qualifications || ['No qualifications listed.'],
            availability: data.availability || {},
          });
        } else {
          notFound();
        }
        setLoading(false);
      };
      fetchDoctor();
    }
  }, [id]);

  if (loading) {
    return <DoctorProfileSkeleton />;
  }

  if (!doctor) {
    notFound();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAvailableTimes = (date: Date | undefined): string[] => {
    if (!date) return [];
    // Format date as YYYY-MM-DD to match the key in Firestore
    const dateString = date.toISOString().split('T')[0];
    return doctor.availability?.[dateString] || [];
  };
  
  const availableTimes = getAvailableTimes(selectedDate);

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6 text-center">
              <Image
                src={doctor.avatarUrl}
                alt={doctor.name}
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4 border-4 border-primary/40 shadow-lg"
                data-ai-hint="doctor portrait"
              />
              <h1 className="text-2xl font-bold font-headline">{doctor.name}</h1>
              <Badge variant="secondary" className="mt-2 gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {doctor.specialty}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>About Dr. {doctor.name.split(' ').pop()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{doctor.bio}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                {doctor.qualifications?.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Book an Appointment</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < today || !doctor.availability?.[date.toISOString().split('T')[0]]?.length}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">
                  Available Slots for {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
                </h3>
                {selectedDate && availableTimes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No available slots for this day. Please select another date.</p>
                )}
                 {selectedTime && (
                    <Button className="w-full mt-4" size="lg">
                        Confirm Booking for {selectedTime}
                    </Button>
                 )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DoctorProfileSkeleton() {
  return (
    <div className="container mx-auto py-8 animate-pulse">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-6 w-32 mx-auto" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-7 w-32" /></CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader><Skeleton className="h-8 w-64" /></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-md" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
