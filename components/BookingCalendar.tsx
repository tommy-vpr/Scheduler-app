"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaX } from "react-icons/fa6";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

type Appointment = {
  id: number;
  date: string;
  status: string;
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

function formatTo24Hour(dateStr: string, timeStr: string): string {
  const [hourMin, ampm] = timeStr.split(" ");
  let [hour, minute] = hourMin.split(":").map(Number);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  const isoDate = new Date(
    `${dateStr}T${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00`
  );
  return isoDate.toISOString();
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

  function isSlotBooked(date: Date, time: string) {
    const iso = formatTo24Hour(date.toISOString().split("T")[0], time);
    return appointments.some(
      (appt) => new Date(appt.date).toISOString() === iso
    );
  }

  async function handleBooking() {
    if (!selectedDate || !selectedTime || !customerName || !phoneNumber) return;

    setIsBooking(true);

    const dateISO = formatTo24Hour(
      selectedDate.toISOString().split("T")[0],
      selectedTime
    );

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateISO, customerName, phoneNumber }),
    });

    if (res.ok) {
      toast.success("Appointment booked successfully!");
      setStatus("success");
      setSelectedTime("");
      setCustomerName("");
      setPhoneNumber("");
      setIsModalOpen(false);
      fetchAppointments();
    } else {
      toast.error("Failed to book appointment.");
    }

    setIsBooking(false);
  }

  return (
    <div className="max-w-xl mx-auto p-6 rounded-lg shadow bg-white">
      <h1 className="text-xl font-semibold mb-4">Book Appointment</h1>

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
          const isWednesday = date.getDay() === 3;
          return isPast || isWednesday;
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
          <h2 className=" mb-2 p-2 text-center bg-green-100 text-green-500 rounded-sm">
            Available Time Slots for{" "}
            <strong>{selectedDate.toLocaleDateString()}</strong>
          </h2>

          <div className="grid grid-cols-4 gap-2">
            {generateTimeSlots().map((time) => {
              const isBooked = isSlotBooked(selectedDate, time);
              const isSelected = time === selectedTime;
              return (
                <button
                  key={time}
                  onClick={() => {
                    if (!isBooked) {
                      setSelectedTime(time);
                      setIsModalOpen(true);
                    }
                  }}
                  disabled={isBooked}
                  className={`px-2 py-1 rounded text-sm ${
                    isBooked
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-violet-200 text-zinc-600"
                      : "hover:text-white hover:bg-violet-600 transition duration-100 cursor-pointer"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <a
              href={`/dashboard/appointments/date/${
                selectedDate.toISOString().split("T")[0]
              }`}
              className="text-sm text-violet-600 hover:underline"
            >
              View all appointments for {selectedDate.toLocaleDateString()}
            </a>
          </div>
        </div>
      )}

      {/* {selectedTime && (
        <div className="mt-4">
          <p>
            Selected:{" "}
            <strong>
              {selectedDate?.toLocaleDateString()} at {selectedTime}
            </strong>
          </p>
          <button
            onClick={handleBooking}
            className="mt-2 bg-violet-500 text-white px-4 py-2 cursor-pointer rounded hover:bg-violet-400 transition"
            disabled={isBooking}
          >
            {isBooking ? (
              <LoadingSpinner text="Submitting" />
            ) : (
              "Confirm Appointment"
            )}
          </button>
        </div>
      )} */}

      {/* {status === "success" && (
        <p className="text-green-500 mt-4">Appointment booked successfully!</p>
      )}
      {status === "error" && (
        <p className="text-red-400 mt-4">Failed to book appointment.</p>
      )} */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={() => {
                if (selectedTime) {
                  setIsModalOpen(false);
                  setSelectedTime("");
                }
              }}
              className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-400 cursor-pointer"
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
