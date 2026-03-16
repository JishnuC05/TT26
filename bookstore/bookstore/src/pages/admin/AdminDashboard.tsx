import { useNavigate } from "react-router-dom";
import { BookOpen, ShoppingBag, Users, DollarSign, TrendingUp, ArrowRight, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBooksStore } from "@/stores/booksStore";
import { useAuthStore } from "@/stores/authStore";
import type { OrderStatus } from "@/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { books, orders } = useBooksStore();

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">🔒</p>
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to view this page.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length;
  const lowStockBooks = books.filter((b) => b.stock < 10).length;

  const stats = [
    {
      label: "Total Books",
      value: books.length,
      icon: BookOpen,
      sub: `${lowStockBooks} low stock`,
      color: "text-blue-600 bg-blue-50",
      onClick: () => navigate("/admin/books"),
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      sub: `${pendingOrders} pending`,
      color: "text-amber-600 bg-amber-50",
      onClick: () => navigate("/admin/orders"),
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      sub: `${orders.filter((o) => o.status === "DELIVERED").length} delivered`,
      color: "text-emerald-600 bg-emerald-50",
      onClick: undefined,
    },
    {
      label: "Customers",
      value: "2",
      icon: Users,
      sub: "1 admin, 1 user",
      color: "text-purple-600 bg-purple-50",
      onClick: undefined,
    },
  ];

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user.name}! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, sub, color, onClick }) => (
          <Card
            key={label}
            className={`border-border transition-shadow hover:shadow-md ${onClick ? "cursor-pointer" : ""}`}
            onClick={onClick}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-0.5">{value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")} className="gap-1 text-xs">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="pl-5 font-medium text-sm">{order.id}</TableCell>
                      <TableCell className="text-sm">{order.userName}</TableCell>
                      <TableCell className="text-sm font-medium">${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + Low Stock */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gap-2 h-9" onClick={() => navigate("/admin/books")}>
                <BookOpen className="h-4 w-4" /> Manage Books
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9" onClick={() => navigate("/admin/orders")}>
                <Package className="h-4 w-4" /> Manage Orders
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9" onClick={() => navigate("/books")}>
                <ShoppingBag className="h-4 w-4" /> View Store
              </Button>
            </CardContent>
          </Card>

          {/* Low Stock Warning */}
          {lowStockBooks > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-amber-800 text-sm mb-2">⚠️ Low Stock Alert</h3>
                <div className="space-y-1.5">
                  {books
                    .filter((b) => b.stock < 10)
                    .map((b) => (
                      <div key={b.id} className="flex justify-between text-xs text-amber-700">
                        <span className="line-clamp-1 flex-1 mr-2">{b.title}</span>
                        <Badge className="bg-amber-200 text-amber-800 border-0 shrink-0">
                          {b.stock} left
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
