// /api/nail-tech/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const nailTechs = await prisma.nailTech.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ nailTechs });
}
