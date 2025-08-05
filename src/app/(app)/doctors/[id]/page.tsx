
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Check, Stethoscope } from 'lucide-react';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Doctor, AppUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DoctorProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingReason, setBookingReason] = useState('');


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

  const handleBookingConfirmation = async () => {
    if (!appUser || !doctor || !selectedDate || !selectedTime || !bookingReason) {
      toast({
        title: 'Booking Error',
        description: 'Please ensure you are logged in and have selected a date, time, and provided a reason.',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patient: {
          uid: appUser.uid,
          name: appUser.fullName,
          ref: doc(db, 'users', appUser.uid),
        },
        doctor: {
          uid: doctor.uid,
          name: doctor.fullName,
          ref: doc(db, 'users', doctor.uid),
        },
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        reason: bookingReason,
        status: 'upcoming',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with Dr. ${doctor.name.split(' ').pop()} is confirmed.`,
      });
      setIsConfirming(false);
      setBookingReason('');
      setSelectedTime(null);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Booking Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };


  if (loading) {
    return <DoctorProfileSkeleton />;
  }

  if (!doctor) {
    notFound();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAvailableTimes = (date: Date | undefined): string[] => {
    if (!date || !doctor?.availability) return [];
    // Format date as YYYY-MM-DD to match the key in Firestore
    const dateString = date.toISOString().split('T')[0];
    return doctor.availability[dateString] || [];
  };
  
  const availableTimes = getAvailableTimes(selectedDate);

  const isDateDisabled = (date: Date) => {
    if (date < today) return true;
    if (!doctor?.availability) return true;
    const dateString = date.toISOString().split('T')[0];
    const slots = doctor.availability[dateString];
    return !slots || slots.length === 0;
  }

  return (
    <>
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
                    onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                    }}
                    disabled={isDateDisabled}
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
                      <Button className="w-full mt-4" size="lg" onClick={() => setIsConfirming(true)} disabled={appUser?.role === 'doctor'}>
                          {appUser?.role === 'doctor' ? 'Doctors cannot book' : `Book for ${selectedTime}`}
                      </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Appointment</DialogTitle>
            <DialogDescription>
              You are booking an appointment with <span className="font-bold">{doctor.name}</span> on {' '}
              <span className="font-bold">{selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span> at {' '}
              <span className="font-bold">{selectedTime}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="text-right">
              Reason for Appointment
            </Label>
            <Textarea
              id="reason"
              value={bookingReason}
              onChange={(e) => setBookingReason(e.target.value)}
              className="mt-2"
              placeholder="Please briefly describe the reason for your visit..."
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleBookingConfirmation} disabled={isBooking || !bookingReason}>
              {isBooking ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
