'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoctorCard } from '@/components/doctor-card';
import { DOCTORS } from '@/lib/mock-data';
import { Search } from 'lucide-react';

const specialties = [...new Set(DOCTORS.map((d) => d.specialty))];

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('all');

  const filteredDoctors = DOCTORS.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialty === 'all' || doctor.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Find Your Doctor</h1>
        <p className="text-muted-foreground mt-2">Search for the right specialist to care for your health needs.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-card rounded-lg border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl font-medium">No doctors found</p>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
