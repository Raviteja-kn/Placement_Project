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

    const groups = await Guest.aggregate([
      { $match: { status: "active", group: { $ne: "" } } },
      {
        $group: {
          _id: "$group",
          memberCount: { $sum: 1 },
          members: {
            $push: {
              guestId: "$guestId",
              name: "$name",
              phone: "$phone",
              tableNumber: "$tableNumber",
              checkedIn: "$checkedIn",
              isVIP: "$isVIP",
            },
          },
          tableNumbers: { $addToSet: "$tableNumber" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = groups.map((g) => {
      const assignedTables = g.tableNumbers.filter((t: number) => t !== 0);
      const allSeated =
        g.members.every((m: { tableNumber: number }) => m.tableNumber !== 0) &&
        g.members.length > 0;
      const allAtSameTable = assignedTables.length <= 1 && allSeated;

      return {
        group: g._id,
        memberCount: g.memberCount,
        members: g.members,
        allSeated,
        allAtSameTable,
        tableNumbers: assignedTables,
      };
    });

    return NextResponse.json({ groups: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
