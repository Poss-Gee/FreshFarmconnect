
export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
}

export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  // Doctor-specific fields
  doctorID?: string;
  hospital?: string;
  specialty?: string;
  bio?: string;
  qualifications?: string[];
  availability?: Record<string, string[]>;
}

export interface Doctor extends AppUser {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  patient: User;
  doctor: Doctor;
  date: string;
  time: string;
  status: 'upcoming' | 'past' | 'cancelled';
  reason: string;
}

export interface ChatContact {
  id:string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: 'me' | 'them';
}

export interface ChatConversation {
  contact: ChatContact;
  messages: ChatMessage[];
}
