"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { User, Mail, Hash, BookOpen } from "lucide-react";

export default function StudentProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">My Profile</h1>
        <p className="text-gray-500 mt-1">Your personal information</p>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="h-20 w-20 ring-4 ring-blue-100">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-2xl font-bold">
                {getInitials(session?.user?.name || "Student")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
              <p className="text-gray-500">Student</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: User, label: "Full Name", value: session?.user?.name || "N/A" },
              { icon: Mail, label: "Email", value: session?.user?.email || "N/A" },
              { icon: Hash, label: "Role", value: "Student" },
              { icon: BookOpen, label: "Status", value: "Active" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-medium text-gray-900">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
