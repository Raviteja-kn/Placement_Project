"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HeartHandshake,
  Users,
  Grid,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  ShieldAlert,
  Crown,
} from "lucide-react";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { ITable } from "@/lib/types";

interface GroupData {
  _id: string; // Group Name
  memberCount: number;
  members: Array<{
    guestId: string;
    name: string;
    phone: string;
    tableNumber: number;
    checkedIn: boolean;
    isVIP: boolean;
  }>;
  tableNumbers: number[];
  allAtSameTable: boolean;
  singleTableNumber: number | null;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [tables, setTables] = useState<Array<ITable & { occupied?: number; available?: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Group Allocation Modal state
  const [allocatingGroup, setAllocatingGroup] = useState<GroupData | null>(null);
  const [targetTableNumber, setTargetTableNumber] = useState<number>(1);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGroupsData = useCallback(async () => {
    try {
      setLoading(true);
      const [gRes, tRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/tables"),
      ]);

      if (gRes.ok) {
        const data = await gRes.json();
        setGroups(data.groups || []);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTables(tData.tables || []);
      }
    } catch {
      toast.error("Failed to load family & group data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupsData();
  }, [fetchGroupsData]);

  const handleGroupAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingGroup) return;

    setActionLoading(true);
    setAllocationError(null);

    try {
      const res = await fetch("/api/tables/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: allocatingGroup._id,
          tableNumber: Number(targetTableNumber),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setAllocationError(
            `Table ${data.details.tableNumber} only has ${data.details.availableSeats} available seat(s), but ${allocatingGroup._id} has ${data.details.guestsToAllocate} members. The system will not split families!`
          );
        } else {
          setAllocationError(data.error || "Group allocation failed");
        }
        return;
      }

      toast.success(
        `All ${allocatingGroup.memberCount} members of "${allocatingGroup._id}" seated at Table ${targetTableNumber}!`
      );
      setAllocatingGroup(null);
      fetchGroupsData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAllocationError(err.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Family & Group Seating Manager
            </h1>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {groups.length} Groups
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Cluster families, corporate delegations, and friend groups together with automatic split-prevention safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchGroupsData()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Safety Policy Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-xs text-indigo-950">
        <ShieldAlert className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-indigo-900 text-sm">
            Automatic Family Protection Guarantee
          </p>
          <p className="mt-0.5 text-indigo-800 leading-relaxed">
            GuestGrid strictly checks seating capacity before allocating groups. If a selected table does not have enough consecutive seats for the entire family, the system halts the allocation and alerts the organizer rather than separating parents from children or splitting colleagues across rooms.
          </p>
        </div>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-sm">
            Loading groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-sm">
            No groups registered yet. Specify a &quot;Group / Family Name&quot; when adding guests to manage them here.
          </div>
        ) : (
          groups.map((group) => {
            const hasUnseated = group.members.some((m) => m.tableNumber === 0);
            const isSplit = group.tableNumbers.filter((t) => t > 0).length > 1;
            const singleTable = group.singleTableNumber;

            return (
              <div
                key={group._id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white shadow-xs p-5 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                        <HeartHandshake className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {group._id}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {group.memberCount} Registered Member{group.memberCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isSplit ? (
                        <Badge variant="warning">
                          <AlertTriangle className="h-3 w-3" />
                          Split Across Tables
                        </Badge>
                      ) : hasUnseated ? (
                        <Badge variant="neutral">Unassigned Seats</Badge>
                      ) : (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3" />
                          Seated at Table {singleTable}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Members Roster */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Group Members
                    </span>
                    <ul className="space-y-1.5">
                      {group.members.map((member) => (
                        <li
                          key={member.guestId}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-slate-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-slate-700">
                              {member.guestId}
                            </span>
                            <span className="font-medium text-slate-900 truncate">
                              {member.name}
                            </span>
                            {member.isVIP && (
                              <Crown className="h-3 w-3 text-purple-600 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {member.tableNumber > 0 ? (
                              <span className="font-mono text-[11px] font-semibold text-indigo-700">
                                Table {member.tableNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium">
                                No Table
                              </span>
                            )}
                            {member.checkedIn && (
                              <span title="Arrived">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {group.members.filter((m) => m.checkedIn).length} / {group.memberCount} checked in
                  </span>

                  <button
                    onClick={() => {
                      setAllocatingGroup(group);
                      setAllocationError(null);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>Seat Whole Group</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Group Allocation Modal */}
      <Modal
        isOpen={Boolean(allocatingGroup)}
        onClose={() => {
          setAllocatingGroup(null);
          setAllocationError(null);
        }}
        title={`Seat "${allocatingGroup?._id}" Together`}
        description={`Total members to seat: ${allocatingGroup?.memberCount || 0}`}
        maxWidth="md"
      >
        <form onSubmit={handleGroupAllocation} className="space-y-4">
          {allocationError && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Capacity Safety Warning</p>
                <p className="mt-0.5 leading-relaxed">{allocationError}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Destination Table
            </label>
            <select
              value={targetTableNumber}
              onChange={(e) => setTargetTableNumber(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              {tables.map((t) => {
                const avail = t.available ?? (t.capacity - (t.occupied || 0));
                const needed = allocatingGroup?.memberCount || 0;
                const canFit = avail >= needed;

                return (
                  <option key={t.tableNumber} value={t.tableNumber}>
                    Table {t.tableNumber} {t.label ? `(${t.label})` : ""} — {avail} available / {t.capacity} total {!canFit ? `[INSUFFICIENT SEATS - Needs ${needed}]` : "[FITS ENTIRE GROUP]"}
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Select a table with at least {allocatingGroup?.memberCount} free seats.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setAllocatingGroup(null);
                setAllocationError(null);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {actionLoading ? "Allocating..." : "Seat All Members Here"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
