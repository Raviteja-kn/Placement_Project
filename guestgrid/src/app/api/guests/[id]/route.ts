import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Guest from "@/lib/models/Guest";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;
    const guest = await Guest.findById(id);

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ guest }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const guest = await Guest.findById(id);
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    if (body.phone && body.phone !== guest.phone) {
      const duplicate = await Guest.findOne({
        phone: body.phone,
        _id: { $ne: id },
        status: { $ne: "cancelled" },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Phone number already in use by another guest" },
          { status: 409 }
        );
      }
    }

    const updatedGuest = await Guest.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      { message: "Guest updated successfully", guest: updatedGuest },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;

    const guest = await Guest.findById(id);
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const updatedGuest = await Guest.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    return NextResponse.json(
      { message: "Guest cancelled successfully", guest: updatedGuest },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
