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

    const format = new URL(req.url).searchParams.get("format") || "json";

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
      Table.find().sort({ tableNumber: 1 }),
      Guest.aggregate([
        { $match: { status: "active", group: { $ne: "" } } },
        {
          $group: {
            _id: "$group",
            memberCount: { $sum: 1 },
            members: {
              $push: {
                guestId: "$guestId",
                name: "$name",
                tableNumber: "$tableNumber",
                checkedIn: "$checkedIn",
                isVIP: "$isVIP",
              },
            },
            tableNumbers: { $addToSet: "$tableNumber" },
          },
        },
        { $sort: { _id: 1 } },
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

    const tableBreakdown = await Promise.all(
      tables.map(async (table) => {
        const guests = await Guest.find({
          tableNumber: table.tableNumber,
          status: "active",
        }).select("guestId name phone group checkedIn isVIP");

        return {
          tableNumber: table.tableNumber,
          label: table.label,
          capacity: table.capacity,
          occupied: guests.length,
          available: table.capacity - guests.length,
          guests,
        };
      })
    );

    let fullyOccupiedTables = 0;
    let tablesWithSpace = 0;
    for (const tb of tableBreakdown) {
      if (tb.occupied >= tb.capacity) {
        fullyOccupiedTables++;
      } else {
        tablesWithSpace++;
      }
    }

    const groupBreakdown = groupAgg.map((g) => {
      const assignedTables = g.tableNumbers.filter((t: number) => t !== 0);
      const allSeated = g.members.every(
        (m: { tableNumber: number }) => m.tableNumber !== 0
      );
      return {
        group: g._id,
        memberCount: g.memberCount,
        members: g.members,
        allSeated,
        allAtSameTable: assignedTables.length <= 1 && allSeated,
        tableNumbers: assignedTables,
      };
    });

    const stats = {
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
    };

    if (format === "text") {
      const lines: string[] = [];
      lines.push("=".repeat(60));
      lines.push("           GUESTGRID EVENT REPORT");
      lines.push(`           Generated: ${new Date().toLocaleString()}`);
      lines.push("=".repeat(60));
      lines.push("");
      lines.push("--- OVERVIEW ---");
      lines.push(`Total Guests (Active):     ${stats.totalGuests}`);
      lines.push(`Checked In:                ${stats.checkedInGuests}`);
      lines.push(`Pending Arrivals:          ${stats.pendingArrivals}`);
      lines.push(`Attendance:                ${stats.attendancePercentage}%`);
      lines.push(`VIP Guests:                ${stats.vipCount}`);
      lines.push(`Cancelled:                 ${stats.cancelledCount}`);
      lines.push(`Waitlisted:                ${stats.waitlistCount}`);
      lines.push("");
      lines.push("--- VENUE ---");
      lines.push(`Total Tables:              ${stats.totalTables}`);
      lines.push(`Total Capacity:            ${stats.totalCapacity}`);
      lines.push(`Occupied Seats:            ${stats.occupiedSeats}`);
      lines.push(`Available Seats:           ${stats.availableSeats}`);
      lines.push(`Venue Occupancy:           ${stats.venueOccupancyPercentage}%`);
      lines.push(`Fully Occupied Tables:     ${stats.fullyOccupiedTables}`);
      lines.push(`Tables with Space:         ${stats.tablesWithSpace}`);
      lines.push(`Groups:                    ${stats.groupCount}`);
      lines.push("");
      lines.push("--- TABLE BREAKDOWN ---");
      for (const tb of tableBreakdown) {
        lines.push("");
        lines.push(
          `  Table ${tb.tableNumber} (${tb.label}) — ${tb.occupied}/${tb.capacity} seats occupied`
        );
        if (tb.guests.length > 0) {
          for (const g of tb.guests) {
            const vipTag = g.isVIP ? " [VIP]" : "";
            const checkTag = g.checkedIn ? " ✓" : " ✗";
            lines.push(
              `    - ${g.guestId} | ${g.name} | ${g.phone}${vipTag}${checkTag}`
            );
          }
        } else {
          lines.push("    (No guests assigned)");
        }
      }
      lines.push("");
      lines.push("--- GROUP BREAKDOWN ---");
      for (const gb of groupBreakdown) {
        lines.push("");
        lines.push(
          `  Group: ${gb.group} (${gb.memberCount} members)`
        );
        lines.push(
          `  Seating: ${gb.allAtSameTable ? "All at same table" : gb.allSeated ? "Spread across tables " + gb.tableNumbers.join(", ") : "Not all seated"}`
        );
        for (const m of gb.members) {
          const vipTag = m.isVIP ? " [VIP]" : "";
          const checkTag = m.checkedIn ? " ✓" : " ✗";
          const tableTag =
            m.tableNumber > 0 ? `Table ${m.tableNumber}` : "Unassigned";
          lines.push(
            `    - ${m.guestId} | ${m.name} | ${tableTag}${vipTag}${checkTag}`
          );
        }
      }
      lines.push("");
      lines.push("=".repeat(60));
      lines.push("           END OF REPORT");
      lines.push("=".repeat(60));

      const textReport = lines.join("\n");

      return new NextResponse(textReport, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="guestgrid-report-${Date.now()}.txt"`,
        },
      });
    }

    return NextResponse.json(
      {
        report: {
          generatedAt: new Date().toISOString(),
          stats,
          tableBreakdown,
          groupBreakdown,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
