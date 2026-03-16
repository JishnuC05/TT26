import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { getAuthHeaders } from "@/stores/authStore";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const shipping = totalPrice() > 30 ? 0 : 4.99;
  const tax = totalPrice() * 0.08;
  const grandTotal = totalPrice() + shipping + tax;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to place an order");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // Create order from cart
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        toast.success("Order placed successfully! 🎉");
        navigate("/orders");
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Looks like you haven't added any books yet. Start browsing to fill it up!
        </p>
        <Button onClick={() => navigate("/books")} className="gap-2 mt-2">
          <BookOpen className="h-4 w-4" /> Browse Books
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
      <p className="text-muted-foreground mb-8">{totalItems()} item{totalItems() !== 1 ? "s" : ""} in your cart</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ book, quantity }) => (
            <div
              key={book.id}
              className="flex gap-4 bg-card border border-border rounded-xl p-4 transition-shadow hover:shadow-sm"
            >
              <Link to={`/books/${book.id}`} className="shrink-0">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="h-28 w-20 object-cover rounded-lg border border-border"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">{book.category}</Badge>
                    <Link to={`/books/${book.id}`}>
                      <h3 className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => { removeItem(book.id); toast.info("Item removed"); }}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(book.id, quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(book.id, quantity + 1)}
                      disabled={quantity >= book.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${(book.price * quantity).toFixed(2)}</p>
                    {quantity > 1 && (
                      <p className="text-xs text-muted-foreground">${book.price.toFixed(2)} each</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { clearCart(); toast.info("Cart cleared"); }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({totalItems()} items)</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? "text-emerald-600 font-medium" : ""}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {totalPrice() < 30 && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">
                  Add ${(30 - totalPrice()).toFixed(2)} more for free shipping!
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-6 gap-2 font-medium"
            >
              {loading ? "Processing..." : "Proceed to Checkout"} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/books")}
              className="w-full mt-2"
            >
              Continue Shopping
            </Button>

            <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">✅ Secure checkout with SSL encryption</p>
              <p className="flex items-center gap-1.5">🔄 30-day hassle-free returns</p>
              <p className="flex items-center gap-1.5">🚚 Fast delivery in 3–5 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
