"use client";

import { useState } from "react";
import { IGuest, ITable } from "@/lib/types";
import { Crown, AlertCircle } from "lucide-react";

interface GuestFormProps {
  initialData?: Partial<IGuest>;
  tables: Array<ITable & { occupied?: number; available?: number }>;
  onSubmit: (data: Partial<IGuest>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function GuestForm({
  initialData,
  tables,
  onSubmit,
  onCancel,
  isLoading = false,
}: GuestFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [group, setGroup] = useState(initialData?.group || "");
  const [tableNumber, setTableNumber] = useState<number>(
    initialData?.tableNumber ?? 0
  );
  const [isVIP, setIsVIP] = useState(initialData?.isVIP ?? false);
  const [specialRequirements, setSpecialRequirements] = useState(
    initialData?.specialRequirements || ""
  );
  const [status, setStatus] = useState<"active" | "cancelled" | "waitlist">(
    initialData?.status || "active"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the guest full name");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        group: group.trim(),
        tableNumber: Number(tableNumber),
        isVIP,
        specialRequirements: specialRequirements.trim(),
        status,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving the guest");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Guest Name & Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Group/Family & Table Allocation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Family / Group Name
          </label>
          <input
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="e.g. Sharma Family, Friends Group"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Helps group guests to the same table.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Table Assignment
          </label>
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value={0}>Unassigned (Assign later)</option>
            {tables.map((t) => {
              const isFull = (t.available ?? (t.capacity - (t.occupied || 0))) <= 0;
              return (
                <option
                  key={t.tableNumber}
                  value={t.tableNumber}
                  disabled={isFull && t.tableNumber !== initialData?.tableNumber}
                >
                  Table {t.tableNumber} {t.label ? `(${t.label})` : ""} —{" "}
                  {t.available !== undefined ? `${t.available} seats left` : `Cap: ${t.capacity}`}
                  {isFull ? " [FULL]" : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Status & VIP check */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Registration Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "active" | "cancelled" | "waitlist")
            }
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="active">Active (Confirmed)</option>
            <option value="waitlist">Waiting List</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="pt-5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isVIP}
              onChange={(e) => setIsVIP(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-900">
              <Crown className="h-4 w-4 text-purple-600" />
              Mark as VIP Guest
            </span>
          </label>
        </div>
      </div>

      {/* Special Requirements */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Dietary / Accessibility Requirements
        </label>
        <textarea
          rows={2}
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          placeholder="e.g. Vegetarian, Wheelchair access, High chair required..."
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : initialData?.guestId ? "Update Guest" : "Register Guest"}
        </button>
      </div>
    </form>
  );
}
