import { Header } from "@/components/Header";
import "../globals.css"; // adjust path if needed

export const metadata = {
  title: "Dashboard",
  description: "Appointment Scheduler Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans bg-gray-100">
      <Header />
      <div className="max-w-5xl mx-auto p-6">{children}</div>
    </div>
  );
}
