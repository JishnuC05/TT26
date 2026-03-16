import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin, Github, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <BookOpen className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-lg font-semibold">
                Book<span className="text-accent">Wave</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
              Your premier destination for books across every genre. Discover, explore, and fall in love with reading again.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Twitter" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Github" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-accent mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/books", label: "Browse Books" },
                { to: "/cart", label: "Shopping Cart" },
                { to: "/orders", label: "My Orders" },
                { to: "/login", label: "Sign In" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-accent mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                123 Literary Lane, Book City, BC 10001
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                +1 (555) 234-5678
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                hello@bookwave.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} BookWave. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/50">
            Built with ❤️ using Spring Boot &amp; React
          </p>
        </div>
      </div>
    </footer>
  );
}
