'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { APPOINTMENTS } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AppointmentsPage() {
  const upcomingAppointments = APPOINTMENTS.filter((appt) => appt.status === 'upcoming');
  const pastAppointments = APPOINTMENTS.filter((appt) => appt.status === 'past');

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
              <AppointmentsTable appointments={upcomingAppointments} />
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
              <AppointmentsTable appointments={pastAppointments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppointmentsTable({ appointments }: { appointments: typeof APPOINTMENTS }) {
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
