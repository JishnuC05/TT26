import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { BooksPage } from "@/pages/BooksPage";
import { BookDetailPage } from "@/pages/BookDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { CartPage } from "@/pages/CartPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { ManageBooksPage } from "@/pages/admin/ManageBooksPage";
import { ManageOrdersPage } from "@/pages/admin/ManageOrdersPage";
import { useBooksStore } from "@/stores/booksStore";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

function App() {
  const fetchBooks = useBooksStore((state) => state.fetchBooks);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    // Initialize app data
    fetchBooks();
    checkAuth();
    fetchCart();
  }, [fetchBooks, checkAuth, fetchCart]);

  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/books" element={<ManageBooksPage />} />
            <Route path="/admin/orders" element={<ManageOrdersPage />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
