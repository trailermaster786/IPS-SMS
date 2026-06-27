"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User2FA {
  id: string;
  fullName: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

export default function AdminTwoFAPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState<User2FA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/two-fa");
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        toast({ title: "Failed to load users", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async (userId: string, enable: boolean) => {
    setTogglingUserId(userId);
    try {
      const response = await fetch("/api/admin/two-fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, enable }),
      });
      const data = await response.json();

      if (response.ok) {
        if (enable && data.code) {
          toast({
            title: "2FA Enabled",
            description: `Code generated: ${data.code}`,
          });
        } else {
          toast({ title: enable ? "2FA Enabled" : "2FA Disabled" });
        }
        await fetchUsers();
      } else {
        toast({ title: data.error || "Failed to update 2FA", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setTogglingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-gradient-to-r from-indigo-500 to-violet-600 text-white";
      case "TEACHER": return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white";
      case "STUDENT": return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
      case "PARENT": return "bg-gradient-to-r from-rose-500 to-pink-600 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
            <p className="text-gray-500 mt-2">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            Two-Factor Authentication Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage 2FA settings for all users
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Enable or disable two-factor authentication for users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>2FA Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="text-gray-500">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} border-0`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.twoFactorEnabled ? (
                          <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border-0 gap-1">
                            <XCircle className="h-3 w-3" />
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={user.twoFactorEnabled ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggle(user.id, !user.twoFactorEnabled)}
                          disabled={togglingUserId === user.id}
                          className="gap-1"
                        >
                          {togglingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.twoFactorEnabled ? (
                            "Disable"
                          ) : (
                            "Enable"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
