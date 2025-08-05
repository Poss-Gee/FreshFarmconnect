

export type UserRole = 'patient' | 'doctor';

// Represents the core user data stored in the 'users' collection
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

// A simplified user object, often denormalized/embedded in other documents
export interface EmbeddedUser {
  uid: string;
  name: string;
  avatarUrl?: string;
  specialty?: string; // Only for doctors
}

export interface Doctor extends AppUser {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  patient: EmbeddedUser;
  doctor: EmbeddedUser;
  date: string;
  time: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'pending';
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
  senderId: string;
  deletedBy?: string[]; // Array of UIDs who deleted it for themselves
}

export interface ChatConversation {
  contact: ChatContact;
  messages: ChatMessage[];
}

export interface Prescription {
  id: string;
  patient: EmbeddedUser;
  doctor: EmbeddedUser;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  createdAt: Date; // Stored as a Date object or Firestore Timestamp
}
