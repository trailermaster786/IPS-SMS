"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookMarked,
} from "lucide-react";

interface BookCopy {
  id: string;
  barcode: string;
  status: string;
  loans: { id: string }[];
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category?: string | null;
  publisher?: string | null;
  publishYear?: number | null;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  copies: BookCopy[];
  activeLoansCount: number;
}

interface Loan {
  id: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string;
  copy: {
    barcode: string;
    book: { id: string; title: string };
  };
  student: {
    id: string;
    admissionNumber: string;
    user: { fullName: string };
  };
}

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  publisher: "",
  publishYear: "",
  totalCopies: "1",
};

export default function AdminLibraryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [borrowForm, setBorrowForm] = useState({
    studentId: "",
    bookId: "",
    dueDate: "",
  });
  const [students, setStudents] = useState<
    { id: string; userId: string; admissionNumber: string; user: { fullName: string } }[]
  >([]);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [booksRes, loansRes] = await Promise.all([
        fetch("/api/admin/library"),
        fetch("/api/admin/library/loans"),
      ]);
      if (booksRes.ok) setBooks(await booksRes.json());
      if (loansRes.ok) setLoans(await loansRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const users = await res.json();
        setStudents(users.filter((u: any) => u.role === "STUDENT"));
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        publishYear: formData.publishYear ? Number(formData.publishYear) : null,
        totalCopies: Number(formData.totalCopies) || 1,
      };
      const response = await fetch("/api/admin/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        setFormData(emptyForm);
        fetchData();
        toast({ title: "Book added successfully" });
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create book", variant: "destructive" });
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookId) return;
    try {
      const payload = {
        ...editFormData,
        publishYear: editFormData.publishYear ? Number(editFormData.publishYear) : null,
      };
      const response = await fetch(`/api/admin/library/${editingBookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingBookId(null);
        setEditFormData(emptyForm);
        fetchData();
        toast({ title: "Book updated successfully" });
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update book", variant: "destructive" });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const response = await fetch(`/api/admin/library/${bookId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchData();
        toast({ title: "Book deleted" });
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete book", variant: "destructive" });
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBookId(book.id);
    setEditFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category || "",
      publisher: book.publisher || "",
      publishYear: book.publishYear?.toString() || "",
      totalCopies: book.totalCopies.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openBorrowDialog = async (bookId?: string) => {
    await fetchStudents();
    setBorrowForm({
      studentId: "",
      bookId: bookId || "",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setIsBorrowDialogOpen(true);
  };

  const handleBorrowBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/library/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: borrowForm.studentId,
          bookId: borrowForm.bookId,
          dueDate: borrowForm.dueDate,
        }),
      });
      if (response.ok) {
        setIsBorrowDialogOpen(false);
        fetchData();
        toast({ title: "Book borrowed successfully" });
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to borrow book", variant: "destructive" });
    }
  };

  const handleReturnBook = async (loanId: string) => {
    try {
      const response = await fetch(`/api/admin/library/loans/${loanId}/return`, {
        method: "POST",
      });
      if (response.ok) {
        fetchData();
        toast({ title: "Book returned successfully" });
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to return book", variant: "destructive" });
    }
  };

  if (session?.user?.role !== "ADMIN") return null;

  const totalBooks = books.length;
  const totalAvailableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const activeLoans = loans.filter((l) => l.status === "BORROWED");
  const overdueLoans = activeLoans.filter((l) => new Date(l.dueDate) < new Date());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Library Management
          </h1>
          <p className="text-gray-500 mt-1">Manage books, copies, and loans</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => openBorrowDialog()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-xl px-5 h-11"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Issue Book
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 rounded-xl px-5 h-11" />
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Book title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm font-medium text-gray-700">
                    Author *
                  </Label>
                  <Input
                    id="author"
                    placeholder="Author name"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn" className="text-sm font-medium text-gray-700">
                    ISBN *
                  </Label>
                  <Input
                    id="isbn"
                    placeholder="ISBN number"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category
                  </Label>
                  <Input
                    id="category"
                    placeholder="e.g. Science Fiction"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher" className="text-sm font-medium text-gray-700">
                    Publisher
                  </Label>
                  <Input
                    id="publisher"
                    placeholder="Publisher name"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publishYear" className="text-sm font-medium text-gray-700">
                      Year
                    </Label>
                    <Input
                      id="publishYear"
                      type="number"
                      placeholder="2024"
                      value={formData.publishYear}
                      onChange={(e) =>
                        setFormData({ ...formData, publishYear: e.target.value })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalCopies" className="text-sm font-medium text-gray-700">
                      Copies *
                    </Label>
                    <Input
                      id="totalCopies"
                      type="number"
                      min="1"
                      value={formData.totalCopies}
                      onChange={(e) =>
                        setFormData({ ...formData, totalCopies: e.target.value })
                      }
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                >
                  Add Book
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBook} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
                Title *
              </Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author" className="text-sm font-medium text-gray-700">
                Author *
              </Label>
              <Input
                id="edit-author"
                value={editFormData.author}
                onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-isbn" className="text-sm font-medium text-gray-700">
                ISBN *
              </Label>
              <Input
                id="edit-isbn"
                value={editFormData.isbn}
                onChange={(e) => setEditFormData({ ...editFormData, isbn: e.target.value })}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Input
                id="edit-category"
                value={editFormData.category}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, category: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-publisher" className="text-sm font-medium text-gray-700">
                Publisher
              </Label>
              <Input
                id="edit-publisher"
                value={editFormData.publisher}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, publisher: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-publishYear" className="text-sm font-medium text-gray-700">
                Year
              </Label>
              <Input
                id="edit-publishYear"
                type="number"
                value={editFormData.publishYear}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, publishYear: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Borrow Dialog */}
      <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Issue Book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBorrowBook} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="borrow-student" className="text-sm font-medium text-gray-700">
                Student *
              </Label>
              <select
                id="borrow-student"
                value={borrowForm.studentId}
                onChange={(e) =>
                  setBorrowForm({ ...borrowForm, studentId: e.target.value })
                }
                className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                required
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.user.fullName} ({s.admissionNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="borrow-book" className="text-sm font-medium text-gray-700">
                Book *
              </Label>
              <select
                id="borrow-book"
                value={borrowForm.bookId}
                onChange={(e) =>
                  setBorrowForm({ ...borrowForm, bookId: e.target.value })
                }
                className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                required
              >
                <option value="">Select a book</option>
                {books
                  .filter((b) => b.availableCopies > 0)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} by {b.author} ({b.availableCopies} available)
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="borrow-dueDate" className="text-sm font-medium text-gray-700">
                Due Date *
              </Label>
              <Input
                id="borrow-dueDate"
                type="date"
                value={borrowForm.dueDate}
                onChange={(e) =>
                  setBorrowForm({ ...borrowForm, dueDate: e.target.value })
                }
                className="h-11 rounded-xl"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Issue Book
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {[
          {
            label: "Total Books",
            value: totalBooks.toString(),
            icon: BookMarked,
            gradient: "from-blue-500 to-indigo-600",
          },
          {
            label: "Available Copies",
            value: totalAvailableCopies.toString(),
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-teal-600",
          },
          {
            label: "Active Loans",
            value: activeLoans.length.toString(),
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
          },
          {
            label: "Overdue Loans",
            value: overdueLoans.length.toString(),
            icon: AlertTriangle,
            gradient: "from-red-500 to-rose-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover card-border-gradient overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold stat-number">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Books Table */}
      <Card
        className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Books Collection</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No books in the library yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Copies</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell className="text-gray-500">{book.author}</TableCell>
                      <TableCell className="font-mono text-xs">{book.isbn}</TableCell>
                      <TableCell>
                        {book.category ? (
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {book.category}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            book.availableCopies > 0 ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {book.availableCopies}
                        </span>
                        <span className="text-gray-400">/{book.totalCopies}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {book.availableCopies > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openBorrowDialog(book.id)}
                              className="rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Issue book"
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(book)}
                            className="rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit book"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBook(book.id)}
                            className="rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete book"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Loans */}
      <Card
        className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Active Loans</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeLoans.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active loans</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeLoans.map((loan) => {
                const isOverdue = new Date(loan.dueDate) < new Date();
                return (
                  <div
                    key={loan.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOverdue
                          ? "bg-red-50 text-red-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {isOverdue ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {loan.student.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {loan.copy.book.title}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">
                        Borrowed: <span className="font-medium">{formatDate(loan.loanDate)}</span>
                      </p>
                      <p className={isOverdue ? "text-red-500 font-medium" : "text-gray-500"}>
                        Due: {formatDate(loan.dueDate)}
                      </p>
                    </div>
                    <Badge
                      variant={isOverdue ? "destructive" : "secondary"}
                      className="rounded-full text-xs"
                    >
                      {isOverdue ? "Overdue" : "Active"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReturnBook(loan.id)}
                      className="rounded-xl text-xs gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Return
                    </Button>
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
