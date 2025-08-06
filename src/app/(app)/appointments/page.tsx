
'use client';

import { Suspense, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, doc, updateDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment, AppUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function AppointmentsPageComponent() {
  const { appUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'upcoming';

  useEffect(() => {
    if (appUser) {
        setLoading(true);
        
        // Firestore rules require separate queries for patient and doctor roles
        // instead of a compound 'OR' query on different fields.
        const patientQuery = query(collection(db, 'appointments'), where('patient.uid', '==', appUser.uid));
        const doctorQuery = query(collection(db, 'appointments'), where('doctor.uid', '==', appUser.uid));

        const patientUnsubscribe = onSnapshot(patientQuery, (snapshot) => {
            updateAppointmentsFromSnapshot(snapshot);
        }, (error) => {
            console.error("Error fetching patient appointments:", error);
            setLoading(false);
        });

        let doctorUnsubscribe = () => {};
        if (appUser.role === 'doctor') {
            doctorUnsubscribe = onSnapshot(doctorQuery, (snapshot) => {
                updateAppointmentsFromSnapshot(snapshot);
            }, (error) => {
                console.error("Error fetching doctor appointments:", error);
                setLoading(false);
            });
        } else {
             setLoading(false);
        }

        const updateAppointmentsFromSnapshot = (snapshot: any) => {
            const newAppointments = snapshot.docs.map((docSnap: any) => ({
                id: docSnap.id,
                ...docSnap.data(),
            } as Appointment));
            
            setAppointments(prev => {
                const appointmentMap = new Map(prev.map(a => [a.id, a]));
                newAppointments.forEach(a => appointmentMap.set(a.id, a));
                const allAppointments = Array.from(appointmentMap.values());
                allAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                return allAppointments;
            });
             setLoading(false);
        };

        return () => {
            patientUnsubscribe();
            doctorUnsubscribe();
        };
    }
  }, [appUser]);

  const upcomingAppointments = appointments.filter((appt) => appt.status === 'upcoming');
  const pastAppointments = appointments.filter((appt) => appt.status === 'past');
  const pendingAppointments = appointments.filter((appt) => appt.status === 'pending');
  const cancelledAppointments = appointments.filter((appt) => appt.status === 'cancelled');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">My Appointments</h1>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`grid w-full ${appUser?.role === 'doctor' ? 'grid-cols-4 md:w-[600px]' : 'grid-cols-3 md:w-[500px]'}`}>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          {appUser?.role === 'doctor' && <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>}
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Here are your scheduled appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsTable appointments={upcomingAppointments} loading={loading} role={appUser?.role} />
            </CardContent>
          </Card>
        </TabsContent>
         {appUser?.role === 'doctor' && (
            <TabsContent value="pending">
            <Card>
                <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>These patients have requested an appointment with you.</CardDescription>
                </CardHeader>
                <CardContent>
                <AppointmentsTable appointments={pendingAppointments} loading={loading} role={appUser?.role} isPending />
                </CardContent>
            </Card>
            </TabsContent>
        )}
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>A history of your previous consultations.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsTable appointments={pastAppointments} loading={loading} role={appUser?.role} />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="cancelled">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Appointments</CardTitle>
              <CardDescription>A history of your cancelled appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsTable appointments={cancelledAppointments} loading={loading} role={appUser?.role} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AppointmentsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AppointmentsPageComponent />
        </Suspense>
    )
}

function AppointmentsTable({ appointments, loading, role, isPending = false }: { appointments: Appointment[], loading: boolean, role?: 'patient' | 'doctor', isPending?: boolean }) {
    const { toast } = useToast();

    const handleRequest = async (appointmentId: string, newStatus: 'upcoming' | 'cancelled') => {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        try {
            await updateDoc(appointmentRef, { status: newStatus });
            toast({
                title: 'Request Updated',
                description: `The appointment has been ${newStatus === 'upcoming' ? 'approved' : 'declined'}.`,
            });
        } catch (error) {
            console.error("Error updating appointment status:", error);
            toast({
                title: 'Update Failed',
                description: 'Could not update the appointment status. Please try again.',
                variant: 'destructive',
            });
        }
    };
    
    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }

    if (appointments.length === 0) {
        return <div className="text-center py-16 text-muted-foreground">No appointments in this category.</div>
    }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{role === 'patient' ? 'Doctor' : 'Patient'}</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">{isPending ? 'Actions' : 'Status'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appt) => (
          <TableRow key={appt.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={role === 'patient' ? appt.doctor.avatarUrl : appt.patient.avatarUrl} alt={role === 'patient' ? appt.doctor.name : appt.patient.name} />
                  <AvatarFallback>{(role === 'patient' ? appt.doctor.name : appt.patient.name).charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{role === 'patient' ? appt.doctor.name : appt.patient.name}</p>
                   {role === 'patient' && <p className="text-sm text-muted-foreground">{appt.doctor.specialty}</p>}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              , {appt.time}
            </TableCell>
            <TableCell>{appt.reason}</TableCell>
            <TableCell className="text-right">
                {isPending ? (
                    <div className="flex gap-2 justify-end">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleRequest(appt.id, 'upcoming')}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleRequest(appt.id, 'cancelled')}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Badge 
                        variant={
                            appt.status === 'upcoming' ? 'default'
                            : appt.status === 'past' ? 'secondary'
                            : appt.status === 'cancelled' ? 'destructive'
                            : 'outline'
                        } 
                        className="capitalize"
                    >
                        {appt.status}
                    </Badge>
                )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

    
