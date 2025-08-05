
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Stethoscope,
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Users,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const patientNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/doctors', icon: Stethoscope, label: 'Find a Doctor' },
  { href: '/appointments', icon: CalendarDays, label: 'Appointments' },
  { href: '/prescriptions', icon: FileText, label: 'Prescriptions' },
  { href: '/chat', icon: MessageSquare, label: 'Messages' },
];

const doctorNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/appointments', icon: CalendarDays, label: 'Appointments' },
    { href: '/prescriptions', icon: FileText, label: 'Prescriptions' },
    { href: '/chat', icon: MessageSquare, label: 'Messages' },
    { href: '/patients', icon: Users, label: 'My Patients' },
]

export default function AppSidebar() {
  const pathname = usePathname();
  const { appUser } = useAuth();
  const role = appUser?.role || 'patient';
  const navItems = role === 'doctor' ? doctorNavItems : patientNavItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-card sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Stethoscope className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">eClinic GH</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                    pathname.startsWith(item.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
