"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface Invoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  student: {
    user: { fullName: string };
    admissionNumber: string;
  };
  feeStructure: { name: string };
}

export default function FeesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/admin/fees");
      if (response.ok) setInvoices(await response.json());
    } catch (error) { console.error("Failed to fetch invoices:", error); }
    finally { setIsLoading(false); }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/fees/${invoiceId}/pay`, { method: "POST" });
      if (response.ok) fetchInvoices();
    } catch (error) { console.error("Failed to mark as paid:", error); }
  };

  if (session?.user?.role !== "ADMIN") { router.push("/dashboard"); return null; }

  const totalOutstanding = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
    PAID: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    PARTIAL: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    PENDING: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    OVERDUE: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">Fees Management</h1>
        <p className="text-gray-500 mt-1">Track invoices and manage payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        {[
          { label: "Total Outstanding", value: formatCurrency(totalOutstanding), icon: TrendingDown, gradient: "from-red-500 to-rose-600" },
          { label: "Collected This Term", value: formatCurrency(totalCollected), icon: DollarSign, gradient: "from-emerald-500 to-teal-600" },
          { label: "Overdue Invoices", value: overdueCount.toString(), icon: AlertTriangle, gradient: "from-amber-500 to-orange-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold stat-number">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invoices Table */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">All Invoices</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No invoices found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => {
                const config = statusConfig[invoice.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                const remaining = invoice.amountDue - invoice.amountPaid;
                return (
                  <div key={invoice.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{invoice.student.user.fullName}</p>
                      <p className="text-sm text-gray-500">{invoice.feeStructure.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(invoice.amountDue)}</p>
                      <p className="text-xs text-gray-400" suppressHydrationWarning>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    {invoice.status !== "PAID" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        className="rounded-xl text-xs"
                      >
                        Mark Paid ({formatCurrency(remaining)})
                      </Button>
                    ) : (
                      <Badge variant="default" className="rounded-full text-xs bg-emerald-100 text-emerald-700">Paid</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
