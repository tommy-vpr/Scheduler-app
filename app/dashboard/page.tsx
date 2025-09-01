// app/dashboard/page.tsx (server component)
import { auth, currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const images = [
  {
    src: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cols: 2,
    rows: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?q=80&w=664&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cols: 1,
    rows: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1587729927069-ef3b7a5ab9b4?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cols: 1,
    rows: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1612887390768-fb02affea7a6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cols: 2,
    rows: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1599948128020-9a44505b0d1b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cols: 2,
    rows: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1601244668565-afba8cbd2b51?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Ds",
    cols: 2,
    rows: 1,
  },
];

export default function NailGallery() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 auto-rows-[150px] sm:auto-rows-[200px]">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative col-span-${img.cols} row-span-${img.rows} overflow-hidden rounded-lg`}
            style={{
              gridColumn: `span ${img.cols} / span ${img.cols}`,
              gridRow: `span ${img.rows} / span ${img.rows}`,
            }}
          >
            <Image
              src={img.src}
              alt={`nail-${i}`}
              fill
              className="object-cover transition-transform duration-200 hover:scale-105"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <Link
          href="/dashboard/appointments"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 transition text-gray-100 rounded-3xl mt-8"
        >
          Book Appointments
        </Link>
      </div>
    </div>
  );
}
