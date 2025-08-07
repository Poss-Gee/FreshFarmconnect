
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import type { AppUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const prescriptionSchema = z.object({
  patientUid: z.string().min(1, 'Please select a patient.'),
  medication: z.string().min(2, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required (e.g., 500mg).'),
  frequency: z.string().min(1, 'Frequency is required (e.g., Twice a day).'),
  duration: z.string().min(1, 'Duration is required (e.g., 7 days).'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

export default function NewPrescriptionPage() {
  const { appUser, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientUid: '',
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
    }
  });

  useEffect(() => {
    if (appUser && appUser.role === 'doctor') {
      const fetchPatients = async () => {
        setLoading(true);
        // Fetch all appointments for this doctor to find unique patients
        const appointmentsQuery = query(collection(db, 'appointments'), where('doctor.uid', '==', appUser.uid));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        const patientUids = new Set<string>();
        appointmentsSnapshot.forEach(doc => {
          patientUids.add(doc.data().patient.uid);
        });

        if (patientUids.size > 0) {
          const patientsQuery = query(collection(db, 'users'), where('uid', 'in', Array.from(patientUids)));
          const patientsSnapshot = await getDocs(patientsQuery);
          const fetchedPatients = patientsSnapshot.docs.map(doc => doc.data() as AppUser);
          setPatients(fetchedPatients);
        }
        setLoading(false);
      };
      fetchPatients();
    }
  }, [appUser]);

  const onSubmit = async (data: PrescriptionFormData) => {
    if (!appUser) return;
    setIsSubmitting(true);
    
    const selectedPatient = patients.find(p => p.uid === data.patientUid);
    if (!selectedPatient) {
        toast({ title: 'Error', description: 'Selected patient not found.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }

    try {
        await addDoc(collection(db, 'prescriptions'), {
            patient: {
                uid: selectedPatient.uid,
                name: selectedPatient.fullName,
                avatarUrl: selectedPatient.avatarUrl || '',
            },
            doctor: {
                uid: appUser.uid,
                name: appUser.fullName,
                avatarUrl: appUser.avatarUrl || '',
            },
            medication: data.medication,
            dosage: data.dosage,
            frequency: data.frequency,
            duration: data.duration,
            notes: data.notes,
            createdAt: serverTimestamp(),
        });
        toast({
            title: 'Prescription Issued',
            description: `A new prescription has been created for ${selectedPatient.fullName}.`,
        });
        router.push('/prescriptions');

    } catch (error) {
        console.error('Error issuing prescription:', error);
        toast({
            title: 'Submission Failed',
            description: 'Something went wrong. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 animate-pulse">
        <Skeleton className="h-9 w-80 mb-6" />
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-5 w-96 mt-2" />
            </CardHeader>
            <CardContent className="space-y-8 mt-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
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
      <h1 className="text-3xl font-bold mb-6 font-headline">New Prescription</h1>
      <Card>
        <CardHeader>
          <CardTitle>Issue a New Prescription</CardTitle>
          <CardDescription>Fill out the form below to create a prescription for your patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientUid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={patients.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={patients.length > 0 ? "Select a patient" : "You have no patients yet"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={patient.uid} value={patient.uid}>
                            {patient.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="medication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Amoxicillin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2 times a day" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., For 7 days" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Take with food. Finish the entire course." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Issuing...' : 'Issue Prescription'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
