"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Clock, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  student: { user: { fullName: string } };
  feeStructure: { name: string };
  payments: Array<{ id: string; amount: number; method: string; paidAt: string }>;
}

export default function ParentFeesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/parent/children");
      if (response.ok) {
        const children = await response.json();
        const allInvoices: Invoice[] = [];
        for (const child of children) {
          const invResponse = await fetch(`/api/parent/children/${child.id}/invoices`);
          if (invResponse.ok) {
            const invData = await invResponse.json();
            allInvoices.push(...invData);
          }
        }
        setInvoices(allInvoices);
      }
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const handlePayNow = async (invoiceId: string) => {
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      if (response.ok) {
        const { url } = await response.json();
        if (url) window.location.href = url;
      } else {
        toast({ title: "Failed to create checkout session", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  };

  const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
    PAID: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    PARTIAL: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    PENDING: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    OVERDUE: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  };

  const totalDue = invoices.filter((i) => i.status !== "PAID").reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-pink-900 bg-clip-text text-transparent">Fees & Payments</h1>
        <p className="text-gray-500 mt-1">View invoices and make payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        <Card className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Due</p>
                <p className="text-3xl font-bold stat-number text-red-600">{formatCurrency(totalDue)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-3xl font-bold stat-number text-emerald-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : invoices.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No invoices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {invoices.map((invoice) => {
            const config = statusConfig[invoice.status] || statusConfig.PENDING;
            const StatusIcon = config.icon;
            const remaining = invoice.amountDue - invoice.amountPaid;
            return (
              <Card key={invoice.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{invoice.feeStructure.name}</p>
                      <p className="text-sm text-gray-500" suppressHydrationWarning>{invoice.student?.user?.fullName} &middot; Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(invoice.amountDue)}</p>
                      {remaining > 0 && <p className="text-xs text-red-500">{formatCurrency(remaining)} remaining</p>}
                    </div>
                    {invoice.status !== "PAID" ? (
                      <Button
                        size="sm"
                        onClick={() => handlePayNow(invoice.id)}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs"
                      >
                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                        Pay Now
                      </Button>
                    ) : (
                      <Badge className="rounded-full text-xs bg-emerald-100 text-emerald-700">Paid</Badge>
                    )}
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
