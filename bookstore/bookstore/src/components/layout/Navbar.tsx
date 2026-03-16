import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, BookOpen, Menu, X, Search, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useBooksStore } from "@/stores/booksStore";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const setSearchQuery = useBooksStore((s) => s.setSearchQuery);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (e.currentTarget.querySelector("input") as HTMLInputElement)?.value;
    setSearchQuery(value);
    navigate("/books");
    setSearchOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Browse Books" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <BookOpen className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Book<span className="text-accent">Wave</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isActive(link.to) ? "text-accent" : "text-primary-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname.startsWith("/admin") ? "text-accent" : "text-primary-foreground/80"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground/80 hover:text-accent hover:bg-white/10"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground/80 hover:text-accent hover:bg-white/10"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-0">
                  {totalItems()}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-white/10 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {user.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex border-white/20 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              onClick={() => navigate("/login")}
            >
              <User className="mr-1.5 h-4 w-4" />
              Sign In
            </Button>
          )}

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground/80 hover:bg-white/10"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-white/10 bg-primary px-4 py-3">
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50" />
              <Input
                placeholder="Search books, authors, categories..."
                className="pl-9 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-accent"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block py-2 text-sm font-medium transition-colors hover:text-accent ${
                isActive(link.to) ? "text-accent" : "text-primary-foreground/80"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              to="/admin"
              className="block py-2 text-sm font-medium text-primary-foreground/80 hover:text-accent"
              onClick={() => setMobileOpen(false)}
            >
              Admin
            </Link>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="block py-2 text-sm font-medium text-accent" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
