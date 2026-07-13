import type { ReactNode } from "react";
import "./dashboard.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-root min-h-dvh bg-[#07070c] text-[#f4f4f8] antialiased">
      {children}
    </div>
  );
}
