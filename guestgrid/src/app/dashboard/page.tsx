"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  Grid,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Crown,
  HeartHandshake,
  FileText,
  RotateCw,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import GuestForm from "@/components/GuestForm";
import toast from "react-hot-toast";
import { IGuest, ITable } from "@/lib/types";

interface DashboardData {
  totalGuests: number;
  checkedInGuests: number;
  pendingArrivals: number;
  totalTables: number;
  totalCapacity: number;
  occupiedSeats: number;
  availableSeats: number;
  attendancePercentage: number;
  venueOccupancyPercentage: number;
  vipCount: number;
  cancelledCount: number;
  waitlistCount: number;
  groupCount: number;
  fullyOccupiedTables: number;
  tablesWithSpace: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [tables, setTables] = useState<Array<ITable & { occupied?: number; available?: number }>>([]);
  const [recentGuests, setRecentGuests] = useState<IGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, tablesRes, guestsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/tables"),
        fetch("/api/guests?status=active"),
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        setStats(d);
      }
      if (tablesRes.ok) {
        const t = await tablesRes.json();
        setTables(t.tables || []);
      }
      if (guestsRes.ok) {
        const g = await guestsRes.json();
        setRecentGuests((g.guests || []).slice(0, 6));
      }
    } catch {
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRegisterGuest = async (formData: Partial<IGuest>) => {
    setFormLoading(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 409) {
        toast.error(`Duplicate warning: ${data.warning || "Guest already registered"}`);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to register guest");
      }

      toast.success(`Guest ${data.guest?.guestId || ""} registered successfully`);
      setIsAddModalOpen(false);
      fetchDashboardData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Event Seating Operations
            </h1>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Live Venue
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time guest registry, duplicate prevention, table allocations, and check-in desk.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh metrics"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/dashboard/checkin"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-2xs"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Reception Desk</span>
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Guest</span>
          </button>
        </div>
      </div>

      {/* Row 1: Primary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Registered"
          value={stats?.totalGuests ?? (loading ? "..." : 0)}
          subtitle={`${stats?.vipCount ?? 0} VIPs included`}
          icon={<Users className="h-5 w-5 text-slate-700" />}
          highlight="default"
        />

        <StatsCard
          title="Guests Arrived"
          value={stats?.checkedInGuests ?? (loading ? "..." : 0)}
          subtitle={`${stats?.attendancePercentage ?? 0}% Attendance`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          highlight="success"
          trend={{
            value: `${stats?.attendancePercentage ?? 0}% Checked-in`,
            positive: true,
          }}
        />

        <StatsCard
          title="Pending Arrivals"
          value={stats?.pendingArrivals ?? (loading ? "..." : 0)}
          subtitle="Awaiting guest check-in"
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          highlight="warning"
        />

        <StatsCard
          title="Available Seats"
          value={stats?.availableSeats ?? (loading ? "..." : 0)}
          subtitle={`Total capacity: ${stats?.totalCapacity ?? 0}`}
          icon={<Grid className="h-5 w-5 text-blue-600" />}
          highlight="info"
        />
      </div>

      {/* Venue Capacity Status Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Venue Seating Capacity & Occupancy Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Total Tables: {stats?.totalTables ?? 0} | Seated: {stats?.occupiedSeats ?? 0} /{" "}
              {stats?.totalCapacity ?? 0} seats
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900">
              {stats?.venueOccupancyPercentage ?? 0}%
            </span>
            <span className="text-xs text-slate-500 ml-1">Occupied</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(stats?.venueOccupancyPercentage ?? 0, 100)}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Occupied: {stats?.occupiedSeats ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-200"></span>
            Available: {stats?.availableSeats ?? 0}
          </span>
          <span>Fully Seated Tables: {stats?.fullyOccupiedTables ?? 0}</span>
          <span>Tables with Open Seats: {stats?.tablesWithSpace ?? 0}</span>
        </div>
      </div>

      {/* Two Column Layout: Floor Status & Recent Registrations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Table Seating Quick Map (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Table Seating Summary</h3>
              <p className="text-xs text-slate-500">Visual table capacity and occupancy status</p>
            </div>
            <Link
              href="/dashboard/tables"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>Manage Tables</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tables.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                No tables defined yet. Click &quot;Manage Tables&quot; to configure banquet seating.
              </div>
            ) : (
              tables.map((t) => {
                const occupied = t.occupied ?? 0;
                const available = t.available ?? t.capacity - occupied;
                const isFull = available <= 0;
                const pct = Math.round((occupied / t.capacity) * 100);

                return (
                  <div
                    key={t.tableNumber}
                    className={`rounded-lg border p-3.5 transition-all ${
                      isFull
                        ? "border-rose-200 bg-rose-50/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 font-mono text-xs font-bold text-white">
                          T{t.tableNumber}
                        </span>
                        <div>
                          <span className="text-xs font-semibold text-slate-900">
                            Table {t.tableNumber}
                          </span>
                          {t.label && (
                            <span className="ml-1.5 text-[10px] text-slate-500">
                              {t.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={isFull ? "error" : available <= 2 ? "warning" : "success"}>
                        {isFull ? "FULL" : `${available} Left`}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Seated: <strong>{occupied}</strong> / {t.capacity}
                      </span>
                      <span className="font-semibold text-slate-700">{pct}%</span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${
                          isFull
                            ? "bg-rose-500"
                            : pct > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Registrations & Quick Actions (1 Col) */}
        <div className="space-y-6">
          {/* Quick Hub */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Quick Operations
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2.5">
              <Link
                href="/dashboard/checkin"
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Fast Check-in</p>
                    <p className="text-[11px] text-slate-500">Scan ID & verify table number</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/groups"
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Group & Family Seating</p>
                    <p className="text-[11px] text-slate-500">Batch-seat family members together</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/reports"
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Download Reports</p>
                    <p className="text-[11px] text-slate-500">Text & audit file exports</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Recent Guest Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
              <Link
                href="/dashboard/guests"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View All
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {recentGuests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No guest registrations yet.
                </div>
              ) : (
                recentGuests.map((guest) => (
                  <div key={guest.guestId} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {guest.guestId}
                        </span>
                        <span className="truncate text-xs font-medium text-slate-800">
                          {guest.name}
                        </span>
                        {guest.isVIP && (
                          <Crown className="h-3 w-3 text-purple-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {guest.group || "Individual"} • {guest.tableNumber > 0 ? `Table ${guest.tableNumber}` : "Unseated"}
                      </p>
                    </div>
                    <Badge variant={guest.checkedIn ? "success" : "neutral"}>
                      {guest.checkedIn ? "Checked In" : "Pending"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Guest"
        description="Add a guest record with instant duplicate check and table assignment."
        maxWidth="lg"
      >
        <GuestForm
          tables={tables}
          onSubmit={handleRegisterGuest}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={formLoading}
        />
      </Modal>
    </div>
  );
}
