import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Guest from "@/lib/models/Guest";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { guestId } = body;

    if (!guestId) {
      return NextResponse.json(
        { error: "guestId is required" },
        { status: 400 }
      );
    }

    const guest = await Guest.findOne({ guestId });

    if (!guest) {
      return NextResponse.json(
        { error: `Guest with ID ${guestId} not found` },
        { status: 404 }
      );
    }

    if (guest.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot check in a cancelled guest" },
        { status: 400 }
      );
    }

    if (guest.checkedIn) {
      return NextResponse.json(
        {
          error: "Guest is already checked in",
          checkedInAt: guest.checkedInAt,
        },
        { status: 409 }
      );
    }

    guest.checkedIn = true;
    guest.checkedInAt = new Date();
    if (guest.status === "waitlist") {
      guest.status = "active";
    }
    await guest.save();

    return NextResponse.json(
      { message: `Guest ${guest.name} (${guestId}) checked in successfully`, guest },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
