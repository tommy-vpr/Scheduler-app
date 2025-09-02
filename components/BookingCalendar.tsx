"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaX } from "react-icons/fa6";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";
import {
  APP_TZ,
  localSlotToUtcISO,
  laDateParam,
  isSameUtcMinute,
} from "@/utils/datetime";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import getColorForId from "@/utils/getColorForId";

type Appointment = {
  id: number | string;
  date: string;
  status: string;
  nailTech?: {
    id: number | string;
    name: string;
  };
};

function generateTimeSlots(start = 11, end = 20) {
  const slots: string[] = [];
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      slots.push(`${hour12}:${m.toString().padStart(2, "0")} ${ampm}`);
    }
  }
  return slots;
}

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isBooking, setIsBooking] = useState(false);

  const [nailTechs, setNailTechs] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedTechId, setSelectedTechId] = useState<
    number | "add-new" | null
  >(null);
  const [newTechName, setNewTechName] = useState("");

  useEffect(() => {
    fetch("/api/nail-tech")
      .then((res) => res.json())
      .then((data) => setNailTechs(data.nailTechs));
  }, []);

  useEffect(() => {
    if (selectedDate) fetchAppointments();
  }, [selectedDate]);

  async function fetchAppointments() {
    const res = await fetch("/api/appointments");
    if (res.ok) {
      const data = await res.json();
      setAppointments(data.appointments);
    }
  }

  function getSlotAppointments(date: Date, time: string): Appointment[] {
    const slotUtcISO = localSlotToUtcISO(date, time);
    return appointments.filter((appt) =>
      isSameUtcMinute(appt.date, slotUtcISO)
    );
  }

  // ---- Derived values (booleans only; avoid rendering numbers like 0) ----
  const techIdNum =
    typeof selectedTechId === "number" ? selectedTechId : undefined;

  function hasConflictForSelectedTech(
    date: Date | null,
    time: string,
    techId?: number
  ) {
    if (!date || !time || !techId) return false;
    const slotUtcISO = localSlotToUtcISO(date, time);
    return appointments.some(
      (a) =>
        isSameUtcMinute(a.date, slotUtcISO) && Number(a.nailTech?.id) === techId
    );
  }

  const hasConflict =
    techIdNum !== undefined &&
    hasConflictForSelectedTech(selectedDate, selectedTime, techIdNum);

  const noTechSelected = selectedTechId === null;
  const requiresNewTechName =
    selectedTechId === "add-new" && !newTechName.trim();

  function resetForm() {
    setCustomerName("");
    setPhoneNumber("");
    setSelectedTechId(null);
    setNewTechName("");
    setSelectedTime("");
    setStatus("idle");
    setIsModalOpen(false);
  }

  async function handleBooking() {
    if (!selectedDate || !selectedTime || !customerName || !phoneNumber) return;

    if (hasConflict) {
      toast.error("This nail tech already has an appointment at that time.");
      return;
    }

    setIsBooking(true);
    const dateISO = localSlotToUtcISO(selectedDate, selectedTime);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateISO,
          customerName,
          phoneNumber,
          nailTechId: techIdNum,
          nailTechName: selectedTechId === "add-new" ? newTechName : undefined,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        toast.success("Appointment booked successfully!");
        setStatus("success");
        setSelectedTime("");
        setCustomerName("");
        setPhoneNumber("");
        setSelectedTechId(null);
        setNewTechName("");
        setIsModalOpen(false);
        fetchAppointments();

        if (selectedTechId === "add-new") {
          const fresh = await fetch("/api/nail-tech");
          const nd = await fresh.json();
          setNailTechs(nd.nailTechs);
        }
      } else {
        const msg =
          data?.error ||
          (res.status === 409
            ? "This nail tech already has an appointment at that time."
            : "Failed to book appointment.");
        toast.error(msg);
        setStatus("error");
      }
    } catch {
      toast.error("Network error. Please try again.");
      setStatus("error");
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 rounded-lg shadow bg-white">
      <h1 className="text-xl text-gray-700 font-semibold mb-4">
        Book Appointment
      </h1>

      <Calendar
        onChange={(date) => {
          setSelectedDate(date as Date);
          setSelectedTime("");
          setStatus("idle");
        }}
        value={selectedDate}
        tileDisabled={({ date }) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isTuesday = date.getDay() === 2;
          return isPast || isTuesday;
        }}
      />

      {selectedDate && (
        <div className="w-full flex justify-end py-2">
          <button
            onClick={() => {
              setSelectedDate(null);
              setSelectedTime("");
              setStatus("idle");
            }}
            className="text-sm text-white flex items-center justify-center p-2 rounded-full bg-rose-400 hover:bg-rose-300 transition duration-150 gap-2"
          >
            <FaX />
          </button>
        </div>
      )}

      {selectedDate && (
        <div className="mt-6">
          <h2 className="mb-2 p-2 text-center bg-blue-100 text-blue-500 rounded-sm">
            Available Time Slots for{" "}
            <strong>{formatInTimeZone(selectedDate, APP_TZ, "PP")}</strong>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {generateTimeSlots().map((time) => {
              const slotAppointments = getSlotAppointments(selectedDate, time);
              const booked = slotAppointments.length > 0;
              return (
                <button
                  key={time}
                  onClick={() => {
                    setSelectedTime(time);
                    setIsModalOpen(true);
                  }}
                  className="px-2 py-1 rounded text-sm hover:text-white hover:bg-violet-600 transition duration-100 cursor-pointer"
                >
                  {booked ? (
                    <div className="flex flex-col items-center">
                      <span>{time}</span>
                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {slotAppointments.map((appt) => {
                          const initial =
                            appt.nailTech?.name?.charAt(0).toUpperCase() || "?";
                          const bgColor = getColorForId(
                            appt.nailTech?.id || appt.id
                          );
                          return (
                            <span
                              key={appt.id}
                              className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${bgColor}`}
                            >
                              {initial}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    time
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <Link
              href={`/dashboard/appointments/date/${laDateParam(selectedDate)}`}
              className="text-sm text-violet-600 hover:underline"
            >
              View all appointments for{" "}
              {formatInTimeZone(selectedDate, APP_TZ, "PP")}
            </Link>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90vw] text-gray-700 max-w-md shadow-lg relative">
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 text-zinc-700 hover:text-zinc-400 cursor-pointer"
            >
              <FaX />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Confirm Appointment: {selectedTime}
            </h3>

            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
            />

            <select
              value={selectedTechId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setSelectedTechId(null); // ✅ don’t coerce "" to 0
                } else if (val === "add-new") {
                  setSelectedTechId("add-new");
                } else {
                  setSelectedTechId(Number(val)); // ✅ real numeric id
                }
              }}
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select Nail Tech</option>
              {nailTechs.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
              <option value="add-new">+ Add New</option>
            </select>

            {selectedTechId === "add-new" && (
              <input
                type="text"
                placeholder="New Nail Tech Name"
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
              />
            )}

            {/* inline conflict message */}
            {hasConflict && (
              <p className="text-sm text-red-500 mb-3">
                {nailTechs.find((t) => t.id === techIdNum)?.name} is already
                booked for {selectedTime}.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="rounded px-4 py-2 text-sm bg-zinc-200 text-zinc-500 hover:bg-zinc-300 transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-400 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={
                  isBooking ||
                  !selectedDate ||
                  !selectedTime ||
                  !customerName ||
                  !phoneNumber ||
                  noTechSelected ||
                  requiresNewTechName ||
                  hasConflict
                }
              >
                {isBooking ? <LoadingSpinner text="Booking" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
