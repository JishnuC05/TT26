import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookCard } from "@/components/books/BookCard";
import { useBooksStore } from "@/stores/booksStore";
import { CATEGORIES } from "@/data/mockData";
import type { Category } from "@/types";

const ALL_CATEGORIES = ["All", ...CATEGORIES.map((c) => c.name)] as const;

export function BooksPage() {
  const {
    searchQuery,
    selectedCategory,
    sortBy,
    setSearchQuery,
    setCategory,
    setSortBy,
    filteredBooks,
    fetchBooks,
  } = useBooksStore();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat as Category);
  }, [searchParams, setCategory]);

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, selectedCategory, sortBy, fetchBooks]);

  const results = filteredBooks();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Browse Books</h1>
        <p className="text-muted-foreground mt-1">
          {results.length} book{results.length !== 1 ? "s" : ""} found
          {selectedCategory !== "All" && ` in "${selectedCategory}"`}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="rounded-xl border border-border bg-card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h2>
              {(selectedCategory !== "All" || searchQuery || sortBy !== "default") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => { setCategory("All"); setSearchQuery(""); setSortBy("default"); }}
                >
                  Clear all
                </Button>
              )}
            </div>

            <Separator className="mb-4" />

            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Categories
              </label>
              <ScrollArea className="h-48">
                <div className="space-y-1 pr-2">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat as Category | "All")}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator className="mb-4" />

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Sort by
              </label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="title">Title A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, category..."
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {(selectedCategory !== "All" || searchQuery) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory !== "All" && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {selectedCategory}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setCategory("All")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  "{searchQuery}"
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}

          {/* Book Grid */}
          {results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📚</p>
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
              <Button onClick={() => { setSearchQuery(""); setCategory("All"); setSortBy("default"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
