import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "vip"
  | "table";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  vip: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
  table: "bg-indigo-50 text-indigo-700 border-indigo-200 font-mono",
};

export default function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeStyle =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs sm:text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium transition-colors ${variantStyles[variant]} ${sizeStyle} ${className}`}
    >
      {children}
    </span>
  );
}
