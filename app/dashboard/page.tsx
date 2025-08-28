// NO "use client" here!
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in"); // or Clerk's sign-in URL
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, User</h1>
      <p className="text-lg">Here’s your appointment dashboard.</p>
    </div>
  );
}
