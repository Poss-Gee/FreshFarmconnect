
'use client';

import { use, useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Clock } from 'lucide-react';

const availabilitySchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
});

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must not exceed 500 characters.').optional(),
  qualifications: z.array(z.object({ value: z.string().min(2, 'Qualification is required.') })).optional(),
  availability: z.object({
    '2024-08-12': z.array(availabilitySchema).optional(), // Monday
    '2024-08-13': z.array(availabilitySchema).optional(), // Tuesday
    '2024-08-14': z.array(availabilitySchema).optional(), // Wednesday
    '2024-08-15': z.array(availabilitySchema).optional(), // Thursday
    '2024-08-16': z.array(availabilitySchema).optional(), // Friday
    '2024-08-17': z.array(availabilitySchema).optional(), // Saturday
    '2024-08-18': z.array(availabilitySchema).optional(), // Sunday
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const WEEKDAYS = [
    { key: '2024-08-12', name: 'Monday' },
    { key: '2024-08-13', name: 'Tuesday' },
    { key: '2024-08-14', name: 'Wednesday' },
    { key: '2024-08-15', name: 'Thursday' },
    { key: '2024-08-16', name: 'Friday' },
    { key: '2024-08-17', name: 'Saturday' },
    { key: '2024-08-18', name: 'Sunday' },
];

export default function ProfilePage() {
  const { appUser, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      qualifications: [],
      availability: {},
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'qualifications',
  });

  useEffect(() => {
    if (appUser) {
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', appUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          form.reset({
            bio: data.bio || '',
            qualifications: data.qualifications?.map((q: string) => ({ value: q })) || [],
            availability: data.availability || {},
          });
        }
      };
      fetchProfile();
    }
  }, [appUser, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!appUser) return;
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', appUser.uid);
      
      const availabilityToSave: Record<string, string[]> = {};
      if (data.availability) {
        for (const [day, times] of Object.entries(data.availability)) {
          if (times) {
            availabilityToSave[day] = times.map(t => t.time);
          }
        }
      }

      await updateDoc(userDocRef, {
        bio: data.bio,
        qualifications: data.qualifications?.map(q => q.value),
        availability: availabilityToSave,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ProfilePageSkeleton />;
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
      <h1 className="text-3xl font-bold mb-6 font-headline">Manage Profile</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Update your bio and qualifications that patients will see.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell patients a little about yourself..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label>Qualifications</Label>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`qualifications.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 mt-2">
                        <FormControl>
                          <Input placeholder="e.g., MBChB, University of Ghana" {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ value: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Qualification
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>
                Set your available time slots for each day of the week. This schedule will repeat weekly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {WEEKDAYS.map((day) => (
                <AvailabilityField key={day.key} dayKey={day.key} dayName={day.name} control={form.control} />
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function AvailabilityField({ dayKey, dayName, control }: { dayKey: string, dayName: string, control: any }) {
    const name = `availability.${dayKey}` as const;
    const { fields, append, remove } = useFieldArray({
        control,
        name
    });

    return (
        <div className="space-y-2">
            <Label className="font-semibold text-lg">{dayName}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                 {fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={control}
                        name={`${name}.${index}.time`}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            placeholder="HH:MM"
                                            className="pl-9"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={() => append({ time: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Slot
                </Button>
            </div>
        </div>
    )
}

function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto py-8 animate-pulse">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full mt-2" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
