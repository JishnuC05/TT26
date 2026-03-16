import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft, BookOpen, Calendar, Hash, Layers, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookCard } from "@/components/books/BookCard";
import { useBooksStore } from "@/stores/booksStore";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getBook = useBooksStore((s) => s.getBook);
  const books = useBooksStore((s) => s.books);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const book = id ? getBook(id) : undefined;

  if (!book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">📚</p>
        <h2 className="text-xl font-semibold">Book not found</h2>
        <Button onClick={() => navigate("/books")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
        </Button>
      </div>
    );
  }

  const related = books.filter((b) => b.category === book.category && b.id !== book.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem(book, quantity);
    toast.success(`${quantity}× "${book.title}" added to cart!`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-accent text-accent" : "fill-muted text-muted-foreground"}`}
      />
    ));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-primary transition-colors">Books</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{book.title}</span>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
        {/* Book Cover */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <div className="aspect-[3/4] max-w-xs mx-auto md:mx-0 overflow-hidden rounded-2xl shadow-2xl border border-border">
              <img
                src={book.cover}
                alt={`${book.title} book cover`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-3">
          <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">{book.category}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 leading-tight">{book.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">by <span className="font-medium text-foreground">{book.author}</span></p>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1">{renderStars(book.rating)}</div>
            <span className="font-semibold">{book.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({book.reviews.toLocaleString()} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold text-primary">${book.price.toFixed(2)}</span>
            <span className={`text-sm font-medium ${book.stock > 0 ? "text-emerald-600" : "text-destructive"}`}>
              {book.stock > 0 ? (book.stock < 10 ? `Only ${book.stock} left!` : "In Stock") : "Out of Stock"}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                disabled={quantity >= book.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-2 font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3">About this book</h2>
            <p className="text-muted-foreground leading-relaxed">{book.description}</p>
          </div>

          {/* Book Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Hash, label: "ISBN", value: book.isbn },
              { icon: Layers, label: "Pages", value: book.pages.toString() },
              { icon: Calendar, label: "Published", value: book.publishedYear.toString() },
              { icon: BookOpen, label: "Category", value: book.category },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Books */}
      {related.length > 0 && (
        <section>
          <Separator className="mb-8" />
          <h2 className="text-2xl font-bold mb-6">More in {book.category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
