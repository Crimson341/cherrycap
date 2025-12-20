import { google, calendar_v3 } from "googleapis";

// Configuration
const ADMIN_EMAIL = "scottheney68@gmail.com";
const CALENDAR_ID = ADMIN_EMAIL; // Primary calendar

// Initialize Google Auth with service account
function getCalendarClient(): calendar_v3.Calendar {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set");
  }

  let parsedCredentials;
  try {
    parsedCredentials = JSON.parse(credentials);
  } catch {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: parsedCredentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

// Get busy times for a date
export async function getBusyTimes(date: string): Promise<{ start: string; end: string }[]> {
  try {
    const calendar = getCalendarClient();

    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(startOfDay).toISOString(),
        timeMax: new Date(endOfDay).toISOString(),
        timeZone: "America/Detroit",
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busy = response.data.calendars?.[CALENDAR_ID]?.busy || [];

    return busy.map((b) => ({
      start: b.start || "",
      end: b.end || "",
    }));
  } catch (error) {
    console.error("Error fetching busy times:", error);
    return [];
  }
}

// Get available slots for a date
export async function getAvailableSlots(
  date: string,
  config: {
    startHour?: number;
    endHour?: number;
    duration?: number;
  } = {}
): Promise<{ time: string; available: boolean }[]> {
  const { startHour = 9, endHour = 17, duration = 30 } = config;

  try {
    const busyTimes = await getBusyTimes(date);

    const slots: { time: string; available: boolean }[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const slotStart = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotEndMinutes = hour * 60 + minute + duration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;

        // Don't add slots past end hour
        if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMin > 0)) {
          continue;
        }

        const slotEnd = `${slotEndHour.toString().padStart(2, "0")}:${slotEndMin.toString().padStart(2, "0")}`;

        // Check if slot overlaps with any busy time
        const slotStartTime = new Date(`${date}T${slotStart}:00`).getTime();
        const slotEndTime = new Date(`${date}T${slotEnd}:00`).getTime();

        const isBusy = busyTimes.some((busy) => {
          const busyStart = new Date(busy.start).getTime();
          const busyEnd = new Date(busy.end).getTime();
          return slotStartTime < busyEnd && slotEndTime > busyStart;
        });

        slots.push({ time: slotStart, available: !isBusy });
      }
    }

    return slots;
  } catch (error) {
    console.error("Error getting available slots:", error);
    // Return all slots as available if there's an error
    const slots: { time: string; available: boolean }[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
          available: true,
        });
      }
    }
    return slots;
  }
}

// Create a calendar event
export async function createCalendarEvent(params: {
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service?: string;
  notes?: string;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const calendar = getCalendarClient();

    const startDateTime = `${params.date}T${params.startTime}:00`;
    const endDateTime = `${params.date}T${params.endTime}:00`;

    // Build description
    let description = `Booked via AI Assistant\n\n`;
    description += `Customer: ${params.customerName}\n`;
    description += `Email: ${params.customerEmail}\n`;
    if (params.customerPhone) {
      description += `Phone: ${params.customerPhone}\n`;
    }
    if (params.service) {
      description += `Service: ${params.service}\n`;
    }
    if (params.notes) {
      description += `\nNotes: ${params.notes}`;
    }

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `${params.service || "Appointment"} - ${params.customerName}`,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: "America/Detroit",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "America/Detroit",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 1 day before
            { method: "popup", minutes: 30 }, // 30 minutes before
          ],
        },
        colorId: "11", // Red/Rose color
      },
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
    };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

// Check if a specific slot is available
export async function isSlotAvailable(date: string, time: string, duration = 30): Promise<boolean> {
  try {
    const busyTimes = await getBusyTimes(date);

    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = new Date(`${date}T${time}:00`).getTime();
    const slotEnd = new Date(slotStart + duration * 60 * 1000).getTime();

    return !busyTimes.some((busy) => {
      const busyStart = new Date(busy.start).getTime();
      const busyEnd = new Date(busy.end).getTime();
      return slotStart < busyEnd && slotEnd > busyStart;
    });
  } catch {
    return true; // Assume available on error
  }
}

// Get upcoming events
export async function getUpcomingEvents(
  daysAhead = 7
): Promise<calendar_v3.Schema$Event[]> {
  try {
    const calendar = getCalendarClient();

    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }
}

// Delete/cancel an event
export async function cancelEvent(eventId: string): Promise<boolean> {
  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    });
    return true;
  } catch (error) {
    console.error("Error canceling event:", error);
    return false;
  }
}
