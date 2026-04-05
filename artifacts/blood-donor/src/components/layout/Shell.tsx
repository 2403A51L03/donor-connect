import { Link, useLocation } from "wouter";
import { Activity, Droplet, Heart, Menu, Bell, X, Users, Home, LogIn, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDonorAuth } from "@/contexts/DonorAuthContext";
import { useListNotifications } from "@workspace/api-client-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isRegistered, donorId, logout } = useDonorAuth();

  // Fetch notifications to get unread count
  const { data: notifications } = useListNotifications(
    { donorId: donorId || 0, unread: true },
    { query: { enabled: !!donorId } }
  );

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/requests", label: "Blood Requests", icon: Activity },
    { href: "/donors", label: "Find Donors", icon: Users },
  ];

  if (isRegistered) {
    navLinks.push({ href: "/notifications", label: "Alerts", icon: Bell });
    navLinks.push({ href: "/profile", label: "My Profile", icon: User });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                Life<span className="text-primary">Stream</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:text-primary relative",
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {link.href === "/notifications" && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}

              {!isRegistered && (
                <div className="flex items-center gap-3 ml-2">
                  <Link
                    href="/login"
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 hover:text-primary",
                      location === "/login" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Link>
                  <Link
                    href="/donors/register"
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                  >
                    <Heart className="w-4 h-4" />
                    Become a Donor
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center gap-4 md:hidden">
              {isRegistered && (
                <Link href="/notifications" className="relative text-foreground">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white border border-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-border shadow-xl px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl font-semibold",
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
                {link.href === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
            {isRegistered ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-xl font-semibold text-destructive hover:bg-destructive/10"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl font-semibold",
                    location === "/login" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <LogIn className="w-5 h-5" />
                  Log In
                </Link>
                <Link
                  href="/donors/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl font-semibold",
                    location === "/donors/register" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <Heart className="w-5 h-5" />
                  Become a Donor
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
