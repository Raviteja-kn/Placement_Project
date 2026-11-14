"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Grid,
  HeartHandshake,
  CheckCircle2,
  FileBarChart,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Guest Registry", href: "/dashboard/guests", icon: Users },
  { name: "Table Seating", href: "/dashboard/tables", icon: Grid },
  { name: "Groups & Families", href: "/dashboard/groups", icon: HeartHandshake },
  { name: "Check-in Desk", href: "/dashboard/checkin", icon: CheckCircle2 },
  { name: "Reports & Analytics", href: "/dashboard/reports", icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
            GG
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-900 text-base">GuestGrid</span>
            <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              PRO
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-hidden"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar sidebar shell */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-bold text-slate-950 text-base shadow-sm">
              <Grid className="h-5 w-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight text-white text-base">GuestGrid</span>
              <span className="text-[11px] font-medium text-slate-400">Event Seating Platform</span>
            </div>
          </Link>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400">
            ENTERPRISE
          </span>
        </div>

        {/* Quick event indicator */}
        <div className="mx-4 mt-4 rounded-lg bg-slate-800/60 p-3 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span>Current Event</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="mt-1 font-semibold text-slate-200 truncate">
            Placement Gala & Dinner
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-400"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Session & Logout */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-emerald-400 font-semibold text-sm border border-slate-700">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {session?.user?.name || "Event Organizer"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {session?.user?.email || "admin@guestgrid.com"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
