"use client";

import { useState } from "react";
import { ITable } from "@/lib/types";
import { AlertCircle } from "lucide-react";

interface TableFormProps {
  initialData?: Partial<ITable>;
  onSubmit: (data: {
    tableNumber: number;
    capacity: number;
    label: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TableForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TableFormProps) {
  const [tableNumber, setTableNumber] = useState<number | string>(
    initialData?.tableNumber ?? ""
  );
  const [capacity, setCapacity] = useState<number>(initialData?.capacity ?? 8);
  const [label, setLabel] = useState(initialData?.label || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const num = Number(tableNumber);
    if (!tableNumber || isNaN(num) || num <= 0) {
      setError("Please enter a valid positive table number");
      return;
    }

    if (capacity <= 0) {
      setError("Table capacity must be at least 1 seat");
      return;
    }

    try {
      await onSubmit({
        tableNumber: num,
        capacity: Number(capacity),
        label: label.trim(),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save table");
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

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Table Number *
        </label>
        <input
          type="number"
          min="1"
          required
          disabled={Boolean(initialData?.tableNumber)}
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="e.g. 1"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
        />
        {initialData?.tableNumber && (
          <p className="mt-1 text-[11px] text-slate-500">
            Table number cannot be changed once created.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Seating Capacity (Seats) *
        </label>
        <input
          type="number"
          min="1"
          max="50"
          required
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          placeholder="e.g. 8"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Standard banquet table usually seats 8–10 guests.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Table Label / Zone (Optional)
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. VIP Stage Front, Groom Family, Main Hall"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
        />
      </div>

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
          {isLoading ? "Saving..." : initialData?.tableNumber ? "Update Table" : "Create Table"}
        </button>
      </div>
    </form>
  );
}
