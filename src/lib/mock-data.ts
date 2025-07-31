import type { Doctor, Appointment, ChatContact, ChatMessage } from './types';

export const MOCK_USER = {
  patient: {
    id: 'user-001',
    name: 'Kwame Mensah',
    email: 'k.mensah@email.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'patient' as const,
  },
  doctor: {
    id: 'doc-001',
    name: 'Dr. Ama Adom',
    email: 'dr.ama@eclinic.gh',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'doctor' as const,
  }
};

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-001',
    name: 'Dr. Ama Adom',
    specialty: 'Cardiologist',
    avatarUrl: 'https://placehold.co/128x128.png',
    bio: 'Dr. Ama Adom is a renowned cardiologist with over 15 years of experience in treating heart-related diseases. She is dedicated to providing compassionate and comprehensive care to all her patients.',
    qualifications: ['MBChB, University of Ghana', 'FWACP (Cardiology)', 'Fellow, Ghana College of Physicians'],
    availability: {
      '2024-08-15': ['09:00', '09:30', '10:00', '11:15'],
      '2024-08-16': ['14:00', '14:30', '15:00'],
    }
  },
  {
    id: 'doc-002',
    name: 'Dr. Baffour Asare',
    specialty: 'Neurologist',
    avatarUrl: 'https://placehold.co/128x128.png',
    bio: 'Dr. Asare specializes in the diagnosis and treatment of neurological disorders. He is known for his patient-centric approach and expertise in managing complex neurological conditions.',
    qualifications: ['MBChB, KNUST', 'MRCP (UK)', 'Consultant Neurologist'],
     availability: {
      '2024-08-15': ['13:00', '13:30', '14:00'],
      '2024-08-17': ['10:00', '10:30', '11:00', '11:30'],
    }
  },
  {
    id: 'doc-003',
    name: 'Dr. Esi Ofori',
    specialty: 'Pediatrician',
    avatarUrl: 'https://placehold.co/128x128.png',
    bio: 'With a passion for children\'s health, Dr. Ofori has been a trusted pediatrician for over a decade. She creates a friendly and comfortable environment for her young patients.',
    qualifications: ['MBChB, UCC', 'Member, Paediatric Society of Ghana'],
     availability: {
      '2024-08-18': ['09:00', '09:30', '10:00', '10:30', '11:00'],
      '2024-08-19': ['14:00', '14:30', '15:00'],
    }
  },
    {
    id: 'doc-004',
    name: 'Dr. Kofi Annan',
    specialty: 'Dermatologist',
    avatarUrl: 'https://placehold.co/128x128.png',
    bio: 'Dr. Annan is an expert in skin health, treating a wide range of dermatological issues from acne to skin cancer. He is committed to helping patients achieve healthy, radiant skin.',
    qualifications: ['MBChB, KNUST', 'Board Certified Dermatologist'],
     availability: {
      '2024-08-15': [],
      '2024-08-20': ['11:00', '11:30', '12:00'],
    }
  },
];

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    patient: MOCK_USER.patient,
    doctor: DOCTORS[0],
    date: '2024-08-15',
    time: '10:00',
    status: 'upcoming',
    reason: 'Annual Checkup'
  },
  {
    id: 'apt-002',
    patient: MOCK_USER.patient,
    doctor: DOCTORS[2],
    date: '2024-08-18',
    time: '09:30',
    status: 'upcoming',
    reason: 'Child\'s Vaccination'
  },
  {
    id: 'apt-003',
    patient: MOCK_USER.patient,
    doctor: DOCTORS[1],
    date: '2024-07-20',
    time: '14:00',
    status: 'past',
    reason: 'Consultation for Headaches'
  },
  {
    id: 'apt-004',
    patient: MOCK_USER.patient,
    doctor: DOCTORS[0],
    date: '2024-06-10',
    time: '11:00',
    status: 'past',
    reason: 'Follow-up'
  },
];

export const CHAT_CONTACTS: ChatContact[] = [
  {
    id: 'doc-001',
    name: 'Dr. Ama Adom',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastMessage: 'That sounds good. Please let me know if it helps.',
    lastMessageTime: '10:42 AM',
    unreadCount: 0,
  },
  {
    id: 'doc-002',
    name: 'Dr. Baffour Asare',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastMessage: 'Okay, I will check the results and get back to you.',
    lastMessageTime: 'Yesterday',
    unreadCount: 2,
  },
    {
    id: 'patient-005',
    name: 'Yaw Graham',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastMessage: 'Hello Doctor, I have a question about my prescription.',
    lastMessageTime: '3 days ago',
    unreadCount: 0,
  },
];

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'doc-001': [
    { id: 'msg-1', text: 'Hello Kwame, how are you feeling today?', timestamp: '10:30 AM', sender: 'them' },
    { id: 'msg-2', text: 'Much better, doctor. The medication seems to be working.', timestamp: '10:32 AM', sender: 'me' },
    { id: 'msg-3', text: 'That sounds good. Please let me know if it helps.', timestamp: '10:42 AM', sender: 'them' },
  ],
  'doc-002': [
    { id: 'msg-4', text: 'Here are my lab test results.', timestamp: 'Yesterday', sender: 'me' },
    { id: 'msg-5', text: 'Okay, I will check the results and get back to you.', timestamp: 'Yesterday', sender: 'them' },
  ],
  'patient-005': [
     { id: 'msg-6', text: 'Hello Doctor, I have a question about my prescription.', timestamp: '3 days ago', sender: 'them' },
  ]
};
