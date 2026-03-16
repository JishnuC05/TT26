import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useBooksStore } from "@/stores/booksStore";
import { useAuthStore } from "@/stores/authStore";
import type { OrderStatus } from "@/types";
import { toast } from "sonner";

const ALL_STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export function ManageOrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { orders, updateOrderStatus } = useBooksStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "All">("All");

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">🔒</p>
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast.success(`Order ${orderId} updated to ${status}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order or customer..."
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as OrderStatus | "All")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status summary */}
        <div className="hidden sm:flex items-center gap-2 ml-auto text-xs text-muted-foreground">
          {ALL_STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            if (!count) return null;
            return (
              <span key={s} className={`px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[s]}`}>
                {s}: {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5">Update Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="pl-5 font-medium text-sm">{order.id}</TableCell>
                <TableCell className="text-sm">{order.userName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {order.items.map((i) => `${i.quantity}× ${i.book.title}`).join(", ").slice(0, 40)}
                  {order.items.map((i) => `${i.quantity}× ${i.book.title}`).join(", ").length > 40 ? "..." : ""}
                </TableCell>
                <TableCell className="font-semibold">${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="pr-5">
                  <Select
                    value={order.status}
                    onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
