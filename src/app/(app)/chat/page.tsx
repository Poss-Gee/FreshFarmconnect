
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Smile } from 'lucide-react';
import type { ChatContact, ChatMessage, AppUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatPage() {
  const { appUser } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Mock messages for now

  useEffect(() => {
    if (appUser) {
      const fetchContacts = async () => {
        setLoading(true);
        // In a real application, you'd fetch contacts based on past appointments or a friends list.
        // For now, we'll fetch all other users and ensure they are unique.
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '!=', appUser.uid));
        const querySnapshot = await getDocs(q);
        
        const contactMap = new Map<string, ChatContact>();
        querySnapshot.forEach(doc => {
          const userData = doc.data() as AppUser;
          // Ensure we don't add duplicates if Firestore returns them for any reason
          if (!contactMap.has(userData.uid)) {
            contactMap.set(userData.uid, {
              id: userData.uid,
              name: userData.fullName,
              avatarUrl: userData.avatarUrl || `https://placehold.co/100x100.png?text=${userData.fullName.charAt(0)}`,
              lastMessage: 'No messages yet...',
              lastMessageTime: '',
              unreadCount: 0,
            });
          }
        });

        const fetchedContacts = Array.from(contactMap.values());
        setContacts(fetchedContacts);

        if (fetchedContacts.length > 0 && !selectedContact) {
          setSelectedContact(fetchedContacts[0]);
        }
        setLoading(false);
      };

      fetchContacts();
    }
  }, [appUser, selectedContact]);

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    // In a real app, you would fetch messages for this contact from Firestore
    setMessages([]);
  };

  if (loading || !selectedContact && contacts.length > 0) {
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
  
  if (contacts.length === 0) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
              <div className="text-center">
                  <h2 className="text-2xl font-semibold">No contacts found</h2>
                  <p className="text-muted-foreground mt-2">You don't have any contacts to message yet.</p>
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
            <ScrollArea className="flex-1 p-4 md:p-6">
              <div className="space-y-4">
                 {messages.length === 0 ? (
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
                          'text-xs mt-1',
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
              <form className="relative">
                <Input placeholder="Type your message..." className="pr-20" />
                <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button type="button" size="icon" variant="ghost">
                        <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button type="submit" size="icon" variant="ghost">
                        <Send className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
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
