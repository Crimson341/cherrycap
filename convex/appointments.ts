import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Default admin email for bookings
const DEFAULT_ADMIN_EMAIL = "scottheney68@gmail.com";

// ============ SETTINGS ============

// Get appointment settings for an admin
export const getSettings = query({
  args: { adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;
    const settings = await ctx.db
      .query("appointmentSettings")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    // Return defaults if no settings exist
    if (!settings) {
      return {
        adminEmail: email,
        businessName: "CherryCap",
        timezone: "America/Detroit",
        availableDays: [1, 2, 3, 4, 5], // Mon-Fri
        startHour: 9,
        endHour: 17,
        defaultDuration: 30,
        bufferTime: 15,
        minAdvanceHours: 24,
        maxAdvanceDays: 30,
        notifyEmail: true,
      };
    }

    return settings;
  },
});

// Create or update appointment settings
export const upsertSettings = mutation({
  args: {
    adminEmail: v.string(),
    businessName: v.string(),
    timezone: v.string(),
    availableDays: v.array(v.number()),
    startHour: v.number(),
    endHour: v.number(),
    defaultDuration: v.number(),
    bufferTime: v.number(),
    minAdvanceHours: v.number(),
    maxAdvanceDays: v.number(),
    notifyEmail: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    // Verify caller is admin
    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const existing = await ctx.db
      .query("appointmentSettings")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", args.adminEmail))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("appointmentSettings", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// ============ AVAILABILITY ============

// Get available time slots for a specific date
export const getAvailableSlots = query({
  args: {
    date: v.string(), // YYYY-MM-DD
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;

    // Get settings
    const settings = await ctx.db
      .query("appointmentSettings")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    // Default settings if none exist
    const config = settings || {
      availableDays: [1, 2, 3, 4, 5],
      startHour: 9,
      endHour: 17,
      defaultDuration: 30,
      bufferTime: 15,
    };

    // Check if the day of week is available
    const dateObj = new Date(args.date + "T12:00:00"); // Noon to avoid timezone issues
    const dayOfWeek = dateObj.getDay();

    if (!config.availableDays.includes(dayOfWeek)) {
      return { available: false, reason: "closed", slots: [] };
    }

    // Get existing appointments for this date
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_adminEmail_date", (q) =>
        q.eq("adminEmail", email).eq("date", args.date)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    // Get blocked slots for this date
    const blockedSlots = await ctx.db
      .query("blockedSlots")
      .withIndex("by_adminEmail_date", (q) =>
        q.eq("adminEmail", email).eq("date", args.date)
      )
      .collect();

    // Check if entire day is blocked
    const fullDayBlock = blockedSlots.find((b) => !b.startTime);
    if (fullDayBlock) {
      return { available: false, reason: fullDayBlock.reason || "blocked", slots: [] };
    }

    // Generate all possible slots
    const slots: { time: string; available: boolean }[] = [];
    const duration = config.defaultDuration;
    const buffer = config.bufferTime;

    for (let hour = config.startHour; hour < config.endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const slotStart = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotEndMinutes = hour * 60 + minute + duration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;

        // Don't add slots that go past end hour
        if (slotEndHour > config.endHour || (slotEndHour === config.endHour && slotEndMin > 0)) {
          continue;
        }

        const slotEnd = `${slotEndHour.toString().padStart(2, "0")}:${slotEndMin.toString().padStart(2, "0")}`;

        // Check if slot is taken by an appointment
        const isTaken = appointments.some((apt) => {
          // Check for overlap
          return apt.startTime < slotEnd && apt.endTime > slotStart;
        });

        // Check if slot is blocked
        const isBlocked = blockedSlots.some((block) => {
          if (!block.startTime || !block.endTime) return false;
          return block.startTime < slotEnd && block.endTime > slotStart;
        });

        slots.push({
          time: slotStart,
          available: !isTaken && !isBlocked,
        });
      }
    }

    return {
      available: true,
      slots,
      duration: config.defaultDuration,
    };
  },
});

// Check if a specific slot is available
export const checkSlotAvailability = query({
  args: {
    date: v.string(),
    time: v.string(),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;

    // Get settings
    const settings = await ctx.db
      .query("appointmentSettings")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    const duration = settings?.defaultDuration || 30;

    // Calculate end time
    const [hours, minutes] = args.time.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

    // Check for existing appointments
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_adminEmail_date", (q) =>
        q.eq("adminEmail", email).eq("date", args.date)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const isTaken = appointments.some((apt) => {
      return apt.startTime < endTime && apt.endTime > args.time;
    });

    if (isTaken) {
      // Find the next available slot
      const allSlots = await ctx.runQuery(
        // @ts-expect-error - internal query reference
        ctx.db.query("appointments").withIndex("by_adminEmail_date"),
        { date: args.date, adminEmail: email }
      );

      return {
        available: false,
        reason: "That time slot is already booked.",
      };
    }

    return { available: true };
  },
});

// ============ BOOKING ============

// Book an appointment
export const bookAppointment = mutation({
  args: {
    date: v.string(),
    startTime: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    service: v.optional(v.string()),
    notes: v.optional(v.string()),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;

    // Get settings for duration
    const settings = await ctx.db
      .query("appointmentSettings")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    const duration = settings?.defaultDuration || 30;

    // Calculate end time
    const [hours, minutes] = args.startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

    // Double-check availability
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_adminEmail_date", (q) =>
        q.eq("adminEmail", email).eq("date", args.date)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const conflict = existing.some((apt) => {
      return apt.startTime < endTime && apt.endTime > args.startTime;
    });

    if (conflict) {
      throw new Error("This time slot is no longer available. Please choose another time.");
    }

    const now = Date.now();

    // Create the appointment
    const appointmentId = await ctx.db.insert("appointments", {
      adminEmail: email,
      date: args.date,
      startTime: args.startTime,
      endTime,
      duration,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      service: args.service,
      notes: args.notes,
      status: "confirmed",
      bookedVia: "ai_chatbot",
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      appointmentId,
      date: args.date,
      startTime: args.startTime,
      endTime,
      duration,
    };
  },
});

// Cancel an appointment
export const cancelAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
      cancelledAt: Date.now(),
      cancelReason: args.reason,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============ DASHBOARD QUERIES ============

// Get all appointments for a date range
export const getAppointments = query({
  args: {
    adminEmail: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return [];

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return [];
    }

    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;

    let query = ctx.db
      .query("appointments")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email));

    const appointments = await query.collect();

    let filtered = appointments;
    if (args.startDate) {
      filtered = filtered.filter((a) => a.date >= args.startDate!);
    }
    if (args.endDate) {
      filtered = filtered.filter((a) => a.date <= args.endDate!);
    }
    if (args.status) {
      filtered = filtered.filter((a) => a.status === args.status);
    }

    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    return filtered;
  },
});

// Get today's appointments
export const getTodaysAppointments = query({
  args: { adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return [];

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return [];
    }

    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;
    const today = new Date().toISOString().split("T")[0];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_adminEmail_date", (q) =>
        q.eq("adminEmail", email).eq("date", today)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    appointments.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return appointments;
  },
});

// Get upcoming appointments (next 7 days)
export const getUpcomingAppointments = query({
  args: { adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return [];

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return [];
    }

    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const todayStr = today.toISOString().split("T")[0];
    const weekStr = weekFromNow.toISOString().split("T")[0];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), todayStr),
          q.lte(q.field("date"), weekStr),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();

    appointments.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    return appointments;
  },
});

// ============ BLOCKED SLOTS ============

// Add a blocked time slot
export const addBlockedSlot = mutation({
  args: {
    adminEmail: v.optional(v.string()),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    reason: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    recurringDays: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;

    return await ctx.db.insert("blockedSlots", {
      adminEmail: email,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      reason: args.reason,
      isRecurring: args.isRecurring || false,
      recurringDays: args.recurringDays,
      createdAt: Date.now(),
    });
  },
});

// Remove a blocked slot
export const removeBlockedSlot = mutation({
  args: { slotId: v.id("blockedSlots") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.slotId);
    return { success: true };
  },
});

// Get blocked slots
export const getBlockedSlots = query({
  args: { adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return [];

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return [];
    }

    const email = args.adminEmail || DEFAULT_ADMIN_EMAIL;

    return await ctx.db
      .query("blockedSlots")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .collect();
  },
});
