"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Mail, Calendar, Plus } from "lucide-react";

interface Message {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  sender: { fullName: string };
  recipient: { fullName: string };
}

export default function ParentMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ recipientEmail: "", subject: "", body: "" });

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) setMessages(await response.json());
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({ recipientEmail: "", subject: "", body: "" });
        fetchMessages();
        toast({ title: "Message sent!" });
      } else {
        toast({ title: "Failed to send", variant: "destructive" });
      }
    } catch { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-pink-900 bg-clip-text text-transparent">Messages</h1>
          <p className="text-gray-500 mt-1">Communicate with teachers and admin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-500/25 rounded-xl px-5 h-11" />}>
            <Send className="h-4 w-4 mr-2" />
            New Message
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Send Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Recipient Email</Label>
                <Input type="email" value={formData.recipientEmail} onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })} className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Subject</Label>
                <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Message</Label>
                <textarea
                  className="w-full min-h-[100px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700">Send Message</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : messages.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No messages yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {messages.map((msg) => (
            <Card key={msg.id} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">{msg.subject}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{msg.body}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>From: {msg.sender.fullName}</span>
                      <span>To: {msg.recipient.fullName}</span>
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span suppressHydrationWarning>{new Date(msg.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
