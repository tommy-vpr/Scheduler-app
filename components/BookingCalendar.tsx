"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaX } from "react-icons/fa6";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

// 👇 NEW: import your timezone utils
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
  id: number;
  date: string; // ISO from API
  status: string;
  nailTech?: {
    id: number;
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

    console.log(appointments);
  }, [selectedDate]);

  async function fetchAppointments() {
    const res = await fetch("/api/appointments");
    if (res.ok) {
      const data = await res.json();
      setAppointments(data.appointments);
    }
  }

  // function isSlotBooked(date: Date, time: string) {
  //   // ✅ Build the slot’s UTC instant from LA-local date+time
  //   const slotUtcISO = localSlotToUtcISO(date, time);
  //   // ✅ Compare at minute precision to ignore seconds/millis differences
  //   return appointments.some((appt) => isSameUtcMinute(appt.date, slotUtcISO));
  // }
  function getSlotAppointment(
    date: Date,
    time: string
  ): Appointment | undefined {
    const slotUtcISO = localSlotToUtcISO(date, time);
    return appointments.find((appt) => isSameUtcMinute(appt.date, slotUtcISO));
  }

  function getSlotAppointments(date: Date, time: string): Appointment[] {
    const slotUtcISO = localSlotToUtcISO(date, time);
    return appointments.filter((appt) =>
      isSameUtcMinute(appt.date, slotUtcISO)
    );
  }

  async function handleBooking() {
    if (!selectedDate || !selectedTime || !customerName || !phoneNumber) return;

    setIsBooking(true);

    const dateISO = localSlotToUtcISO(selectedDate, selectedTime);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateISO,
        customerName,
        phoneNumber,
        nailTechId:
          typeof selectedTechId === "number" ? selectedTechId : undefined,
        nailTechName: selectedTechId === "add-new" ? newTechName : undefined,
      }),
    });

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

      // ✅ Refresh the nail tech dropdown if a new one was created
      if (selectedTechId === "add-new") {
        const fresh = await fetch("/api/nail-tech");
        const data = await fresh.json();
        setNailTechs(data.nailTechs);
      }
    } else {
      toast.error("Failed to book appointment.");
    }

    setIsBooking(false);
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
            className="text-sm text-white flex items-center justify-center p-2 rounded-full bg-rose-400 
            cursor-pointer hover:bg-rose-300 transition duration-150 gap-2"
          >
            <FaX />
          </button>
        </div>
      )}

      {selectedDate && (
        <div className="mt-6">
          <h2 className="mb-2 p-2 text-center bg-blue-100 text-blue-500 rounded-sm">
            Available Time Slots for{" "}
            <strong>
              {/* Optional: show the day in LA explicitly */}
              {formatInTimeZone(selectedDate, APP_TZ, "PP")}
            </strong>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {generateTimeSlots().map((time) => {
              // const appointment = getSlotAppointment(selectedDate, time);
              // const booked = Boolean(appointment);
              const slotAppointments = getSlotAppointments(selectedDate, time);
              const booked = slotAppointments.length > 0;

              const isSelected = time === selectedTime;
              return (
                <button
                  key={time}
                  onClick={() => {
                    setSelectedTime(time);
                    setIsModalOpen(true);
                  }}
                  className={`px-2 py-1 rounded text-sm hover:text-white hover:bg-violet-600 transition duration-100 cursor-pointer`}
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
                          ); // fallback to appointment ID
                          return (
                            <span
                              key={appt.id}
                              className={`text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center ${bgColor}`}
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
              // ✅ Build the date route param in LA (yyyy-MM-dd)
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
              onClick={() => {
                if (selectedTime) {
                  setIsModalOpen(false);
                  setSelectedTime("");
                }
              }}
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
                setSelectedTechId(val === "add-new" ? "add-new" : Number(val));
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

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (selectedTime) {
                    setIsModalOpen(false);
                    setSelectedTime("");
                  }
                }}
                className="rounded px-4 py-2 text-sm bg-zinc-200 text-zinc-500 hover:bg-zinc-300 transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-400 transition cursor-pointer"
                disabled={isBooking}
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
