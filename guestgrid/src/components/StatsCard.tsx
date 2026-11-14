import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  highlight?: "default" | "success" | "warning" | "info" | "purple";
}

const highlightStyles = {
  default: "border-slate-200 hover:border-slate-300",
  success: "border-emerald-200/80 bg-gradient-to-b from-emerald-50/30 to-white",
  warning: "border-amber-200/80 bg-gradient-to-b from-amber-50/30 to-white",
  info: "border-blue-200/80 bg-gradient-to-b from-blue-50/30 to-white",
  purple: "border-purple-200/80 bg-gradient-to-b from-purple-50/30 to-white",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = "default",
}: StatsCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-xs transition-all duration-200 ${highlightStyles[highlight]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.positive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
