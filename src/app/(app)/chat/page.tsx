'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Smile } from 'lucide-react';
import { CHAT_CONTACTS, CHAT_MESSAGES } from '@/lib/mock-data';
import type { ChatContact, ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<ChatContact>(CHAT_CONTACTS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES[selectedContact.id]);

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    setMessages(CHAT_MESSAGES[contact.id] || []);
  };

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
            {CHAT_CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={cn(
                  'flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50',
                  selectedContact.id === contact.id && 'bg-accent'
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
        <div className="flex items-center gap-4 border-b p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.name} />
            <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{selectedContact.name}</h2>
        </div>
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="space-y-4">
            {messages.map((message) => (
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
                    <AvatarImage src={CHAT_CONTACTS[0].avatarUrl} />
                    <AvatarFallback>U</AvatarFallback>
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
      </div>
    </div>
  );
}
