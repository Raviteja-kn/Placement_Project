"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Plus,
  Users,
  RotateCw,
  AlertCircle,
  Crown,
  Trash2,
  Edit2,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import TableForm from "@/components/TableForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "react-hot-toast";
import { ITable, IGuest } from "@/lib/types";

interface TableWithDetails extends ITable {
  occupied: number;
  available: number;
  guests: Array<{
    _id: string;
    guestId: string;
    name: string;
    phone: string;
    group: string;
    checkedIn: boolean;
    isVIP: boolean;
  }>;
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableWithDetails[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<IGuest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<ITable | null>(null);
  const [deletingTable, setDeletingTable] = useState<ITable | null>(null);
  const [selectedTableForAlloc, setSelectedTableForAlloc] = useState<TableWithDetails | null>(null);
  const [selectedGuestToAssign, setSelectedGuestToAssign] = useState<string>("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchTablesData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, gRes] = await Promise.all([
        fetch("/api/tables"),
        fetch("/api/guests?status=active&tableNumber=0"),
      ]);

      if (tRes.ok) {
        const data = await tRes.json();
        setTables(data.tables || []);
      }

      if (gRes.ok) {
        const gData = await gRes.json();
        setUnassignedGuests(gData.guests || []);
      }
    } catch {
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTablesData();
  }, [fetchTablesData]);

  const handleCreateTable = async (formData: {
    tableNumber: number;
    capacity: number;
    label: string;
  }) => {
    setFormLoading(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create table");

      toast.success(`Table ${data.table?.tableNumber} created successfully`);
      setIsAddModalOpen(false);
      fetchTablesData();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTable = async (formData: {
    tableNumber: number;
    capacity: number;
    label: string;
  }) => {
    if (!editingTable?._id) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/tables/${editingTable._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update table");

      toast.success("Table updated successfully");
      setEditingTable(null);
      fetchTablesData();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!deletingTable?._id) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/tables/${deletingTable._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete table");

      toast.success(`Table ${deletingTable.tableNumber} deleted`);
      setDeletingTable(null);
      fetchTablesData();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAllocateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableForAlloc || !selectedGuestToAssign) return;

    setFormLoading(true);
    try {
      const res = await fetch("/api/tables/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: selectedGuestToAssign,
          tableNumber: selectedTableForAlloc.tableNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Seat allocation failed");
      }

      toast.success(`Guest ${selectedGuestToAssign} allocated to Table ${selectedTableForAlloc.tableNumber}`);
      setSelectedTableForAlloc(null);
      setSelectedGuestToAssign("");
      fetchTablesData();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUnassignGuest = async (guestId: string) => {
    try {
      const guestObj = await fetch(`/api/guests?search=${guestId}`).then((r) => r.json());
      const g = guestObj.guests?.[0];
      if (!g?._id) return;

      const res = await fetch(`/api/guests/${g._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber: 0 }),
      });

      if (!res.ok) throw new Error("Failed to unassign seat");

      toast.success(`Guest ${guestId} removed from table`);
      fetchTablesData();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
  const totalOccupied = tables.reduce((acc, t) => acc + (t.occupied || 0), 0);
  const totalAvailable = totalCapacity - totalOccupied;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Smart Table Seating Allocation
            </h1>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {tables.length} Tables
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Monitor real-time capacity, prevent overcrowding, and view table guest rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchTablesData()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Table</span>
          </button>
        </div>
      </div>

      {/* Seating Availability Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Tables</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{tables.length}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Capacity</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalCapacity} Seats</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Occupied Seats</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{totalOccupied} Seated</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Available Seats</span>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalAvailable} Free</p>
        </div>
      </div>

      {/* Unassigned Guests Notice if any */}
      {unassignedGuests.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">
                {unassignedGuests.length} Guest(s) currently unassigned to any table:
              </span>{" "}
              {unassignedGuests.slice(0, 5).map((g) => `${g.name} (${g.guestId})`).join(", ")}
              {unassignedGuests.length > 5 ? ` and ${unassignedGuests.length - 5} more...` : ""}
            </div>
          </div>
          <span className="font-semibold text-amber-800">Assign below</span>
        </div>
      )}

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400 text-sm">
            Loading table layout...
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400 text-sm">
            No tables set up yet. Click &quot;Create Table&quot; to configure event layout.
          </div>
        ) : (
          tables.map((table) => {
            const occupied = table.occupied || 0;
            const available = table.available ?? table.capacity - occupied;
            const isFull = available <= 0;
            const pct = Math.round((occupied / table.capacity) * 100);

            return (
              <div
                key={table.tableNumber}
                className={`flex flex-col justify-between rounded-xl border bg-white shadow-xs transition-all ${
                  isFull ? "border-rose-200/90" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Table Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-sm shadow-xs">
                        T{table.tableNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Table {table.tableNumber}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {table.label || "Banquet Table"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isFull ? "error" : available <= 2 ? "warning" : "success"}>
                      {isFull ? "CAPACITY REACHED" : `${available} Available`}
                    </Badge>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                      <span>
                        Occupied: <strong>{occupied}</strong> / {table.capacity}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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
                </div>

                {/* Seated Guests Roster */}
                <div className="flex-1 p-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                    <span>Assigned Guests ({table.guests?.length || 0})</span>
                  </div>

                  {(!table.guests || table.guests.length === 0) ? (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      Empty table — all {table.capacity} seats are open.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 space-y-1">
                      {table.guests.map((guest) => (
                        <li
                          key={guest.guestId}
                          className="flex items-center justify-between py-1.5 text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900">
                                {guest.guestId}
                              </span>
                              <span className="font-medium text-slate-800 truncate">
                                {guest.name}
                              </span>
                              {guest.isVIP && (
                                <Crown className="h-3 w-3 text-purple-600 shrink-0" />
                              )}
                            </div>
                            {guest.group && (
                              <span className="text-[10px] text-slate-500 truncate block">
                                {guest.group}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {guest.checkedIn && (
                              <span title="Arrived">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              </span>
                            )}
                            <button
                              onClick={() => handleUnassignGuest(guest.guestId)}
                              title="Remove seat allocation"
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              &times;
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Table Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 rounded-b-xl">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingTable(table)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-200/60"
                      title="Edit capacity/label"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingTable(table)}
                      disabled={occupied > 0}
                      className="rounded p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400"
                      title={occupied > 0 ? "Cannot delete table with guests assigned" : "Delete table"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedTableForAlloc(table)}
                    disabled={isFull}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Seat Guest</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Allocate Guest to Table Modal */}
      <Modal
        isOpen={Boolean(selectedTableForAlloc)}
        onClose={() => {
          setSelectedTableForAlloc(null);
          setSelectedGuestToAssign("");
        }}
        title={`Seat Guest at Table ${selectedTableForAlloc?.tableNumber}`}
        description={`Available seats: ${selectedTableForAlloc?.available ?? 0} / ${selectedTableForAlloc?.capacity ?? 0}`}
        maxWidth="sm"
      >
        <form onSubmit={handleAllocateGuest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Unseated Guest
            </label>
            {unassignedGuests.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                All registered guests already have a table assigned!
              </p>
            ) : (
              <select
                required
                value={selectedGuestToAssign}
                onChange={(e) => setSelectedGuestToAssign(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              >
                <option value="">-- Choose guest to allocate --</option>
                {unassignedGuests.map((g) => (
                  <option key={g.guestId} value={g.guestId}>
                    {g.guestId} - {g.name} {g.group ? `(${g.group})` : ""} {g.isVIP ? "★ VIP" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setSelectedTableForAlloc(null);
                setSelectedGuestToAssign("");
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || unassignedGuests.length === 0 || !selectedGuestToAssign}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {formLoading ? "Allocating..." : "Confirm Seating"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Table Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Event Table"
        description="Configure table number, maximum capacity, and section label."
      >
        <TableForm
          onSubmit={handleCreateTable}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* Edit Table Modal */}
      <Modal
        isOpen={Boolean(editingTable)}
        onClose={() => setEditingTable(null)}
        title={`Edit Table ${editingTable?.tableNumber}`}
      >
        {editingTable && (
          <TableForm
            initialData={editingTable}
            onSubmit={handleUpdateTable}
            onCancel={() => setEditingTable(null)}
            isLoading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Table Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deletingTable)}
        title={`Delete Table ${deletingTable?.tableNumber}?`}
        message="This action will remove the table from the venue floor plan. Tables with active guests cannot be removed."
        confirmLabel="Delete Table"
        isDestructive={true}
        isLoading={formLoading}
        onConfirm={handleDeleteTable}
        onCancel={() => setDeletingTable(null)}
      />
    </div>
  );
}
