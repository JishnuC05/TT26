import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cartStore";
import type { Book } from "@/types";
import { toast } from "sonner";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(book);
    toast.success(`"${book.title}" added to cart!`);
  };

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={book.cover}
            alt={`${book.title} cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge className="absolute top-2 left-2 text-xs bg-accent text-accent-foreground border-0 shadow">
            {book.category}
          </Badge>
          <Button
            size="sm"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white text-primary hover:bg-white/90 text-xs font-medium shadow-lg whitespace-nowrap"
            onClick={handleAddToCart}
            aria-label={`Add ${book.title} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add to Cart
          </Button>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({book.reviews.toLocaleString()})</span>
            </div>
            <span className="text-sm font-bold text-primary">${book.price.toFixed(2)}</span>
          </div>
          {book.stock < 10 && (
            <p className="mt-1 text-xs text-destructive font-medium">Only {book.stock} left!</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
