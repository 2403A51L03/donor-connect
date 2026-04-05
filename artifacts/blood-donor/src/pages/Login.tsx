import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Droplet, Mail, ArrowRight, HeartPulse, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { Card, Button, Input } from "@/components/shared/UI";
import { useDonorAuth } from "@/contexts/DonorAuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setDonorId } = useDonorAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      const donor = await res.json();
      setDonorId(donor.id);
      toast({
        title: `Welcome back, ${donor.name}!`,
        description: `Logged in as ${donor.bloodType} blood type donor.`,
      });
      setLocation("/");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-rose-500 text-white shadow-lg shadow-primary/30 mb-5">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Sign in to access your donor profile and notifications.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                autoFocus
                autoComplete="email"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive flex items-center gap-1.5"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">New here?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Link href="/donors/register">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-colors duration-200">
              <HeartPulse className="w-4 h-4" />
              Register as a Donor
            </button>
          </Link>
        </Card>

        {/* Note */}
        <div className="mt-6 bg-primary/5 border border-primary/15 rounded-xl px-5 py-4 flex gap-3">
          <Droplet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use your registered email to identify your account. No password needed — your email is your key.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
