
'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppointmentsPage() {
  const { appUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appUser) {
      const fetchAppointments = async () => {
        setLoading(true);
        const q = query(
          collection(db, 'appointments'),
          where(appUser.role === 'patient' ? 'patient.uid' : 'doctor.uid', '==', appUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const appts: Appointment[] = [];
        const doctorPromises: Promise<any>[] = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const doctorRef = data.doctor.ref;
             doctorPromises.push(getDocs(query(collection(db, "users"), where("uid", "==", doctorRef.id))).then(snap => {
                const doctorData = snap.docs[0].data();
                 const appointment: Appointment = {
                    id: doc.id,
                    patient: data.patient,
                    doctor: {
                        ...doctorData,
                        id: doctorData.uid,
                        name: doctorData.fullName,
                    } as any,
                    date: data.date,
                    time: data.time,
                    status: data.status,
                    reason: data.reason
                };
                appts.push(appointment);
            }))
        });

        await Promise.all(doctorPromises);
        setAppointments(appts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
      };
      fetchAppointments();
    }
  }, [appUser]);

  const upcomingAppointments = appointments.filter((appt) => appt.status === 'upcoming');
  const pastAppointments = appointments.filter((appt) => appt.status === 'past');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">My Appointments</h1>
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Here are your scheduled appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsTable appointments={upcomingAppointments} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>A history of your previous consultations.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsTable appointments={pastAppointments} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppointmentsTable({ appointments, loading }: { appointments: Appointment[], loading: boolean }) {
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
          <TableHead>Doctor</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appt) => (
          <TableRow key={appt.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={appt.doctor.avatarUrl} alt={appt.doctor.name} />
                  <AvatarFallback>{appt.doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{appt.doctor.name}</p>
                  <p className="text-sm text-muted-foreground">{appt.doctor.specialty}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              , {appt.time}
            </TableCell>
            <TableCell>{appt.reason}</TableCell>
            <TableCell className="text-right">
              <Badge variant={appt.status === 'upcoming' ? 'default' : 'outline'} className="capitalize">
                {appt.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
