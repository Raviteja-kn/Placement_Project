"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileBarChart,
  Download,
  Printer,
  RotateCw,
  TrendingUp,
  Users,
  Grid,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Crown,
  FileText,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import toast from "react-hot-toast";

interface ReportData {
  summary: {
    totalGuests: number;
    checkedInGuests: number;
    pendingArrivals: number;
    vipCount: number;
    cancelledCount: number;
    waitlistCount: number;
    totalTables: number;
    totalCapacity: number;
    occupiedSeats: number;
    availableSeats: number;
    attendancePercentage: number;
    venueOccupancyPercentage: number;
    groupCount: number;
  };
  tableBreakdown: Array<{
    tableNumber: number;
    capacity: number;
    occupied: number;
    available: number;
    occupancyPercent: number;
    label: string;
    isFullyOccupied: boolean;
  }>;
  groupBreakdown: Array<{
    groupName: string;
    memberCount: number;
    tableNumbers: number[];
    isSeatedTogether: boolean;
  }>;
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports?format=json");
      if (!res.ok) throw new Error("Failed to fetch event analytics");
      const data = await res.json();
      setReport(data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownloadTextReport = async () => {
    try {
      setDownloading(true);
      const res = await fetch("/api/reports?format=text");
      if (!res.ok) throw new Error("Could not generate text report");

      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GuestGrid_Event_Report_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Event report downloaded successfully!");
    } catch {
      toast.error("Failed to download text report");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const s = report?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Event Analytics & Audit Reports
            </h1>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              Generated Live
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Official breakdown of registration totals, room capacity utilization, and attendance percentages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchReport()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleDownloadTextReport}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading ? "Exporting..." : "Download Text File (.txt)"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registered"
          value={s?.totalGuests ?? (loading ? "..." : 0)}
          subtitle={`${s?.groupCount ?? 0} groups / families`}
          icon={<Users className="h-5 w-5 text-slate-700" />}
        />

        <StatsCard
          title="Attendance Rate"
          value={`${s?.attendancePercentage ?? 0}%`}
          subtitle={`${s?.checkedInGuests ?? 0} of ${s?.totalGuests ?? 0} arrived`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          highlight="success"
        />

        <StatsCard
          title="Venue Seating"
          value={`${s?.occupiedSeats ?? 0} / ${s?.totalCapacity ?? 0}`}
          subtitle={`${s?.availableSeats ?? 0} open seats remain`}
          icon={<Grid className="h-5 w-5 text-blue-600" />}
          highlight="info"
        />

        <StatsCard
          title="Occupancy Level"
          value={`${s?.venueOccupancyPercentage ?? 0}%`}
          subtitle={`Across ${s?.totalTables ?? 0} banquet tables`}
          icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
          highlight="purple"
        />
      </div>

      {/* Formatted Console Report Box (Matching C console design) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 font-mono shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            <span>Console Format Event Report (Section 8 Standard)</span>
          </div>
          <span className="text-slate-400 text-xs">GuestGrid C Engine Compatible</span>
        </div>

        <pre className="text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
{`==================== EVENT REPORT ====================

Total Registered Guests : ${String(s?.totalGuests ?? 0).padEnd(6)}
Total Checked-in        : ${String(s?.checkedInGuests ?? 0).padEnd(6)}
Pending Arrivals        : ${String(s?.pendingArrivals ?? 0).padEnd(6)}

Total Tables            : ${String(s?.totalTables ?? 0).padEnd(6)}
Total Seating Capacity  : ${String(s?.totalCapacity ?? 0).padEnd(6)}
Occupied Seats          : ${String(s?.occupiedSeats ?? 0).padEnd(6)}
Available Seats         : ${String(s?.availableSeats ?? 0).padEnd(6)}

VIP Guests Registered   : ${String(s?.vipCount ?? 0).padEnd(6)}
Waitlisted Registrations: ${String(s?.waitlistCount ?? 0).padEnd(6)}
Cancelled Registrations : ${String(s?.cancelledCount ?? 0).padEnd(6)}

Attendance Percentage   : ${s?.attendancePercentage ?? 0}%
Venue Occupancy Rate    : ${s?.venueOccupancyPercentage ?? 0}%

======================================================`}
        </pre>
      </div>

      {/* Table-Wise Breakdown Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Table-Wise Seating Audit
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Complete breakdown of each banquet table, seat limits, occupied vs available status.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Label / Section</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Occupied</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">Occupancy %</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.tableBreakdown?.map((t) => (
                <tr key={t.tableNumber} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    Table {t.tableNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {t.label || "Banquet Table"}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {t.capacity}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700">
                    {t.occupied}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-700">
                    {t.available}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{t.occupancyPercent}%</span>
                      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            t.isFullyOccupied ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${t.occupancyPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        t.isFullyOccupied
                          ? "bg-rose-50 text-rose-700"
                          : t.available <= 2
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {t.isFullyOccupied ? "FULL" : `${t.available} OPEN`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group-Wise Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Family & Group Seating Audit
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Verification that family and group members are kept together without being separated.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Group / Family</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Table Assignment</th>
                <th className="py-3 px-4 text-right">Grouping Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.groupBreakdown?.map((g) => (
                <tr key={g.groupName} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {g.groupName}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {g.memberCount} Guests
                  </td>
                  <td className="py-3 px-4 font-mono text-indigo-700">
                    {g.tableNumbers.filter((n) => n > 0).length > 0
                      ? g.tableNumbers.filter((n) => n > 0).map((n) => `Table ${n}`).join(", ")
                      : "Unassigned"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {g.isSeatedTogether ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        All Seated Together
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        Split or Unassigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
