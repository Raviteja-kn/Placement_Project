"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Grid,
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  Database,
  Lock,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome back to GuestGrid");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@guestgrid.com");
    setPassword("admin123");
    toast("Demo credentials applied. Click 'Sign In' or 'Initialize Demo Data' below.", {
      icon: "🔑",
    });
  };

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Demo event loaded! Ready to sign in.");
        setEmail("admin@guestgrid.com");
        setPassword("admin123");
      } else {
        toast.error(data.error || "Failed to initialize demo data");
      }
    } catch {
      toast.error("Database connection issue. Check MongoDB URI.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Left Column: Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-slate-800 bg-slate-950/60">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950 shadow-md">
              <Grid className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">GuestGrid</span>
              <span className="ml-2 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                v2.4 LTS
              </span>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Event Guest & Seating Management, Solved.
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Eliminate seating chaos, prevent duplicate entries, and preserve family groupings with intelligent allocation algorithms.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Strict Duplicate Detection</h4>
                  <p className="text-xs text-slate-400">
                    Cross-checks phone numbers and names across registers to prevent duplicate check-ins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Family & Group Clustering</h4>
                  <p className="text-xs text-slate-400">
                    Allocates whole families to common tables without splitting, validating table capacity upfront.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Real-Time Check-in Desk</h4>
                  <p className="text-xs text-slate-400">
                    Instant guest ID scanning, table direction cards, and live attendance metrics for venue managers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          <span>Hospitality & Events Foundation Project</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            MongoDB Atlas Connected
          </span>
        </div>
      </div>

      {/* Right Column: Login Portal */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
              <Grid className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white">GuestGrid</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Organizer Sign In</h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Access your event registry, table charts, and reception desk.
            </p>
          </div>

          {/* Quick Demo Access banner */}
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Placement Demo Access
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Autofill Credentials
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Email: <code className="text-emerald-300 font-mono">admin@guestgrid.com</code> | Pass: <code className="text-emerald-300 font-mono">admin123</code>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="organizer@event.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Seed Button for instant testing */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSeedDemoData}
              disabled={seeding}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>{seeding ? "Populating Demo Database..." : "Reset / Seed Demo Event Data"}</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Need a new organizer account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
