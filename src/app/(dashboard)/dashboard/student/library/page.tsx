"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, BookMarked } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category?: string | null;
  publisher?: string | null;
  publishYear?: number | null;
  availableCopies: number;
  totalCopies: number;
  copies: { id: string }[];
}

export default function StudentLibraryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/student/library");
      if (response.ok) setBooks(await response.json());
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColors: Record<string, string> = {
    Fiction: "bg-blue-100 text-blue-700",
    "Non-Fiction": "bg-emerald-100 text-emerald-700",
    Science: "bg-amber-100 text-amber-700",
    Mathematics: "bg-violet-100 text-violet-700",
    History: "bg-orange-100 text-orange-700",
    Literature: "bg-pink-100 text-pink-700",
    Technology: "bg-cyan-100 text-cyan-700",
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Library Catalog
        </h1>
        <p className="text-gray-500 mt-1">Browse and discover available books</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by title, author, category, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {searchQuery ? "No books match your search" : "No books available right now"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filteredBooks.map((book) => (
            <Card
              key={book.id}
              className="group border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {book.category && (
                      <Badge
                        variant="secondary"
                        className={`rounded-full text-xs ${
                          categoryColors[book.category] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {book.category}
                      </Badge>
                    )}
                    {book.publishYear && (
                      <Badge variant="outline" className="rounded-full text-xs">
                        {book.publishYear}
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span className="font-mono">{book.isbn}</span>
                        {book.publisher && (
                          <span className="ml-2">· {book.publisher}</span>
                        )}
                      </div>
                      <Badge
                        variant={book.availableCopies > 0 ? "default" : "destructive"}
                        className={`rounded-full text-xs ${
                          book.availableCopies > 0
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {book.availableCopies > 0
                          ? `${book.availableCopies} available`
                          : "Unavailable"}
                      </Badge>
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
