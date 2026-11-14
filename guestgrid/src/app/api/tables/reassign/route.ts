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
    const { guestId, group, fromTable, toTable } = body;

    if (fromTable === undefined || toTable === undefined) {
      return NextResponse.json(
        { error: "fromTable and toTable are required" },
        { status: 400 }
      );
    }

    if (!guestId && !group) {
      return NextResponse.json(
        { error: "Either guestId or group is required" },
        { status: 400 }
      );
    }

    if (fromTable === toTable) {
      return NextResponse.json(
        { error: "fromTable and toTable cannot be the same" },
        { status: 400 }
      );
    }

    const sourceTable = await Table.findOne({ tableNumber: fromTable });
    if (!sourceTable) {
      return NextResponse.json(
        { error: `Source table ${fromTable} not found` },
        { status: 404 }
      );
    }

    const destinationTable = await Table.findOne({ tableNumber: toTable });
    if (!destinationTable) {
      return NextResponse.json(
        { error: `Destination table ${toTable} not found` },
        { status: 404 }
      );
    }

    let guestsToMove;

    if (guestId) {
      const guest = await Guest.findOne({
        guestId,
        tableNumber: fromTable,
        status: "active",
      });
      if (!guest) {
        return NextResponse.json(
          {
            error: `Guest ${guestId} not found at table ${fromTable} or not active`,
          },
          { status: 404 }
        );
      }
      guestsToMove = [guest];
    } else {
      guestsToMove = await Guest.find({
        group,
        tableNumber: fromTable,
        status: "active",
      });
      if (guestsToMove.length === 0) {
        return NextResponse.json(
          {
            error: `No active guests from group "${group}" found at table ${fromTable}`,
          },
          { status: 404 }
        );
      }
    }

    const destOccupancy = await Guest.countDocuments({
      tableNumber: toTable,
      status: "active",
    });
    const destAvailable = destinationTable.capacity - destOccupancy;

    if (guestsToMove.length > destAvailable) {
      return NextResponse.json(
        {
          error: "Not enough seats at destination table",
          details: {
            toTable,
            capacity: destinationTable.capacity,
            currentOccupancy: destOccupancy,
            availableSeats: destAvailable,
            guestsToMove: guestsToMove.length,
            shortBy: guestsToMove.length - destAvailable,
          },
        },
        { status: 400 }
      );
    }

    const guestObjectIds = guestsToMove.map((g) => g._id);
    await Guest.updateMany(
      { _id: { $in: guestObjectIds } },
      { $set: { tableNumber: toTable } }
    );

    const updatedGuests = await Guest.find({ _id: { $in: guestObjectIds } });

    return NextResponse.json(
      {
        message: `${updatedGuests.length} guest(s) reassigned from table ${fromTable} to table ${toTable}`,
        reassignedGuests: updatedGuests,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
