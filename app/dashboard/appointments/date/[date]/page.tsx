import { format, parseISO } from "date-fns";
import { AppointmentStatus, PrismaClient } from "@/app/generated/prisma"; // adjust path if needed
import StatusBadge from "@/components/StatusBadge";
import dynamic from "next/dynamic";

const prisma = new PrismaClient();

type Params = {
  date: string;
};

type Props = {
  params: Promise<Params>;
};

const AppointmentTable = dynamic(() => import("@/components/AppointmentTable"));

export default async function AppointmentsByDatePage({ params }: Props) {
  const { date } = await params;
  const dateStr = date;
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59`);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="max-w-[900px] mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">
        Appointments for {format(parseISO(dateStr), "MMMM d, yyyy")}
      </h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments booked for this day.</p>
      ) : (
        <AppointmentTable
          appointments={appointments.map((a) => ({
            ...a,
            date: a.date.toISOString(), // convert Date -> string
          }))}
        />
        // <div className="w-full overflow-x-auto">
        //   <table className="min-w-[600px] md:min-w-full text-sm text-left text-zinc-700 border-collapse">
        //     <thead className="bg-zinc-100 text-xs uppercase tracking-wider text-zinc-500">
        //       <tr>
        //         <th className="px-4 py-3 border-b">Customer</th>
        //         <th className="px-4 py-3 border-b">Time</th>
        //         <th className="px-4 py-3 border-b">Phone</th>
        //         <th className="px-4 py-3 border-b">Status</th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {appointments.map((appt) => (
        //         <tr key={appt.id} className="hover:bg-zinc-50 transition">
        //           <td className="px-4 py-3 border-b">{appt.customerName}</td>
        //           <td className="px-4 py-3 border-b">
        //             {new Date(appt.date).toLocaleTimeString([], {
        //               hour: "numeric",
        //               minute: "2-digit",
        //             })}
        //           </td>
        //           <td className="px-4 py-3 border-b">{appt.phoneNumber}</td>
        //           <td className="px-4 py-3 border-b">
        //             <StatusBadge status={appt.status as AppointmentStatus} />
        //           </td>
        //         </tr>
        //       ))}
        //     </tbody>
        //   </table>
        // </div>
      )}
    </div>
  );
}
