import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, BookOpen, Users, Package, Star, ChevronRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookCard } from "@/components/books/BookCard";
import { useBooksStore } from "@/stores/booksStore";
import { CATEGORIES } from "@/data/mockData";
import type { Category } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  Fiction: "from-blue-500 to-indigo-600",
  "Non-Fiction": "from-emerald-500 to-teal-600",
  Science: "from-cyan-500 to-blue-600",
  History: "from-amber-500 to-orange-600",
  Technology: "from-violet-500 to-purple-600",
  "Self-Help": "from-green-500 to-emerald-600",
  Fantasy: "from-pink-500 to-rose-600",
  Biography: "from-yellow-500 to-amber-600",
};

export function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { books, setSearchQuery, setCategory } = useBooksStore();

  const featuredBooks = books.slice(0, 6);
  const topRatedBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setCategory("All");
    navigate("/books");
  };

  const handleCategoryClick = (cat: Category) => {
    setSearchQuery("");
    setCategory(cat);
    navigate("/books");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 text-sm">
            📚 Over 1,000+ Books Available
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Your Next Great<br />
            <span className="text-accent">Read Awaits</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore thousands of books across every genre. Browse, discover, and have your favorites delivered right to your door.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl mb-8">
            <div className="flex gap-2 bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, author, or genre..."
                  className="pl-9 bg-transparent border-0 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-0 text-base h-11"
                />
              </div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 h-11 rounded-lg font-medium">
                Search
              </Button>
            </div>
          </form>

          {/* Quick categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Fiction", "Science", "Technology", "Fantasy"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat as Category)}
                className="text-sm px-4 py-1.5 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground border border-white/20 text-primary-foreground/80 transition-all duration-200 hover:scale-105"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-background [clip-path:ellipse(55%_100%_at_50%_100%)]" />
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-2 py-12">
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto text-center">
          {[
            { icon: BookOpen, value: "1,200+", label: "Books" },
            { icon: Users, value: "15,000+", label: "Happy Readers" },
            { icon: Package, value: "98%", label: "On-time Delivery" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon className="h-7 w-7 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Featured Books</h2>
            <p className="text-muted-foreground text-sm mt-1">Hand-picked selections for you</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/books")} className="text-primary hover:text-accent gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-secondary/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground text-sm mt-1">Find your next read in your favorite genre</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name as Category)}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[cat.name]} p-5 text-white text-left transition-transform duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <p className="font-semibold text-sm">{cat.name}</p>
                <p className="text-xs text-white/70">{cat.count} books</p>
                <ArrowRight className="absolute right-3 bottom-3 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 fill-accent text-accent" />
              Top Rated
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Most loved by our readers</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/books")} className="text-primary hover:text-accent gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {topRatedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Why BookWave?</h2>
            <p className="text-primary-foreground/70 text-sm mt-2">We make book buying simple and enjoyable</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Secure Payments",
                desc: "Your transactions are protected with bank-grade security and JWT authentication.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Get your books delivered within 3-5 business days with real-time order tracking.",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "Not satisfied? Return within 30 days, no questions asked.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="bg-white/10 border-white/10 text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-primary-foreground/70 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl bg-accent/10 border border-accent/20 p-10">
          <h2 className="text-3xl font-bold mb-3">Start Your Reading Journey</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join over 15,000 readers who trust BookWave for their literary adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/books")} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              Browse Books
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8">
              Create Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
