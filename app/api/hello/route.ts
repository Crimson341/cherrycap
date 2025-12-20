import { NextResponse } from "next/server";
import aj from "@/lib/arcjet";

export async function GET(req: Request) {
  const decision = await aj.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Hello world",
    ip: decision.ip,
  });
}

export async function POST(req: Request) {
  const decision = await aj.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
