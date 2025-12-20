import * as React from "react";

interface AppointmentConfirmationEmailProps {
  customerName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  service?: string;
}

export function AppointmentConfirmationEmail({
  customerName,
  date,
  time,
  service,
}: AppointmentConfirmationEmailProps) {
  // Format date nicely
  const dateObj = new Date(date + "T12:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format time to 12-hour
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const formattedTime = `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          textAlign: "center" as const,
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            color: "#111827",
            fontSize: "24px",
            fontWeight: "bold",
            margin: "0 0 10px 0",
          }}
        >
          Appointment Confirmed
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: "16px",
            margin: "0",
          }}
        >
          Your appointment has been booked successfully
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            color: "#111827",
            fontSize: "16px",
            margin: "0 0 16px 0",
          }}
        >
          Hi {customerName},
        </p>
        <p
          style={{
            color: "#4b5563",
            fontSize: "14px",
            margin: "0 0 20px 0",
            lineHeight: "1.5",
          }}
        >
          Your appointment has been confirmed. Here are the details:
        </p>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <span
              style={{
                color: "#6b7280",
                fontSize: "12px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
              }}
            >
              Date
            </span>
            <p
              style={{
                color: "#111827",
                fontSize: "16px",
                fontWeight: "600",
                margin: "4px 0 0 0",
              }}
            >
              {formattedDate}
            </p>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <span
              style={{
                color: "#6b7280",
                fontSize: "12px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
              }}
            >
              Time
            </span>
            <p
              style={{
                color: "#111827",
                fontSize: "16px",
                fontWeight: "600",
                margin: "4px 0 0 0",
              }}
            >
              {formattedTime}
            </p>
          </div>

          {service && (
            <div>
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.5px",
                }}
              >
                Service
              </span>
              <p
                style={{
                  color: "#111827",
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "4px 0 0 0",
                }}
              >
                {service}
              </p>
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          color: "#6b7280",
          fontSize: "14px",
          lineHeight: "1.5",
          margin: "0 0 24px 0",
        }}
      >
        If you need to reschedule or cancel, please contact us as soon as possible.
      </p>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: "20px",
          textAlign: "center" as const,
        }}
      >
        <p
          style={{
            color: "#9ca3af",
            fontSize: "12px",
            margin: "0",
          }}
        >
          CherryCap
        </p>
      </div>
    </div>
  );
}
