'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { DOCTORS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Check, Stethoscope } from 'lucide-react';

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const doctor = DOCTORS.find((d) => d.id === params.id);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date('2024-08-15'));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!doctor) {
    notFound();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAvailableTimes = (date: Date | undefined): string[] => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return doctor.availability[dateString] || [];
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
                {doctor.qualifications.map((q, i) => (
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
                  disabled={(date) => date < today || !doctor.availability[date.toISOString().split('T')[0]]?.length}
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
