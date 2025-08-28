"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export function Header() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <header className="bg-violet-600 px-6 py-4 flex items-center justify-between text-gray-100">
      <div className="flex items-center space-x-6">
        <Link href="/dashboard">
          <span className="text-xl font-semibold hover:underline">
            Scheduler
          </span>
        </Link>
        <Link href="/dashboard/appointments">
          <span className="hover:underline">Appointments</span>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        {isLoaded && user && (
          <span className="text-sm">Hi, {user.firstName}</span>
        )}
        <UserButton />
      </div>
    </header>
  );
}
