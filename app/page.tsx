// app/page.tsx (server component)
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main
      className="min-h-screen flex items-center justify-center font-sans bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1614208194190-5bf690ad8a98?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      <div
        className="relative max-w-md w-full rounded-2xl p-6 text-center 
                      backdrop-blur-sm bg-white/30 border border-white/20 
                      shadow-2xl"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/30 to-white/5 opacity-20 pointer-events-none"></div>

        {/* Optional top image */}
        <div className="h-64 relative mb-4 rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1610992015836-7c249d75782d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            fill
            alt="welcome image"
            className="object-cover object-bottom"
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 text-rose-400">Nail Tastic</h1>
        <p className="mb-6 text-gray-500">
          Sign in or create your account to continue
        </p>

        <div className="flex flex-col items-center gap-4 w-full">
          <Link
            href="/sign-in"
            className="w-3/4 bg-gradient-to-r from-pink-500 to-fuchsia-500 
                       hover:opacity-90 transition px-4 py-2 rounded-3xl 
                       text-white font-semibold shadow-lg"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="w-3/4 bg-white/30 hover:bg-white/50 transition 
                       px-4 py-2 rounded-3xl text-rose-500 font-semibold 
                       border border-white/40 shadow"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
