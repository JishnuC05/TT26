import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useBooksStore } from "@/stores/booksStore";
import type { OrderStatus } from "@/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  PENDING: "⏳",
  PROCESSING: "⚙️",
  SHIPPED: "🚚",
  DELIVERED: "✅",
  CANCELLED: "❌",
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { orders, fetchOrders } = useBooksStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Please sign in</h2>
        <p className="text-muted-foreground text-center">Sign in to view your orders.</p>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const userOrders = user?.role === "ADMIN"
    ? orders
    : orders.filter((o) => o.userId === user?.id);

  if (userOrders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No orders yet</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          You haven't placed any orders. Browse our collection and find something you'll love!
        </p>
        <Button onClick={() => navigate("/books")} className="gap-2 mt-2">
          <BookOpen className="h-4 w-4" /> Browse Books
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-8">{userOrders.length} order{userOrders.length !== 1 ? "s" : ""}</p>

      <div className="space-y-4">
        {userOrders.map((order) => (
          <Card key={order.id} className="border-border hover:shadow-sm transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{order.id}</span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[order.status]}`}>
                      {STATUS_ICONS[order.status]} {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-right sm:text-right">
                  <p className="text-lg font-bold text-primary">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Items */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {order.items.map(({ book, quantity }) => (
                  <div key={book.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 shrink-0">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="h-10 w-7 object-cover rounded border"
                    />
                    <div>
                      <p className="text-xs font-medium line-clamp-1 max-w-[120px]">{book.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {order.status === "SHIPPED" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                  <span>🚚</span>
                  <span>Your order is on the way! Expected delivery in 2-3 days.</span>
                </div>
              )}
              {order.status === "DELIVERED" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                  <span>✅</span>
                  <span>Delivered! Enjoy your books.</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
