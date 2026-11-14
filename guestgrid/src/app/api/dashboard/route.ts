import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Guest from "@/lib/models/Guest";
import Table from "@/lib/models/Table";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [
      totalGuests,
      checkedInGuests,
      vipCount,
      cancelledCount,
      waitlistCount,
      tables,
      groupAgg,
    ] = await Promise.all([
      Guest.countDocuments({ status: "active" }),
      Guest.countDocuments({ status: "active", checkedIn: true }),
      Guest.countDocuments({ status: "active", isVIP: true }),
      Guest.countDocuments({ status: "cancelled" }),
      Guest.countDocuments({ status: "waitlist" }),
      Table.find(),
      Guest.aggregate([
        { $match: { status: "active", group: { $ne: "" } } },
        { $group: { _id: "$group" } },
      ]),
    ]);

    const pendingArrivals = totalGuests - checkedInGuests;
    const totalTables = tables.length;
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    const occupiedSeats = await Guest.countDocuments({
      status: "active",
      tableNumber: { $gt: 0 },
    });
    const availableSeats = totalCapacity - occupiedSeats;

    const attendancePercentage =
      totalGuests > 0
        ? Math.round((checkedInGuests / totalGuests) * 100 * 100) / 100
        : 0;
    const venueOccupancyPercentage =
      totalCapacity > 0
        ? Math.round((occupiedSeats / totalCapacity) * 100 * 100) / 100
        : 0;

    const groupCount = groupAgg.length;

    let fullyOccupiedTables = 0;
    let tablesWithSpace = 0;

    for (const table of tables) {
      const guestCount = await Guest.countDocuments({
        tableNumber: table.tableNumber,
        status: "active",
      });
      if (guestCount >= table.capacity) {
        fullyOccupiedTables++;
      } else {
        tablesWithSpace++;
      }
    }

    return NextResponse.json(
      {
        totalGuests,
        checkedInGuests,
        pendingArrivals,
        totalTables,
        totalCapacity,
        occupiedSeats,
        availableSeats,
        attendancePercentage,
        vipCount,
        cancelledCount,
        waitlistCount,
        venueOccupancyPercentage,
        groupCount,
        fullyOccupiedTables,
        tablesWithSpace,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
