"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle2, Clock, Plus, Layers } from "lucide-react";

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

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  currency: string;
  term: string;
  dueDate: string;
  class?: { name: string };
  _count: { invoices: number };
}

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  admissionNumber: string;
  user: { fullName: string };
  class?: { name: string };
}

export default function FeesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStructureDialogOpen, setIsStructureDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [structureForm, setStructureForm] = useState({
    classId: "",
    name: "",
    amount: "",
    term: "",
    dueDate: "",
  });

  const [generateForm, setGenerateForm] = useState({
    feeStructureId: "",
  });

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/admin/fees");
      if (response.ok) setInvoices(await response.json());
    } catch {
      toast({ title: "Error", description: "Failed to fetch invoices", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      const response = await fetch("/api/admin/fees/structures");
      if (response.ok) setStructures(await response.json());
    } catch {
      console.error("Failed to fetch fee structures");
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes");
      if (response.ok) setClasses(await response.json());
    } catch {
      console.error("Failed to fetch classes");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/admission");
      if (response.ok) setStudents(await response.json());
    } catch {
      console.error("Failed to fetch students");
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/fees/structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: structureForm.classId || undefined,
          name: structureForm.name,
          amount: parseFloat(structureForm.amount),
          term: structureForm.term,
          dueDate: structureForm.dueDate,
        }),
      });

      if (response.ok) {
        toast({ title: "Fee Structure Created", description: "New fee structure has been added" });
        setIsStructureDialogOpen(false);
        setStructureForm({ classId: "", name: "", amount: "", term: "", dueDate: "" });
        fetchStructures();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || "Failed to create", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create fee structure", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      toast({ title: "Error", description: "Select at least one student", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/fees/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeStructureId: generateForm.feeStructureId,
          studentIds: selectedStudents,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Invoices Generated",
          description: data.message,
        });
        setIsGenerateDialogOpen(false);
        setSelectedStudents([]);
        setGenerateForm({ feeStructureId: "" });
        fetchInvoices();
      } else {
        toast({ title: "Error", description: data.error || "Failed to generate", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate invoices", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/fees/${invoiceId}/pay`, { method: "POST" });
      if (response.ok) {
        toast({ title: "Payment Recorded", description: "Invoice marked as paid" });
        fetchInvoices();
      }
    } catch {
      toast({ title: "Error", description: "Failed to mark as paid", variant: "destructive" });
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  useEffect(() => {
    async function loadData() {
      await fetchInvoices();
      await fetchStructures();
      await fetchClasses();
      await fetchStudents();
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session?.user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

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
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Fees Management
          </h1>
          <p className="text-gray-500 mt-1">Track invoices, manage structures and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsGenerateDialogOpen(true)}
            variant="outline"
            className="rounded-xl h-11"
          >
            <Layers className="h-4 w-4 mr-2" />
            Generate Invoices
          </Button>
          <Button
            onClick={() => setIsStructureDialogOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 rounded-xl px-5 h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Fee Structure
          </Button>
        </div>
      </div>

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

      {structures.length > 0 && (
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Fee Structures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {structures.map((structure) => (
                <div key={structure.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{structure.name}</p>
                    <Badge variant="outline" className="text-xs">{structure.term}</Badge>
                  </div>
                  <p className="text-xl font-bold text-indigo-600">{formatCurrency(structure.amount)}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{structure.class?.name || "All Classes"}</span>
                    <span>{structure._count.invoices} invoices</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                      {invoice.amountPaid > 0 && (
                        <p className="text-xs text-emerald-600">Paid: {formatCurrency(invoice.amountPaid)}</p>
                      )}
                      <p className="text-xs text-gray-400" suppressHydrationWarning>
                        Due: {formatDate(invoice.dueDate)}
                      </p>
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
                      <Badge variant="default" className="rounded-full text-xs bg-emerald-100 text-emerald-700">
                        Paid
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isStructureDialogOpen} onOpenChange={setIsStructureDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Fee Structure</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStructure} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Fee Name *</Label>
              <Input
                placeholder="e.g. Tuition Fee, Lab Fee"
                value={structureForm.name}
                onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={structureForm.amount}
                  onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Term *</Label>
                <Select value={structureForm.term} onValueChange={(value) => { if (value) setStructureForm({ ...structureForm, term: value }); }}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Class (optional)</Label>
                <Select value={structureForm.classId} onValueChange={(value) => { if (value !== null) setStructureForm({ ...structureForm, classId: value }); }}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Due Date *</Label>
                <Input
                  type="date"
                  value={structureForm.dueDate}
                  onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {isSubmitting ? "Creating..." : "Create Fee Structure"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Generate Invoices</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerateInvoices} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Fee Structure *</Label>
              <Select value={generateForm.feeStructureId} onValueChange={(value) => { if (value) setGenerateForm({ ...generateForm, feeStructureId: value }); }}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select fee structure" />
                </SelectTrigger>
                <SelectContent>
                  {structures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      {structure.name} - {formatCurrency(structure.amount)} ({structure.term})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Select Students * ({selectedStudents.length} selected)
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedStudents.length === students.length) {
                      setSelectedStudents([]);
                    } else {
                      setSelectedStudents(students.map((s) => s.id));
                    }
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl divide-y max-h-[300px] overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No students found</p>
                ) : (
                  students.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{student.user.fullName}</p>
                        <p className="text-xs text-gray-500">{student.admissionNumber} &middot; {student.class?.name || "No class"}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || selectedStudents.length === 0}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {isSubmitting ? "Generating..." : `Generate ${selectedStudents.length} Invoice(s)`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
