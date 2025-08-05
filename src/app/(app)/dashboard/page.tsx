
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight, Search, UserPlus, Users, Stethoscope, BriefcaseMedical } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { Appointment, AppUser } from '@/lib/types';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const { appUser, loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  const role = appUser?.role || 'patient';
  const name = appUser?.fullName?.split(' ')[0] || 'User';

  useEffect(() => {
    if (appUser) {
      const fetchAppointments = async () => {
        setAppointmentsLoading(true);
        const q = query(
          collection(db, 'appointments'),
          where(role === 'patient' ? 'patient.uid' : 'doctor.uid', '==', appUser.uid),
          where('status', '==', 'upcoming'),
          limit(3)
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
        setAppointments(appts);
        setAppointmentsLoading(false);
      };
      fetchAppointments();
    }
  }, [appUser, role]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {role === 'doctor' ? 'Dr.' : ''} {name}!
          </h1>
          <p className="text-muted-foreground">Here&apos;s a summary of your activities.</p>
        </div>
      </div>

      {role === 'patient' && <PatientDashboardContent />}
      {role === 'doctor' && <DoctorDashboardContent />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="grid gap-2">
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
                {appointmentsLoading ? 'Loading...' : `You have ${appointments.length} appointments coming up.`}
            </CardDescription>
          </div>
          <Button asChild size="sm" className="gap-1">
            <Link href="/appointments">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{role === 'patient' ? 'Doctor' : 'Patient'}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentsLoading ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        <Skeleton className='w-full h-8' />
                    </TableCell>
                </TableRow>
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={role === 'patient' ? appt.doctor.avatarUrl : appt.patient.avatarUrl} />
                          <AvatarFallback>{role === 'patient' ? appt.doctor.name.charAt(0) : appt.patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{role === 'patient' ? appt.doctor.name : appt.patient.name}</p>
                          {role === 'patient' && <p className="text-sm text-muted-foreground">{appt.doctor.specialty}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell>{appt.time}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No upcoming appointments.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientDashboardContent() {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-card">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Stethoscope /> Find a Doctor</CardTitle>
                    <CardDescription>Search for a specialist for your needs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search by name or specialty..." className="pl-10" />
                        </div>
                        <Button className="mt-4 w-full" asChild>
                            <Link href="/doctors">
                                Search Doctors
                            </Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Chats</CardTitle>
                    <CardDescription>Continue your conversations.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">Your recent chats would appear here.</p>
                     <Button className="mt-4 w-full" variant="outline" asChild>
                        <Link href="/chat">
                            Go to Messages
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function DoctorDashboardContent() {
  return (
      <div className="grid md:grid-cols-3 gap-4">
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Users /> My Patients</CardTitle>
                  <CardDescription>Overview of your patient list.</CardDescription>
              </CardHeader>
              <CardContent>
                   <p className="text-3xl font-bold">124</p>
                   <p className="text-sm text-muted-foreground">+5 new this month</p>
                   <Button className="mt-4 w-full" variant="outline" asChild>
                      <Link href="/patients">
                          View All Patients
                      </Link>
                  </Button>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><BriefcaseMedical /> Profile & Availability</CardTitle>
                  <CardDescription>Manage your public profile and schedule.</CardDescription>
              </CardHeader>
              <CardContent>
                   <p className="text-muted-foreground">Keep your information up to date for patients.</p>
                   <Button className="mt-4 w-full" variant="outline">
                      Update Profile
                  </Button>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><UserPlus /> New Patient Requests</CardTitle>
                  <CardDescription>Respond to new appointment requests.</CardDescription>
              </CardHeader>
              <CardContent>
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Pending requests</p>
                   <Button className="mt-4 w-full" variant="outline">
                      Review Requests
                  </Button>
              </CardContent>
          </Card>
      </div>
  )
}


function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-64 mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
           <Skeleton className="h-7 w-48 mb-2" />
           <Skeleton className="h-5 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
