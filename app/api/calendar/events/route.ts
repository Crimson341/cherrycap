import { NextRequest, NextResponse } from "next/server";
import { getUpcomingEvents, cancelEvent } from "@/lib/google-calendar";
import { auth } from "@clerk/nextjs/server";

const ADMIN_EMAIL = "scottheney68@gmail.com";

// Get events from Google Calendar
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const events = await getUpcomingEvents(days);

    // Parse events into a simpler format
    const appointments = events.map((event) => {
      // Parse description for customer info
      const description = event.description || "";
      const customerNameMatch = description.match(/Customer: (.+)/);
      const customerEmailMatch = description.match(/Email: (.+)/);
      const customerPhoneMatch = description.match(/Phone: (.+)/);
      const serviceMatch = description.match(/Service: (.+)/);
      const notesMatch = description.match(/Notes: ([\s\S]+)/);

      // Get date and times
      const startDateTime = event.start?.dateTime || event.start?.date;
      const endDateTime = event.end?.dateTime || event.end?.date;

      let date = "";
      let startTime = "";
      let endTime = "";

      if (startDateTime) {
        const startDate = new Date(startDateTime);
        date = startDate.toISOString().split("T")[0];
        startTime = `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;
      }

      if (endDateTime) {
        const endDate = new Date(endDateTime);
        endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
      }

      // Calculate duration in minutes
      let duration = 30;
      if (startDateTime && endDateTime) {
        const diffMs = new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
        duration = Math.round(diffMs / 60000);
      }

      return {
        id: event.id,
        date,
        startTime,
        endTime,
        duration,
        customerName: customerNameMatch?.[1]?.trim() || event.summary?.replace(/^.+ - /, "") || "Unknown",
        customerEmail: customerEmailMatch?.[1]?.trim() || event.attendees?.[0]?.email || "",
        customerPhone: customerPhoneMatch?.[1]?.trim(),
        service: serviceMatch?.[1]?.trim() || event.summary?.split(" - ")[0] || "Appointment",
        notes: notesMatch?.[1]?.trim(),
        status: event.status === "cancelled" ? "cancelled" : "confirmed",
        summary: event.summary,
        htmlLink: event.htmlLink,
      };
    });

    // Sort by date and time
    appointments.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    return NextResponse.json({ events: appointments });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Delete/cancel an event
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const success = await cancelEvent(eventId);

    if (!success) {
      return NextResponse.json({ error: "Failed to cancel event" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling event:", error);
    return NextResponse.json(
      { error: "Failed to cancel event" },
      { status: 500 }
    );
  }
}
