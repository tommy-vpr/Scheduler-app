// app/dashboard/appointments/date/[date]/page.tsx
import { format, parseISO } from "date-fns";
// import { PrismaClient } from "@/app/generated/prisma";
import AppointmentTable from "@/components/AppointmentTable"; // <-- direct import (client component)
import { prisma } from "@/lib/prisma";

type Params = { date: string };

export default async function AppointmentsByDatePage({
  params,
}: {
  params: Params;
}) {
  const { date } = params;

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="max-w-[900px] mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">
        {format(parseISO(date), "MMM d, yyyy")}
      </h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments booked for this day.</p>
      ) : (
        <AppointmentTable
          appointments={appointments.map((a) => ({
            ...a,
            date: a.date.toISOString(), // serialize for client component
          }))}
        />
      )}
    </div>
  );
}
