// app/dashboard/page.tsx (server component)
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.firstName || "User"}
      </h1>
      <p className="text-lg">Here’s your appointment dashboard.</p>

      {/* <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <p>
          <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
        </p>
        <p>
          <strong>User ID:</strong> {user?.id}
        </p>
      </div> */}
    </div>
  );
}
