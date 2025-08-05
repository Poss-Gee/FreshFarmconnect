
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Smile } from 'lucide-react';
import type { ChatContact, ChatMessage, AppUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { collection, getDocs, query, where, getDoc, doc, onSnapshot, addDoc, serverTimestamp, orderBy, collectionGroup, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatPage() {
  const { appUser } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
      }
    };
    scrollToBottom();
  }, [messages]);
  
  // Fetch contacts based on appointments
  useEffect(() => {
    if (appUser) {
      const fetchContacts = async () => {
        setLoading(true);
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where(appUser.role === 'patient' ? 'patient.uid' : 'doctor.uid', '==', appUser.uid)
        );
        const appointmentSnapshot = await getDocs(appointmentsQuery);

        const contactMap = new Map<string, ChatContact>();
        const contactPromises = appointmentSnapshot.docs.map(async (appointmentDoc) => {
          const appointmentData = appointmentDoc.data();
          const contactUID = appUser.role === 'patient' ? appointmentData.doctor.uid : appointmentData.patient.uid;

          if (!contactMap.has(contactUID)) {
            const userDocRef = doc(db, 'users', contactUID);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data() as AppUser;
                contactMap.set(userData.uid, {
                    id: userData.uid,
                    name: userData.fullName,
                    avatarUrl: userData.avatarUrl || `https://placehold.co/100x100.png?text=${userData.fullName.charAt(0)}`,
                    lastMessage: 'Click to start chatting...',
                    lastMessageTime: '',
                    unreadCount: 0,
                });
            }
          }
        });

        await Promise.all(contactPromises);
        
        const fetchedContacts = Array.from(contactMap.values());
        setContacts(fetchedContacts);

        if (fetchedContacts.length > 0 && !selectedContact) {
          setSelectedContact(fetchedContacts[0]);
        }
        setLoading(false);
      };

      fetchContacts();
    }
  }, [appUser]);


  // Listen for messages for the selected contact
  useEffect(() => {
    if (selectedContact && appUser) {
      setLoadingMessages(true);
      const chatId = [appUser.uid, selectedContact.id].sort().join('_');
      const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const fetchedMessages: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedMessages.push({
            id: doc.id,
            text: data.text,
            timestamp: data.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
            sender: data.senderId === appUser.uid ? 'me' : 'them',
            senderId: data.senderId,
          });
        });
        setMessages(fetchedMessages);
        setLoadingMessages(false);
      });

      return () => unsubscribe();
    }
  }, [selectedContact, appUser]);


  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !appUser || !selectedContact) return;

    const chatId = [appUser.uid, selectedContact.id].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: appUser.uid,
        receiverId: selectedContact.id,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  if (loading) {
      return (
        <div className="grid h-[calc(100vh-theme(spacing.16))] w-full grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
            <div className="flex flex-col border-r bg-card md:col-span-1 p-4 gap-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <div className="md:col-span-2 xl:col-span-3 p-4 flex flex-col">
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-16 w-3/4 self-end" />
                    <Skeleton className="h-16 w-3/4 self-start" />
                </div>
                 <Skeleton className="h-16 w-full mt-4" />
            </div>
        </div>
      )
  }
  
  if (contacts.length === 0 && !loading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
              <div className="text-center">
                  <h2 className="text-2xl font-semibold">No contacts found</h2>
                  <p className="text-muted-foreground mt-2">Book an appointment with a {appUser?.role === 'patient' ? 'doctor' : 'patient'} to start a conversation.</p>
              </div>
          </div>
      )
  }


  return (
    <div className="grid h-[calc(100vh-theme(spacing.16))] w-full grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
      <div className="flex flex-col border-r bg-card md:col-span-1">
        <div className="flex items-center gap-2 border-b p-4">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." className="pl-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={cn(
                  'flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50',
                  selectedContact?.id === contact.id && 'bg-accent'
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{contact.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end text-xs">
                  <span className="text-muted-foreground">{contact.lastMessageTime}</span>
                  {contact.unreadCount > 0 && (
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-col md:col-span-2 xl:col-span-3">
        {selectedContact ? (
          <>
            <div className="flex items-center gap-4 border-b p-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.name} />
                <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{selectedContact.name}</h2>
            </div>
            <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
              <div className="space-y-4">
                 {loadingMessages ? (
                    <div className="text-center text-muted-foreground py-16">Loading messages...</div>
                 ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                        No messages yet. Start the conversation!
                    </div>
                ) : messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex items-end gap-2',
                      message.sender === 'me' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.sender === 'them' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedContact.avatarUrl} />
                        <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-xs rounded-2xl p-3 text-sm md:max-w-md',
                        message.sender === 'me'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      )}
                    >
                      <p>{message.text}</p>
                      <p className={cn(
                          'text-xs mt-1 text-right',
                          message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>{message.timestamp}</p>
                    </div>
                     {message.sender === 'me' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={appUser?.avatarUrl || ''} />
                        <AvatarFallback>{appUser?.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t bg-card p-4">
              <form onSubmit={handleSendMessage} className="relative flex gap-2">
                <Input 
                    placeholder="Type your message..." 
                    className="flex-1 pr-20" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                 <Button type="button" size="icon" variant="ghost" className="absolute right-12 top-1/2 -translate-y-1/2">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button type="submit" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Send className="h-5 w-5 text-muted-foreground" />
                </Button>
              </form>
            </div>
          </>
        ) : (
             <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">Select a chat</h2>
                    <p className="text-muted-foreground mt-2">Choose a contact to start messaging.</p>
                </div>
             </div>
        )}
      </div>
    </div>
  );
}
