"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  Crown,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Phone,
  Grid,
  Filter,
} from "lucide-react";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import GuestForm from "@/components/GuestForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "react-hot-toast";
import { IGuest, ITable } from "@/lib/types";

export default function GuestsPage() {
  const [guests, setGuests] = useState<IGuest[]>([]);
  const [tables, setTables] = useState<Array<ITable & { occupied?: number; available?: number }>>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<IGuest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<IGuest | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string;
    existingGuest: { guestId: string; name: string; phone: string };
  } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") {
        if (statusFilter === "vip") {
          // fetch all active and filter client-side or use isVIP
        } else {
          params.set("status", statusFilter);
        }
      }

      const [guestsRes, tablesRes] = await Promise.all([
        fetch(`/api/guests?${params.toString()}`),
        fetch("/api/tables"),
      ]);

      if (guestsRes.ok) {
        const data = await guestsRes.json();
        let list: IGuest[] = data.guests || [];
        if (statusFilter === "vip") {
          list = list.filter((g) => g.isVIP);
        }
        setGuests(list);
      }

      if (tablesRes.ok) {
        const tData = await tablesRes.json();
        setTables(tData.tables || []);
      }
    } catch {
      toast.error("Failed to load guests list");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuests();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchGuests]);

  const handleCreateGuest = async (formData: Partial<IGuest>) => {
    setFormLoading(true);
    setDuplicateWarning(null);

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 409) {
        setDuplicateWarning({
          message: data.warning || "Duplicate guest detected!",
          existingGuest: data.existingGuest || {
            guestId: "Unknown",
            name: "Existing Guest",
            phone: formData.phone || "",
          },
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to register guest");
      }

      toast.success(`Guest ${data.guest?.guestId} successfully registered!`);
      setIsAddModalOpen(false);
      fetchGuests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateGuest = async (formData: Partial<IGuest>) => {
    if (!editingGuest?._id) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/guests/${editingGuest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update guest");
      }

      toast.success(`Guest ${editingGuest.guestId} updated successfully`);
      setEditingGuest(null);
      fetchGuests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGuest = async () => {
    if (!deletingGuest?._id) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/guests/${deletingGuest._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete guest");
      }

      toast.success(`Guest ${deletingGuest.guestId} removed from registry`);
      setDeletingGuest(null);
      fetchGuests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuickCheckin = async (guestId: string) => {
    try {
      const res = await fetch("/api/guests/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });

      const data = await res.json();

      if (res.status === 409) {
        toast.error("Guest is already checked in");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Check-in failed");
      }

      toast.success(`${guestId} successfully checked in!`);
      fetchGuests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Guest Registry & Management
            </h1>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {guests.length} Records
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Centrally manage attendees, detect duplicates, assign seating, and log special requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchGuests()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Reload registry"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Reload</span>
          </button>

          <button
            onClick={() => {
              setDuplicateWarning(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Duplicate Detection Alert Banner if triggered */}
      {duplicateWarning && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                WARNING: Duplicate Guest Detected!
              </h4>
              <p className="mt-1 text-xs text-amber-800">
                The phone number you entered is already registered in the system:
              </p>
              <div className="mt-2.5 rounded-lg border border-amber-200 bg-white/80 p-3 text-xs text-slate-800 font-mono">
                <div>
                  <strong>Existing Guest ID:</strong> {duplicateWarning.existingGuest.guestId}
                </div>
                <div>
                  <strong>Guest Name:</strong> {duplicateWarning.existingGuest.name}
                </div>
                <div>
                  <strong>Registered Phone:</strong> {duplicateWarning.existingGuest.phone}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setDuplicateWarning(null)}
                  className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
                >
                  Dismiss Warning & Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Guest ID (e.g. G001), Name, or Phone..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "vip", label: "VIP Only" },
            { id: "waitlist", label: "Waitlist" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guests Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-3">Guest ID</th>
                <th className="py-3.5 px-3">Guest Name</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Group / Family</th>
                <th className="py-3.5 px-3">Seating</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Arrival</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading guest records...
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No guests found matching your query.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr
                    key={guest.guestId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3 pl-6 pr-3 font-mono font-bold text-slate-900">
                      {guest.guestId}
                    </td>

                    {/* Name + VIP badge */}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{guest.name}</span>
                        {guest.isVIP && (
                          <span
                            title="VIP Guest"
                            className="inline-flex items-center gap-0.5 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200"
                          >
                            <Crown className="h-3 w-3 text-purple-600" />
                            VIP
                          </span>
                        )}
                      </div>
                      {guest.specialRequirements && (
                        <p className="mt-0.5 text-[11px] text-amber-700 font-normal truncate max-w-xs">
                          Note: {guest.specialRequirements}
                        </p>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 text-slate-600">
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{guest.phone}</span>
                      </div>
                    </td>

                    {/* Group */}
                    <td className="py-3 px-3 text-slate-700">
                      {guest.group ? (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-medium">
                          {guest.group}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">None</span>
                      )}
                    </td>

                    {/* Table */}
                    <td className="py-3 px-3">
                      {guest.tableNumber > 0 ? (
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-xs">
                          <Grid className="h-3 w-3" />
                          Table {guest.tableNumber}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          guest.status === "active"
                            ? "success"
                            : guest.status === "waitlist"
                            ? "warning"
                            : "error"
                        }
                      >
                        {guest.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Arrival Check-in */}
                    <td className="py-3 px-3">
                      {guest.checkedIn ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Checked In
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickCheckin(guest.guestId)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingGuest(guest)}
                          title="Edit guest details"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingGuest(guest)}
                          title="Delete or cancel registration"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Guest"
        description="Duplicate detection validates phone numbers against existing guests."
        maxWidth="lg"
      >
        <GuestForm
          tables={tables}
          onSubmit={handleCreateGuest}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* Edit Guest Modal */}
      <Modal
        isOpen={Boolean(editingGuest)}
        onClose={() => setEditingGuest(null)}
        title={`Edit Guest: ${editingGuest?.guestId} (${editingGuest?.name})`}
        maxWidth="lg"
      >
        {editingGuest && (
          <GuestForm
            initialData={editingGuest}
            tables={tables}
            onSubmit={handleUpdateGuest}
            onCancel={() => setEditingGuest(null)}
            isLoading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingGuest)}
        title="Remove Guest Registration?"
        message={`Are you sure you want to remove ${deletingGuest?.name} (${deletingGuest?.guestId})? If the guest was seated, their seat will immediately become available.`}
        confirmLabel="Remove Guest"
        isDestructive={true}
        isLoading={formLoading}
        onConfirm={handleDeleteGuest}
        onCancel={() => setDeletingGuest(null)}
      />
    </div>
  );
}
