import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { date, customerName, phoneNumber, nailTechId, nailTechName } = body;

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let finalNailTechId = nailTechId;

    if (!nailTechId && nailTechName) {
      const newTech = await prisma.nailTech.create({
        data: { name: nailTechName },
      });
      finalNailTechId = newTech.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        userId: user.id,
        status: "confirmed",
        customerName,
        phoneNumber,
        nailTechId: finalNailTechId,
      },
      include: {
        nailTech: true, // ✅ include this
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (err) {
    console.error("Create appointment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    include: { nailTech: true }, // ✅ Include nail tech relation
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ appointments });
}
