import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
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
    const table = await Table.findById(id);

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const guests = await Guest.find({
      tableNumber: table.tableNumber,
      status: "active",
    });

    const occupied = guests.length;
    const available = table.capacity - occupied;

    return NextResponse.json(
      {
        table: {
          ...table.toObject(),
          occupied,
          available,
          guests,
        },
      },
      { status: 200 }
    );
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

    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (body.tableNumber && body.tableNumber !== table.tableNumber) {
      const duplicate = await Table.findOne({
        tableNumber: body.tableNumber,
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `Table number ${body.tableNumber} already exists` },
          { status: 409 }
        );
      }
    }

    if (body.capacity !== undefined) {
      const currentGuests = await Guest.countDocuments({
        tableNumber: table.tableNumber,
        status: "active",
      });
      if (body.capacity < currentGuests) {
        return NextResponse.json(
          {
            error: `Cannot reduce capacity below current occupancy (${currentGuests} guests assigned)`,
          },
          { status: 400 }
        );
      }
    }

    const updatedTable = await Table.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      { message: "Table updated successfully", table: updatedTable },
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

    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const assignedGuests = await Guest.countDocuments({
      tableNumber: table.tableNumber,
      status: "active",
    });

    if (assignedGuests > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete table ${table.tableNumber}: ${assignedGuests} guest(s) are currently assigned. Reassign them first.`,
        },
        { status: 400 }
      );
    }

    await Table.findByIdAndDelete(id);

    return NextResponse.json(
      { message: `Table ${table.tableNumber} deleted successfully` },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
