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
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string;
  bio: string;
  qualifications: string[];
  availability: Record<string, string[]>; // e.g. { '2023-10-26': ['09:00', '10:00'] }
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
