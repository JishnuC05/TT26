import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBooksStore } from "@/stores/booksStore";
import { useAuthStore } from "@/stores/authStore";
import type { Book, Category } from "@/types";
import { toast } from "sonner";

const CATEGORIES: Category[] = ["FICTION", "NON_FICTION", "SCIENCE", "HISTORY", "TECHNOLOGY", "SELF_HELP", "FANTASY", "BIOGRAPHY"];

const EMPTY_FORM: Partial<Book> = {
  title: "", author: "", price: 0, category: "FICTION", description: "",
  stock: 0, pages: 0, publishedYear: 2024, isbn: "",
  cover: "https://picsum.photos/seed/newbook/300/420",
};

export function ManageBooksPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { books, addBook, updateBook, deleteBook } = useBooksStore();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState<Partial<Book>>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">🔒</p>
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditBook(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({ ...book });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.author || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editBook) {
      updateBook({ ...editBook, ...form } as Book);
      toast.success("Book updated successfully");
    } else {
      const newBook: Book = {
        ...EMPTY_FORM,
        ...form,
        id: String(Date.now()),
        rating: 0,
        reviews: 0,
      } as Book;
      addBook(newBook);
      toast.success("Book added successfully");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteBook(id);
    setDeleteId(null);
    toast.success("Book deleted");
  };

  const updateField = <K extends keyof Book>(field: K, value: Book[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Books</h1>
          <p className="text-muted-foreground mt-1">{books.length} books in catalog</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Book
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5 w-12"></TableHead>
              <TableHead>Title & Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="pl-5">
                  <img src={book.cover} alt={book.title} className="h-12 w-8 object-cover rounded border" />
                </TableCell>
                <TableCell>
                  <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                </TableCell>
                <TableCell className="font-medium">${book.price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${book.stock < 10 ? "text-amber-600" : "text-emerald-600"}`}>
                    {book.stock}
                  </span>
                </TableCell>
                <TableCell className="text-sm">⭐ {book.rating.toFixed(1)}</TableCell>
                <TableCell className="text-right pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(book)} aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(book.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No books found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editBook ? "Edit Book" : "Add New Book"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title || ""} onChange={(e) => updateField("title", e.target.value)} placeholder="Book title" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="author">Author *</Label>
                <Input id="author" value={form.author || ""} onChange={(e) => updateField("author", e.target.value)} placeholder="Author name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price ($) *</Label>
                <Input id="price" type="number" min={0} step={0.01} value={form.price || ""} onChange={(e) => updateField("price", parseFloat(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => updateField("category", v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" min={0} value={form.stock || ""} onChange={(e) => updateField("stock", parseInt(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pages">Pages</Label>
                <Input id="pages" type="number" min={0} value={form.pages || ""} onChange={(e) => updateField("pages", parseInt(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Published Year</Label>
                <Input id="year" type="number" min={1800} max={2030} value={form.publishedYear || ""} onChange={(e) => updateField("publishedYear", parseInt(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" value={form.isbn || ""} onChange={(e) => updateField("isbn", e.target.value)} placeholder="978-..." />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Book description..." className="resize-none h-20" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editBook ? "Save Changes" : "Add Book"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Book?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The book will be permanently removed from the catalog.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
