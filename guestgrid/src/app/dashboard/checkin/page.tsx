"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Search,
  Grid,
  UserCheck,
  AlertCircle,
  Crown,
  Phone,
  RotateCw,
  Clock,
  Sparkles,
} from "lucide-react";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";
import { IGuest } from "@/lib/types";

export default function CheckInPage() {
  const [guestIdInput, setGuestIdInput] = useState("");
  const [foundGuest, setFoundGuest] = useState<IGuest | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<IGuest[]>([]);
  const [checkInStats, setCheckInStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percentage: 0,
  });

  const fetchAttendanceStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const d = await res.json();
        setCheckInStats({
          total: d.totalGuests || 0,
          checkedIn: d.checkedInGuests || 0,
          pending: d.pendingArrivals || 0,
          percentage: d.attendancePercentage || 0,
        });
      }

      // Fetch recent checked in guests
      const gRes = await fetch("/api/guests?status=active&checkedIn=true");
      if (gRes.ok) {
        const gData = await gRes.json();
        setRecentCheckIns((gData.guests || []).slice(0, 8));
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchAttendanceStats();
  }, [fetchAttendanceStats]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestIdInput.trim()) return;

    setLoading(true);
    setFoundGuest(null);

    try {
      const query = guestIdInput.trim();
      const res = await fetch(`/api/guests?search=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Lookup failed");

      if (data.guests && data.guests.length > 0) {
        setFoundGuest(data.guests[0]);
      } else {
        toast.error(`No guest found matching "${query}"`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCheckIn = async () => {
    if (!foundGuest) return;

    setCheckingIn(true);
    try {
      const res = await fetch("/api/guests/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: foundGuest.guestId }),
      });

      const data = await res.json();

      if (res.status === 409) {
        toast.error(`Already checked in! Arrival was logged earlier.`);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Check-in failed");
      }

      toast.success(
        `SUCCESS: ${foundGuest.name} checked in! Direct to Table ${foundGuest.tableNumber || "Unassigned"}`
      );
      setFoundGuest(data.guest);
      fetchAttendanceStats();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reception Desk & Fast Check-In
            </h1>
            <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Station 1 Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Verify guest ID, look up seating directions, and stamp arrival times instantly.
          </p>
        </div>

        <button
          onClick={() => fetchAttendanceStats()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Attendance Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Expected</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{checkInStats.total}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Checked In</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{checkInStats.checkedIn}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Pending Arrivals</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{checkInStats.pending}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Attendance Rate</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{checkInStats.percentage}%</p>
        </div>
      </div>

      {/* Central Check-In Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search & Verification Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Guest Lookup & Verification
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter the unique Guest ID (e.g. G001), phone number, or attendee name.
            </p>

            <form onSubmit={handleLookup} className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={guestIdInput}
                  onChange={(e) => setGuestIdInput(e.target.value)}
                  placeholder="Enter Guest ID (e.g. G001, G002) or Phone Number..."
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Searching..." : "Lookup Guest"}
              </button>
            </form>

            {/* Quick Guest ID shortcut buttons */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span>Quick tests:</span>
              {["G001", "G002", "G005", "G008", "G010"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setGuestIdInput(id);
                  }}
                  className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700 hover:bg-slate-200"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Verification Result Card */}
          {foundGuest ? (
            <div className="rounded-xl border-2 border-emerald-500/80 bg-white p-6 shadow-md transition-all animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    RECORD {foundGuest.guestId}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {foundGuest.name}
                    </h3>
                    {foundGuest.isVIP && (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                        <Crown className="h-3.5 w-3.5" />
                        VIP GUEST
                      </span>
                    )}
                  </div>
                </div>

                <Badge variant={foundGuest.checkedIn ? "success" : "warning"} size="md">
                  {foundGuest.checkedIn ? "ALREADY CHECKED IN" : "AWAITING ARRIVAL"}
                </Badge>
              </div>

              {/* Seating Direction Banner */}
              <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  Assigned Seating Destination
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-lg">
                    {foundGuest.tableNumber > 0 ? `T${foundGuest.tableNumber}` : "?"}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {foundGuest.tableNumber > 0
                        ? `Table ${foundGuest.tableNumber}`
                        : "No Table Allocated Yet"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Group / Party: <strong>{foundGuest.group || "Individual Registration"}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Details Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 block">Phone Contact:</span>
                  <span className="font-mono font-medium text-slate-900">{foundGuest.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Special Requirements:</span>
                  <span className="text-slate-900 font-medium">
                    {foundGuest.specialRequirements || "None noted"}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                {foundGuest.checkedIn ? (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3.5 text-xs text-emerald-800 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>
                        Guest successfully verified and checked in!
                        {foundGuest.checkedInAt && (
                          <span className="block text-[11px] text-emerald-700 mt-0.5">
                            Arrival logged at {new Date(foundGuest.checkedInAt).toLocaleTimeString()}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleExecuteCheckIn}
                    disabled={checkingIn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-base font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{checkingIn ? "Logging Arrival..." : "CONFIRM GUEST CHECK-IN"}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 bg-white">
              <UserCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No Guest Selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Search above with Guest ID or phone number to load attendee verification details and seating directives.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Check-in Feed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600" />
              Recent Arrivals
            </h3>
            <span className="text-[11px] text-slate-500">Live feed</span>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {recentCheckIns.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No check-ins recorded yet for this session.
              </div>
            ) : (
              recentCheckIns.map((g) => (
                <div key={g.guestId} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <span className="font-mono text-emerald-700">{g.guestId}</span>
                      <span className="truncate max-w-[120px]">{g.name}</span>
                      {g.isVIP && <Crown className="h-3 w-3 text-purple-600" />}
                    </div>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                      T{g.tableNumber || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    <span>{g.group || "Individual"}</span>
                    <span>
                      {g.checkedInAt
                        ? new Date(g.checkedInAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Checked in"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
