import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Guest from "@/lib/models/Guest";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const group = searchParams.get("group");
    const status = searchParams.get("status");
    const tableNumber = searchParams.get("tableNumber");
    const checkedIn = searchParams.get("checkedIn");

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { guestId: { $regex: search, $options: "i" } },
      ];
    }

    if (group) {
      filter.group = group;
    }

    if (status) {
      filter.status = status;
    }

    if (tableNumber !== null && tableNumber !== undefined && tableNumber !== "") {
      filter.tableNumber = Number(tableNumber);
    }

    if (checkedIn !== null && checkedIn !== undefined && checkedIn !== "") {
      filter.checkedIn = checkedIn === "true";
    }

    const guests = await Guest.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ guests }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { name, phone, group, tableNumber, isVIP, specialRequirements } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const existingGuest = await Guest.findOne({ phone, status: { $ne: "cancelled" } });
    if (existingGuest) {
      return NextResponse.json(
        {
          error: "Duplicate phone number",
          warning: `A guest with phone number ${phone} already exists`,
          existingGuest: {
            guestId: existingGuest.guestId,
            name: existingGuest.name,
            phone: existingGuest.phone,
            status: existingGuest.status,
          },
        },
        { status: 409 }
      );
    }

    const guest = await Guest.create({
      name,
      phone,
      group: group || "",
      tableNumber: tableNumber || 0,
      isVIP: isVIP || false,
      specialRequirements: specialRequirements || "",
    });

    return NextResponse.json(
      { message: "Guest registered successfully", guest },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
