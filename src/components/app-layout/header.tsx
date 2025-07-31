'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stethoscope,
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Users,
  PanelLeft,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MOCK_USER } from '@/lib/mock-data';

const patientNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/doctors', icon: Stethoscope, label: 'Find a Doctor' },
  { href: '/appointments', icon: CalendarDays, label: 'Appointments' },
  { href: '/chat', icon: MessageSquare, label: 'Messages' },
];

const doctorNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/appointments', icon: CalendarDays, label: 'Appointments' },
    { href: '/chat', icon: MessageSquare, label: 'Messages' },
    { href: '/patients', icon: Users, label: 'My Patients' },
]

export default function Header() {
  const pathname = usePathname();
  // In a real app, role would come from auth context
  const role = pathname.startsWith('/doctor') ? 'doctor' : 'patient';
  const navItems = role === 'doctor' ? doctorNavItems : patientNavItems;
  const user = role === 'doctor' ? MOCK_USER.doctor : MOCK_USER.patient;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">App navigation links</SheetDescription>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Stethoscope className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">eClinic GH</span>
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-2.5 ${
                  pathname.startsWith(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="flex-1">
        {/* Breadcrumbs or page title could go here */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
             <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
