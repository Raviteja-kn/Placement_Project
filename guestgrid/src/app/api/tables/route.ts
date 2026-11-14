import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
import Guest from "@/lib/models/Guest";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const tables = await Table.find().sort({ tableNumber: 1 });

    const tablesWithGuests = await Promise.all(
      tables.map(async (table) => {
        const guests = await Guest.find({
          tableNumber: table.tableNumber,
          status: "active",
        }).select("guestId name phone group checkedIn isVIP");

        const occupied = guests.length;
        const available = table.capacity - occupied;

        return {
          _id: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          label: table.label,
          occupied,
          available,
          guests,
        };
      })
    );

    return NextResponse.json({ tables: tablesWithGuests }, { status: 200 });
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
    const { tableNumber, capacity, label } = body;

    if (tableNumber === undefined || tableNumber === null) {
      return NextResponse.json(
        { error: "tableNumber is required" },
        { status: 400 }
      );
    }

    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return NextResponse.json(
        { error: `Table ${tableNumber} already exists` },
        { status: 409 }
      );
    }

    const table = await Table.create({
      tableNumber,
      capacity: capacity || 8,
      label: label || `Table ${tableNumber}`,
    });

    return NextResponse.json(
      { message: "Table created successfully", table },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
