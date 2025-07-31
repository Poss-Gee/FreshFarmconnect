'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight, Search, PlusCircle } from 'lucide-react';
import { APPOINTMENTS, MOCK_USER } from '@/lib/mock-data';
import type { UserRole } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('patient');
  const user = role === 'patient' ? MOCK_USER.patient : MOCK_USER.doctor;

  const upcomingAppointments = APPOINTMENTS.filter(
    (appt) => appt.status === 'upcoming' && (role === 'patient' ? appt.patient.id === user.id : appt.doctor.id === user.id)
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {role === 'doctor' ? 'Dr.' : ''} {user.name.split(' ')[1]}!
          </h1>
          <p className="text-muted-foreground">Here&apos;s a summary of your activities.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="role-switch">Patient View</Label>
          <Switch id="role-switch" checked={role === 'doctor'} onCheckedChange={(checked) => setRole(checked ? 'doctor' : 'patient')} />
          <Label htmlFor="role-switch">Doctor View</Label>
        </div>
      </div>
      
      {role === 'patient' && <PatientDashboardContent />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="grid gap-2">
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              You have {upcomingAppointments.length} appointments coming up.
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
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 3).map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={role === 'patient' ? appt.doctor.avatarUrl : appt.patient.avatarUrl} />
                          <AvatarFallback>{role === 'patient' ? appt.doctor.name.charAt(0) : appt.patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{role === 'patient' ? appt.doctor.name : appt.patient.name}</p>
                          <p className="text-sm text-muted-foreground">{role === 'patient' ? appt.doctor.specialty : ''}</p>
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
                    <CardTitle className="font-headline">Find a Doctor</CardTitle>
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
