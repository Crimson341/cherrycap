"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Allowed admin email
const ADMIN_EMAIL = "scottheney68@gmail.com";

// Format time from 24h to 12h
function formatTime(time: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Get days in month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service?: string;
  notes?: string;
  status: string;
  summary?: string;
  htmlLink?: string;
}

export default function CalendarPage() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is the admin
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === ADMIN_EMAIL;

  // Fetch appointments from Google Calendar
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/calendar/events?days=60");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch events");
      }

      const data = await response.json();
      setAppointments(data.events || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err instanceof Error ? err.message : "Failed to load calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
    }
  }, [isAdmin]);

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = `${prevYear}-${(prevMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      days.push({ date, day, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      days.push({ date, day, isCurrentMonth: true });
    }

    // Next month days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - days.length; // 6 rows * 7 days

    for (let day = 1; day <= remainingDays; day++) {
      const date = `${nextYear}-${(nextMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      days.push({ date, day, isCurrentMonth: false });
    }

    return days;
  }, [viewMonth]);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: string): Appointment[] => {
    return appointments.filter((a) => a.date === date && a.status !== "cancelled");
  };

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  // Handle cancel appointment
  const handleCancelAppointment = async (eventId: string) => {
    try {
      const response = await fetch("/api/calendar/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      // Refresh appointments
      await fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  // Navigate months
  const prevMonthHandler = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
  };

  const nextMonthHandler = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));
  };

  // Access check
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Access Denied</h1>
          <p className="text-neutral-400">
            This calendar is only accessible to authorized administrators.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-neutral-400">Loading calendar from Google...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Unable to Load Calendar</h1>
          <p className="text-neutral-400 mb-4">{error}</p>
          <Button onClick={fetchAppointments} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="border-b border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Google Calendar</h1>
            <p className="text-sm text-neutral-400">
              Appointments booked through the AI assistant
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchAppointments}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={prevMonthHandler}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMonth(new Date())}
                >
                  Today
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonthHandler}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-neutral-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, day, isCurrentMonth }) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = date === today;
                const isSelected = date === selectedDate;

                return (
                  <motion.button
                    key={date}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "aspect-square p-1 rounded-lg text-sm relative transition-colors",
                      isCurrentMonth ? "text-white" : "text-neutral-600",
                      isToday && "ring-2 ring-rose-500",
                      isSelected && "bg-rose-500/20",
                      !isSelected && "hover:bg-neutral-800"
                    )}
                  >
                    <span className={cn(
                      "block text-center",
                      isToday && "font-bold text-rose-400"
                    )}>
                      {day}
                    </span>
                    {dayAppointments.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayAppointments.slice(0, 3).map((apt, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-rose-500"
                          />
                        ))}
                        {dayAppointments.length > 3 && (
                          <span className="text-[8px] text-rose-400 ml-0.5">
                            +{dayAppointments.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Appointments */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-rose-400" />
              {selectedDate ? formatDate(selectedDate) : "Select a date"}
            </h3>

            {selectedDate ? (
              selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments.map((apt) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700 cursor-pointer hover:border-rose-500/50 transition-colors"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{apt.customerName}</span>
                        <Badge
                          variant="outline"
                          className="border-emerald-500 text-emerald-400"
                        >
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                      </div>
                      {apt.service && (
                        <p className="text-xs text-neutral-500 mt-1">{apt.service}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-10 w-10 mx-auto text-neutral-600 mb-3" />
                  <p className="text-neutral-400">No appointments</p>
                  <p className="text-sm text-neutral-500">This day is wide open</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 mx-auto text-neutral-600 mb-3" />
                <p className="text-neutral-400">Click a date to see appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-6 bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h3 className="font-semibold mb-4">Upcoming Appointments</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments
              .filter((a) => a.date >= today && a.status !== "cancelled")
              .slice(0, 6)
              .map((apt) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700 cursor-pointer hover:border-rose-500/50 transition-colors"
                  onClick={() => setSelectedAppointment(apt)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{apt.customerName}</span>
                    <Badge variant="outline" className="border-rose-500 text-rose-400 text-xs">
                      {apt.date === today ? "Today" : apt.date}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(apt.startTime)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {apt.customerEmail}
                  </div>
                </motion.div>
              ))}
            {appointments.filter((a) => a.date >= today && a.status !== "cancelled").length === 0 && (
              <div className="col-span-full text-center py-8 text-neutral-400">
                No upcoming appointments
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Booked via AI Assistant
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <p className="font-medium">{selectedAppointment.customerName}</p>
                  <p className="text-sm text-neutral-400">{selectedAppointment.customerEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Date</p>
                  <p className="text-sm">{formatDate(selectedAppointment.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Time</p>
                  <p className="text-sm">
                    {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                  </p>
                </div>
              </div>

              {selectedAppointment.customerPhone && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Phone</p>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {selectedAppointment.customerPhone}
                  </p>
                </div>
              )}

              {selectedAppointment.service && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Service</p>
                  <p className="text-sm">{selectedAppointment.service}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Notes</p>
                  <p className="text-sm text-neutral-300">{selectedAppointment.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-neutral-500 mb-1">Status</p>
                <Badge
                  className={cn(
                    selectedAppointment.status === "confirmed" && "bg-emerald-500/20 text-emerald-400",
                    selectedAppointment.status === "cancelled" && "bg-red-500/20 text-red-400"
                  )}
                >
                  {selectedAppointment.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedAppointment?.htmlLink && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedAppointment.htmlLink, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Google Calendar
              </Button>
            )}
            {selectedAppointment?.status === "confirmed" && (
              <Button
                variant="outline"
                onClick={() => handleCancelAppointment(selectedAppointment.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Appointment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
