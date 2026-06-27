"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Mail,
  Calendar,
  Search,
  Inbox,
  ArrowLeft,
  User,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { fullName: string; email: string };
  receiver: { fullName: string; email: string };
}

interface Contact {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function ParentMessagesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyData, setReplyData] = useState({ recipientId: "", subject: "", body: "" });
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchContacts();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) setMessages(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/parent/contacts");
      if (response.ok) setContacts(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: replyData.recipientId,
          subject: replyData.subject,
          content: replyData.body,
        }),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        setReplyData({ recipientId: "", subject: "", body: "" });
        fetchMessages();
        toast({ title: "Message sent!" });
      } else {
        toast({ title: "Failed to send", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: replyData.recipientId,
          subject: replyData.subject,
          content: replyData.body,
        }),
      });
      if (response.ok) {
        setIsReplyOpen(false);
        setSelectedMessage(null);
        setReplyData({ recipientId: "", subject: "", body: "" });
        fetchMessages();
        toast({ title: "Reply sent!" });
      } else {
        toast({ title: "Failed to send reply", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, { method: "POST" });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead && msg.receiver.email === session?.user?.email) {
      markAsRead(msg.id);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const isInbox = activeTab === "inbox";
    const isMyMessage = isInbox
      ? msg.receiver.email === session?.user?.email
      : msg.sender.email === session?.user?.email;

    if (!isMyMessage) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        msg.content.toLowerCase().includes(query) ||
        msg.sender.fullName.toLowerCase().includes(query) ||
        msg.receiver.fullName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const unreadCount = messages.filter(
    (m) => !m.isRead && m.receiver.email === session?.user?.email
  ).length;

  if (selectedMessage) {
    const isIncoming = selectedMessage.receiver.email === session?.user?.email;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedMessage(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedMessage.content.substring(0, 50)}
              {selectedMessage.content.length > 50 ? "..." : ""}
            </h1>
            <p className="text-sm text-gray-500">
              {isIncoming ? "From" : "To"}:{" "}
              {isIncoming
                ? selectedMessage.sender.fullName
                : selectedMessage.receiver.fullName}
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">
                {isIncoming
                  ? selectedMessage.sender.fullName[0]
                  : selectedMessage.receiver.fullName[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {isIncoming
                    ? selectedMessage.sender.fullName
                    : selectedMessage.receiver.fullName}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(selectedMessage.createdAt)}
                </p>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selectedMessage.content}
            </p>
          </CardContent>
        </Card>

        {isIncoming && (
          <Button
            onClick={() => {
              setReplyData({
                recipientId: selectedMessage.sender.email,
                subject: `Re: ${selectedMessage.content.substring(0, 30)}`,
                body: "",
              });
              setIsReplyOpen(true);
            }}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Reply
          </Button>
        )}

        <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Reply</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleReply} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">To</Label>
                <Input
                  value={replyData.recipientId}
                  onChange={(e) =>
                    setReplyData({ ...replyData, recipientId: e.target.value })
                  }
                  className="h-11 rounded-xl"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Subject
                </Label>
                <Input
                  value={replyData.subject}
                  onChange={(e) =>
                    setReplyData({ ...replyData, subject: e.target.value })
                  }
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <textarea
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all"
                  value={replyData.body}
                  onChange={(e) =>
                    setReplyData({ ...replyData, body: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
              >
                Send Reply
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-pink-900 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-gray-500 mt-1">Communicate with teachers and admin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-500/25 rounded-xl px-5 h-11" />
            }
          >
            <Send className="h-4 w-4 mr-2" />
            New Message
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Send Message
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Recipient
                </Label>
                <select
                  value={replyData.recipientId}
                  onChange={(e) =>
                    setReplyData({ ...replyData, recipientId: e.target.value })
                  }
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
                  required
                >
                  <option value="">Select recipient</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName} ({contact.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Subject
                </Label>
                <Input
                  value={replyData.subject}
                  onChange={(e) =>
                    setReplyData({ ...replyData, subject: e.target.value })
                  }
                  className="h-11 rounded-xl"
                  placeholder="Optional subject"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <textarea
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all"
                  value={replyData.body}
                  onChange={(e) =>
                    setReplyData({ ...replyData, body: e.target.value })
                  }
                  placeholder="Type your message..."
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
              >
                Send Message
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "inbox"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Inbox className="h-4 w-4" />
            Inbox
            {unreadCount > 0 && (
              <Badge className="ml-1 bg-rose-500 text-white text-[10px] rounded-full px-1.5">
                {unreadCount}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "sent"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Send className="h-4 w-4" />
            Sent
          </button>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {activeTab === "inbox" ? "No messages in inbox" : "No sent messages"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {filteredMessages.map((msg) => {
            const isIncoming = msg.receiver.email === session?.user?.email;
            const otherPerson = isIncoming ? msg.sender : msg.receiver;
            return (
              <Card
                key={msg.id}
                onClick={() => handleViewMessage(msg)}
                className={`group border-0 shadow-sm backdrop-blur-sm card-hover overflow-hidden cursor-pointer transition-all ${
                  !msg.isRead && isIncoming
                    ? "bg-rose-50/50 ring-1 ring-rose-100"
                    : "bg-white/80"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                        !msg.isRead && isIncoming
                          ? "bg-gradient-to-br from-rose-500 to-pink-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}
                    >
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className={`${
                            !msg.isRead && isIncoming
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {otherPerson.fullName}
                        </h3>
                        {!msg.isRead && isIncoming && (
                          <Badge className="bg-rose-500 text-white text-[10px] rounded-full px-1.5">
                            New
                          </Badge>
                        )}
                        {isIncoming ? null : (
                          <Badge
                            variant="outline"
                            className="text-[10px] rounded-full"
                          >
                            Sent
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm line-clamp-1 mb-1 ${
                          !msg.isRead && isIncoming
                            ? "text-gray-700 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
