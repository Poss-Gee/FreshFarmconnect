import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, CalendarCheck, MessagesSquare, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: <Stethoscope className="h-10 w-10 text-primary" />,
      title: 'Find a Doctor',
      description: 'Easily search for specialized doctors and filter by your needs. Your perfect healthcare provider is just a click away.',
    },
    {
      icon: <CalendarCheck className="h-10 w-10 text-primary" />,
      title: 'Book Appointments',
      description: 'View available time slots and book your appointments seamlessly. Manage your health on your schedule.',
    },
    {
      icon: <MessagesSquare className="h-10 w-10 text-primary" />,
      title: 'Live Chat',
      description: 'Connect with your doctor through secure live chat for consultations and follow-ups, right from your home.',
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: 'Medical Records',
      description: 'Access your medical history and prescriptions anytime, anywhere. Your health information, secured and organized.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">eClinic GH</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              Modern Healthcare for Ghana
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Connect with top doctors, book appointments, and manage your health online with eClinic GH.
              Accessible, reliable, and secure healthcare at your fingertips.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="bg-card py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-headline font-bold">
                Everything You Need for Better Health
              </h3>
              <p className="mt-4 text-muted-foreground">
                Our platform is designed to provide a comprehensive and user-friendly healthcare experience.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-background border-border/50 text-center flex flex-col items-center p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <div className="bg-card rounded-full p-4 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="Doctor consulting patient"
                data-ai-hint="doctor patient"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
              />
            </div>
            <div className="max-w-md">
              <h3 className="text-3xl md:text-4xl font-headline font-bold">
                Trusted by Professionals, Loved by Patients
              </h3>
              <p className="mt-4 text-muted-foreground">
                eClinic GH is built on a foundation of trust and security. We partner with licensed medical professionals to ensure you receive the highest quality care.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold">Verified Doctors:</strong> All doctors on our platform are verified for their credentials and experience.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold">Data Privacy:</strong> Your health data is encrypted and stored securely, compliant with privacy standards.
                  </span>
                </li>
                 <li className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold">24/7 Support:</strong> Our support team is here to help you with any questions or issues you may have.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-card border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} eClinic GH. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
             <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
             <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}