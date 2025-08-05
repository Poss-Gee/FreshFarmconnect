
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Patient {
    uid: string;
    fullName: string;
    email: string; // The patient's email. We can't get this from the appointment. Let's remove it for now.
    avatarUrl?: string;
    lastAppointment?: string;
}

export default function PatientsPage() {
    const { appUser, loading: authLoading } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (appUser && appUser.role === 'doctor') {
            const fetchPatients = async () => {
                setLoading(true);
                const appointmentsQuery = query(
                    collection(db, 'appointments'),
                    where('doctor.uid', '==', appUser.uid)
                );
                const appointmentsSnapshot = await getDocs(appointmentsQuery);
                
                const patientMap = new Map<string, Patient>();

                appointmentsSnapshot.docs.forEach((doc) => {
                    const appointmentData = doc.data();
                    const patientInfo = appointmentData.patient;

                    if (patientInfo && patientInfo.uid) {
                         const existingPatient = patientMap.get(patientInfo.uid);
                        if (existingPatient) {
                            if (new Date(appointmentData.date) > new Date(existingPatient.lastAppointment || 0)) {
                                existingPatient.lastAppointment = appointmentData.date;
                            }
                        } else {
                            patientMap.set(patientInfo.uid, {
                                uid: patientInfo.uid,
                                fullName: patientInfo.name,
                                avatarUrl: patientInfo.avatarUrl,
                                // Email is not available on the denormalized record, which is correct for privacy.
                                // We will omit it from the table.
                                email: 'N/A', 
                                lastAppointment: appointmentData.date, 
                            });
                        }
                    }
                });
                
                const sortedPatients = Array.from(patientMap.values()).sort((a,b) => a.fullName.localeCompare(b.fullName));
                setPatients(sortedPatients);
                setLoading(false);
            };
            fetchPatients();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [appUser, authLoading]);

    if (authLoading || loading) {
        return <PatientsPageSkeleton />;
    }

    if (appUser?.role !== 'doctor') {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">This page is only available for doctors.</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 font-headline">My Patients</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Patients</CardTitle>
                    <CardDescription>
                        A list of all patients who have had appointments with you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PatientsTable patients={patients} loading={loading} />
                </CardContent>
            </Card>
        </div>
    )
}

function PatientsTable({ patients, loading }: { patients: Patient[], loading: boolean }) {
    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }

    if (patients.length === 0) {
        return <div className="text-center py-16 text-muted-foreground">You do not have any patients yet.</div>
    }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Last Appointment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.uid}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={patient.avatarUrl} alt={patient.fullName} />
                  <AvatarFallback>{patient.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-medium">{patient.fullName}</p>
              </div>
            </TableCell>
            <TableCell>
                {patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}) : 'N/A'}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/chat">
                        <MessageSquare className="mr-2 h-4 w-4"/>
                        Message
                    </Link>
                </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PatientsPageSkeleton() {
    return (
        <div className="container mx-auto py-8 animate-pulse">
            <Skeleton className="h-9 w-48 mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-5 w-80 mt-2" />
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
