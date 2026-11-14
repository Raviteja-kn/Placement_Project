import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
import Guest from "@/lib/models/Guest";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { guestId, group, tableNumber } = body;

    if (tableNumber === undefined || tableNumber === null) {
      return NextResponse.json(
        { error: "tableNumber is required" },
        { status: 400 }
      );
    }

    if (!guestId && !group) {
      return NextResponse.json(
        { error: "Either guestId or group is required" },
        { status: 400 }
      );
    }

    const table = await Table.findOne({ tableNumber });
    if (!table) {
      return NextResponse.json(
        { error: `Table ${tableNumber} not found` },
        { status: 404 }
      );
    }

    const currentOccupancy = await Guest.countDocuments({
      tableNumber,
      status: "active",
    });
    const availableSeats = table.capacity - currentOccupancy;

    let guestsToAllocate;

    if (guestId) {
      const guest = await Guest.findOne({ guestId, status: "active" });
      if (!guest) {
        return NextResponse.json(
          { error: `Guest ${guestId} not found or not active` },
          { status: 404 }
        );
      }
      guestsToAllocate = [guest];
    } else {
      guestsToAllocate = await Guest.find({ group, status: "active" });
      if (guestsToAllocate.length === 0) {
        return NextResponse.json(
          { error: `No active guests found in group "${group}"` },
          { status: 404 }
        );
      }
    }

    if (guestsToAllocate.length > availableSeats) {
      return NextResponse.json(
        {
          error: "Not enough seats available",
          details: {
            tableNumber,
            capacity: table.capacity,
            currentOccupancy,
            availableSeats,
            guestsToAllocate: guestsToAllocate.length,
            shortBy: guestsToAllocate.length - availableSeats,
          },
        },
        { status: 400 }
      );
    }

    const guestIds = guestsToAllocate.map((g) => g._id);
    await Guest.updateMany(
      { _id: { $in: guestIds } },
      { $set: { tableNumber } }
    );

    const updatedGuests = await Guest.find({ _id: { $in: guestIds } });

    return NextResponse.json(
      {
        message: `${updatedGuests.length} guest(s) allocated to table ${tableNumber}`,
        allocatedGuests: updatedGuests,
        tableStatus: {
          tableNumber,
          capacity: table.capacity,
          occupied: currentOccupancy + updatedGuests.length,
          available: availableSeats - updatedGuests.length,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
