import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ajAIChat } from "@/lib/arcjet";
import { buildPublicChatSystemPrompt } from "@/lib/chatbot-config";
import {
  getAvailableSlots as getGoogleAvailableSlots,
  createCalendarEvent,
  isSlotAvailable,
} from "@/lib/google-calendar";
import { AppointmentConfirmationEmail } from "@/components/emails/appointment-confirmation";

// Initialize Resend for confirmation emails
const resend = new Resend(process.env.RESEND_API_KEY);

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Use Claude 3.5 Haiku for tool calling (fast, cheap, reliable with tools)
const MODEL = "anthropic/claude-3.5-haiku";

// Appointment booking tools
const APPOINTMENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_available_days",
      description: "Get the next available business days for booking appointments. Use this FIRST when a customer wants to book an appointment. Shows up to 5 upcoming business days with availability as clickable buttons.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_available_slots",
      description: "Get available appointment time slots for a specific date. Use this AFTER the customer selects a day to show available time slots.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "The date to check availability for, in YYYY-MM-DD format (e.g., 2024-12-25)",
          },
        },
        required: ["date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Book an appointment for a customer. Only call this after confirming the date, time, and getting customer contact information.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "The appointment date in YYYY-MM-DD format",
          },
          startTime: {
            type: "string",
            description: "The appointment start time in HH:MM 24-hour format (e.g., 14:30 for 2:30 PM)",
          },
          customerName: {
            type: "string",
            description: "The customer's full name",
          },
          customerEmail: {
            type: "string",
            description: "The customer's email address",
          },
          customerPhone: {
            type: "string",
            description: "The customer's phone number (optional)",
          },
          service: {
            type: "string",
            description: "The type of appointment or service requested",
          },
          notes: {
            type: "string",
            description: "Any additional notes or requests from the customer",
          },
        },
        required: ["date", "startTime", "customerName", "customerEmail"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_slot_availability",
      description: "Check if a specific time slot is available. Use this to quickly verify a slot before booking.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "The date to check in YYYY-MM-DD format",
          },
          time: {
            type: "string",
            description: "The time to check in HH:MM 24-hour format",
          },
        },
        required: ["date", "time"],
      },
    },
  },
];

// Enhanced system prompt with booking capabilities
function buildSystemPromptWithBooking(): string {
  const basePrompt = buildPublicChatSystemPrompt();

  return `${basePrompt}

## APPOINTMENT BOOKING CAPABILITIES

You have access to a real calendar and can book appointments for customers. When helping with appointments:

1. **IMPORTANT - Booking Flow**:
   - When a customer wants to book, IMMEDIATELY call get_available_days - this shows clickable day buttons
   - Just say something brief like "Let me show you our available days!" then call get_available_days
   - After they select a day, THEN call get_available_slots for that specific date to show time buttons
   - After they select a time, a form pops up automatically to collect their info
   - DO NOT ask for their name, email, or phone - the form handles this
   - Use book_appointment to finalize when you receive the customer details

2. **Key Rules**:
   - ALWAYS use get_available_days FIRST when someone wants to book - don't ask them for a date
   - The UI displays clickable buttons automatically - don't list out dates or times in text
   - Keep responses SHORT - the buttons do the work

3. **Privacy Rules - CRITICAL**:
   - NEVER reveal who has booked other appointments
   - If a slot is taken, simply say "That time isn't available"
   - Never mention other customers' names or any identifying information

4. **Date/Time Info**:
   - Today's date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
   - Business hours are 12 PM - 6 PM (noon to 6), Monday through Friday
   - Each appointment is 30 minutes

5. **Confirmation**: After booking, briefly confirm the date and time.

Be friendly and conversational! Let the buttons guide the customer through booking.`;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

export interface PublicChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  stream?: boolean;
}

// Check if Google Calendar is configured
function isCalendarConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
}

// UI Component types for interactive chat elements
interface AvailableDaysComponent {
  type: "available_days";
  days: Array<{ date: string; display: string; dayName: string }>;
}

interface TimeSlotComponent {
  type: "time_slots";
  date: string;
  slots: Array<{ time: string; display: string }>;
}

interface BookingFormComponent {
  type: "booking_form";
  date: string;
  time: string;
  timeDisplay: string;
}

type UIComponent = AvailableDaysComponent | TimeSlotComponent | BookingFormComponent;

// Execute appointment tools using Google Calendar
async function executeAppointmentTool(
  functionName: string,
  args: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; message?: string; error?: string; uiComponent?: UIComponent }> {
  // Check if Google Calendar is configured
  if (!isCalendarConfigured()) {
    return {
      success: false,
      error: "Appointment booking is not available at the moment. Please contact us directly to schedule an appointment.",
    };
  }

  try {
    switch (functionName) {
      case "get_available_days": {
        // Get the next 5 business days (Monday-Friday)
        const days: Array<{ date: string; display: string; dayName: string }> = [];
        const today = new Date();
        let checkDate = new Date(today);

        while (days.length < 5) {
          checkDate.setDate(checkDate.getDate() + 1);
          const dayOfWeek = checkDate.getDay();

          // Skip weekends
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;

          const dateStr = checkDate.toISOString().split("T")[0];
          const dayName = checkDate.toLocaleDateString("en-US", { weekday: "short" });
          const display = checkDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
          });

          days.push({ date: dateStr, display, dayName });
        }

        return {
          success: true,
          data: { days, count: days.length },
          message: `Here are the next ${days.length} available business days. Click one to see available times.`,
          uiComponent: {
            type: "available_days",
            days,
          },
        };
      }

      case "get_available_slots": {
        const date = args.date as string;

        // Check if it's a weekend
        const dateObj = new Date(date + "T12:00:00");
        const dayOfWeek = dateObj.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return {
            success: true,
            data: { slots: [], available: false },
            message: "We're closed on weekends. Please choose a weekday (Monday-Friday).",
          };
        }

        const slots = await getGoogleAvailableSlots(date, {
          startHour: 12,
          endHour: 18,
          duration: 30,
        });

        const availableSlots = slots.filter((s) => s.available);

        if (availableSlots.length === 0) {
          return {
            success: true,
            data: { slots: [], duration: 30, date },
            message: "No available slots on that date. All appointments are booked.",
          };
        }

        // Format times for display (12-hour format)
        const formattedSlots = availableSlots.map((s) => {
          const [h, m] = s.time.split(":").map(Number);
          const period = h >= 12 ? "PM" : "AM";
          const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
          return {
            time: s.time,
            display: `${hour12}:${m.toString().padStart(2, "0")} ${period}`,
          };
        });

        return {
          success: true,
          data: {
            slots: formattedSlots,
            duration: 30,
            date,
          },
          uiComponent: {
            type: "time_slots",
            date,
            slots: formattedSlots,
          },
          message: `Found ${availableSlots.length} available time slots.`,
        };
      }

      case "check_slot_availability": {
        const date = args.date as string;
        const time = args.time as string;

        // Check if it's a weekend
        const dateObj = new Date(date + "T12:00:00");
        const dayOfWeek = dateObj.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return {
            success: true,
            data: { available: false },
            message: "We're closed on weekends.",
          };
        }

        // Check business hours
        const [hours] = time.split(":").map(Number);
        if (hours < 12 || hours >= 18) {
          return {
            success: true,
            data: { available: false },
            message: "That time is outside business hours (12 PM - 6 PM).",
          };
        }

        const available = await isSlotAvailable(date, time, 30);

        return {
          success: true,
          data: { available },
          message: available
            ? "That time slot is available!"
            : "That time slot is already booked. Please choose another time.",
        };
      }

      case "book_appointment": {
        const date = args.date as string;
        const startTime = args.startTime as string;

        // Calculate end time (30 min duration)
        const [hours, minutes] = startTime.split(":").map(Number);
        const endMinutes = hours * 60 + minutes + 30;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

        // Double-check availability before booking
        const stillAvailable = await isSlotAvailable(date, startTime, 30);
        if (!stillAvailable) {
          return {
            success: false,
            error: "This time slot was just booked. Please choose another time.",
          };
        }

        const result = await createCalendarEvent({
          date,
          startTime,
          endTime,
          customerName: args.customerName as string,
          customerEmail: args.customerEmail as string,
          customerPhone: args.customerPhone as string | undefined,
          service: args.service as string | undefined,
          notes: args.notes as string | undefined,
        });

        if (!result.success) {
          return {
            success: false,
            error: result.error || "Failed to book appointment",
          };
        }

        // Send confirmation email
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "CherryCap <onboarding@resend.dev>",
            to: args.customerEmail as string,
            subject: "Your Appointment is Confirmed",
            react: AppointmentConfirmationEmail({
              customerName: args.customerName as string,
              date,
              time: startTime,
              service: args.service as string | undefined,
            }),
          });
          console.log("[Public Chat] Confirmation email sent to:", args.customerEmail);
        } catch (emailError) {
          // Log but don't fail the booking if email fails
          console.error("[Public Chat] Failed to send confirmation email:", emailError);
        }

        return {
          success: true,
          data: result,
          message: `Appointment confirmed! ${args.customerName} is booked for ${date} at ${startTime}. A confirmation email has been sent to ${args.customerEmail}.`,
        };
      }

      default:
        return { success: false, error: `Unknown function: ${functionName}` };
    }
  } catch (error) {
    console.error("Tool execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Tool execution failed"
    };
  }
}

export async function POST(req: NextRequest) {
  // Arcjet rate limiting + bot protection
  const decision = await ajAIChat.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    let errorMessage = "Request blocked";
    let statusCode = 403;

    if (decision.reason.isRateLimit?.()) {
      errorMessage = "Too many requests. Please wait a moment before trying again.";
      statusCode = 429;
    } else if (decision.reason.isBot?.()) {
      errorMessage = "Automated requests are not allowed";
    }

    console.log("[Public Chat] Arcjet denied:", decision.reason);

    return NextResponse.json(
      { error: errorMessage, reason: decision.reason },
      { status: statusCode }
    );
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const body: PublicChatRequest = await req.json();
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Build system prompt with booking capabilities
    const systemPrompt = buildSystemPromptWithBooking();

    // Build messages array
    let currentMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    // Tool execution loop
    let maxIterations = 5;
    let iteration = 0;
    let pendingUiComponent: UIComponent | null = null;

    while (iteration < maxIterations) {
      iteration++;

      const requestBody: Record<string, unknown> = {
        model: MODEL,
        messages: currentMessages,
        stream: false, // Use non-streaming for tool handling
        tools: APPOINTMENT_TOOLS,
        tool_choice: "auto",
      };

      console.log("[Public Chat] Making request to OpenRouter:", {
        model: MODEL,
        messageCount: currentMessages.length,
        toolCount: APPOINTMENT_TOOLS.length,
      });

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "CherryCap AI Assistant",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("[Public Chat] OpenRouter response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Public Chat] OpenRouter API error:", response.status, errorText);
        return NextResponse.json(
          { error: `AI service error: ${response.status}`, details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const message = choice?.message;

      // Check if AI wants to call tools
      if (message?.tool_calls && message.tool_calls.length > 0) {
        console.log("[Public Chat] Tool calls requested:", message.tool_calls.map((t: { function: { name: string } }) => t.function.name));

        // Add assistant message with tool calls
        currentMessages.push({
          role: "assistant",
          content: message.content || "",
          tool_calls: message.tool_calls,
        });

        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          let args: Record<string, unknown> = {};

          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch {
            args = {};
          }

          console.log("[Public Chat] Executing tool:", functionName, args);

          const result = await executeAppointmentTool(functionName, args);
          console.log("[Public Chat] Tool result:", result);

          // Capture UI component if present
          if (result.uiComponent) {
            pendingUiComponent = result.uiComponent;
          }

          // Add tool result to messages
          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          } as ChatMessage);
        }

        // Continue loop to get AI's response after tool execution
        continue;
      }

      // No tool calls - we have the final response
      const assistantMessage = message?.content || "Sorry, I couldn't generate a response.";

      // Stream the response word by word for typing effect
      if (stream) {
        const encoder = new TextEncoder();

        const responseStream = new ReadableStream({
          start(controller) {
            // First, send UI component if present
            if (pendingUiComponent) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ uiComponent: pendingUiComponent })}\n\n`));
            }

            const words = assistantMessage.split(" ");
            let wordIndex = 0;

            const streamWords = () => {
              if (wordIndex < words.length) {
                const word = words[wordIndex] + (wordIndex < words.length - 1 ? " " : "");
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`));
                wordIndex++;
                setTimeout(streamWords, 20);
              } else {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              }
            };

            streamWords();
          },
        });

        return new Response(responseStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      // Non-streaming response
      return NextResponse.json({
        message: assistantMessage,
        model: data.model,
        uiComponent: pendingUiComponent,
      });
    }

    // Max iterations reached
    return NextResponse.json({
      message: "I'm having trouble processing your request. Please try again.",
      model: MODEL,
    });
  } catch (error) {
    console.error("Public Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
