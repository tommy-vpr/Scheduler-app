// app/page.tsx (server component)
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-200 font-sans">
      <div className="bg-white shadow-md rounded-xl overflow-hidden text-center max-w-md w-full">
        <div className="h-86 relative">
          <Image
            src="https://images.unsplash.com/photo-1599948128020-9a44505b0d1b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            fill
            alt="welcome image"
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h1 className="text-xl font-semibold mb-4 text-gray-700">
            Welcome to Scheduler
          </h1>
          <div className="max-w-3xl flex flex-col items-center justify-center text-gray-200 gap-4">
            <Link
              href="/sign-in"
              className="bg-violet-600 hover:bg-violet-500 transition px-4 py-2 text-gray-100 rounded-3xl text-center w-1/2"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-gray-200 hover:bg-gray-300 transition px-4 py-2 text-zinc-700 rounded-3xl text-center w-1/2"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
