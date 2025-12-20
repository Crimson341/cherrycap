import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-950">
      <DashboardSidebar />
      <main className="flex-1 md:ml-14 min-h-screen">
        {children}
      </main>
    </div>
  );
}
