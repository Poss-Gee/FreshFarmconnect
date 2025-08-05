
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Prescription } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrescriptionsPage() {
    const { appUser, loading: authLoading } = useAuth();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    const role = appUser?.role;

    useEffect(() => {
        if (appUser) {
            const fetchPrescriptions = async () => {
                setLoading(true);
                // The orderBy clause combined with a where clause requires a composite index.
                // To avoid this, we will sort the data on the client.
                const prescriptionsQuery = query(
                    collection(db, 'prescriptions'),
                    where(role === 'patient' ? 'patient.uid' : 'doctor.uid', '==', appUser.uid)
                );

                const querySnapshot = await getDocs(prescriptionsQuery);
                const fetchedPrescriptions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Ensure createdAt is a Date object for sorting
                    createdAt: doc.data().createdAt.toDate(),
                } as any)) as Prescription[];

                // Sort the prescriptions by date in descending order (newest first)
                fetchedPrescriptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setPrescriptions(fetchedPrescriptions);
                setLoading(false);
            };
            fetchPrescriptions();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [appUser, authLoading, role]);

    if (authLoading || loading) {
        return <PrescriptionsPageSkeleton role={role} />;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-headline">My Prescriptions</h1>
                {role === 'doctor' && (
                     <Button asChild>
                        <Link href="/prescriptions/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Prescription
                        </Link>
                    </Button>
                )}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Prescription History</CardTitle>
                    <CardDescription>
                        {role === 'patient' 
                            ? "Here is a list of all prescriptions issued to you."
                            : "Here is a list of all prescriptions you have issued."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PrescriptionsTable prescriptions={prescriptions} loading={loading} role={role} />
                </CardContent>
            </Card>
        </div>
    );
}

function PrescriptionsTable({ prescriptions, loading, role }: { prescriptions: Prescription[], loading: boolean, role?: 'patient' | 'doctor' }) {
    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    if (prescriptions.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                <FileText className="h-12 w-12" />
                <p className="text-xl font-medium">No Prescriptions Found</p>
                <p>
                    {role === 'patient' 
                        ? "You don't have any prescriptions yet."
                        : "You haven't issued any prescriptions yet."
                    }
                </p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{role === 'patient' ? 'Doctor' : 'Patient'}</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead className="text-right">Dosage</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {prescriptions.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell className="font-medium">
                            {role === 'patient' ? `Dr. ${p.doctor.name}` : p.patient.name}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{p.medication}</Badge>
                        </TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{p.dosage}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function PrescriptionsPageSkeleton({ role }: { role?: 'patient' | 'doctor'}) {
    return (
        <div className="container mx-auto py-8 animate-pulse">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-64" />
                {role === 'doctor' && <Skeleton className="h-10 w-48" />}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
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
    );
}
