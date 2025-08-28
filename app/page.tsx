"use client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-200 font-sans">
      <div className="bg-violet-600 shadow-md rounded-lg p-10 text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-4 text-gray-200">
          Welcome to Scheduler
        </h1>

        <div className="max-w-3xl flex items-center justify-center text-gray-200 gap-4">
          <Link
            href={"/sign-in"}
            className="bg-gray-200 px-4 py-2 text-zinc-700 rounded-4xl w-24"
          >
            Sign in
          </Link>
          <Link
            href={"/sign-up"}
            className="bg-gray-200 px-4 py-2 text-zinc-700 rounded-4xl w-24"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
