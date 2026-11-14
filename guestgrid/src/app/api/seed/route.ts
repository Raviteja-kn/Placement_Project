import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Guest from "@/lib/models/Guest";
import Table from "@/lib/models/Table";
import User from "@/lib/models/User";

export async function POST() {
  try {
    await connectDB();

    // 1. Ensure admin user exists
    const adminEmail = "admin@guestgrid.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "Event Administrator",
        email: adminEmail,
        password: "admin123", // Pre-save hook hashes it
        role: "admin",
      });
    }

    // 2. Clear existing tables & guests for a clean demo seed
    await Table.deleteMany({});
    await Guest.deleteMany({});

    // 3. Seed Tables matching prompt specifications
    const tables = [
      { tableNumber: 1, capacity: 8, label: "VIP & Family Section" },
      { tableNumber: 2, capacity: 8, label: "Main Banquet Hall" },
      { tableNumber: 3, capacity: 8, label: "Main Banquet Hall" },
      { tableNumber: 4, capacity: 8, label: "Courtyard Terrace" },
      { tableNumber: 5, capacity: 6, label: "Executive Corner" },
    ];
    await Table.insertMany(tables);

    // 4. Seed Guests matching prompt examples
    const guests = [
      // Sharma Family (4 members seated at Table 1)
      {
        guestId: "G001",
        name: "Rahul Sharma",
        phone: "9876543210",
        group: "Sharma Family",
        tableNumber: 1,
        checkedIn: true,
        checkedInAt: new Date(Date.now() - 3600000 * 2),
        isVIP: true,
        specialRequirements: "Vegetarian, near stage",
        status: "active",
      },
      {
        guestId: "G002",
        name: "Priya Sharma",
        phone: "9876543211",
        group: "Sharma Family",
        tableNumber: 1,
        checkedIn: true,
        checkedInAt: new Date(Date.now() - 3600000 * 2),
        isVIP: true,
        specialRequirements: "Vegetarian",
        status: "active",
      },
      {
        guestId: "G003",
        name: "Amit Sharma",
        phone: "9876543212",
        group: "Sharma Family",
        tableNumber: 1,
        checkedIn: false,
        isVIP: false,
        specialRequirements: "",
        status: "active",
      },
      {
        guestId: "G004",
        name: "Sneha Sharma",
        phone: "9876543213",
        group: "Sharma Family",
        tableNumber: 1,
        checkedIn: false,
        isVIP: false,
        specialRequirements: "",
        status: "active",
      },

      // Friends Group (Seated at Table 2)
      {
        guestId: "G005",
        name: "Kiran Patel",
        phone: "9876543214",
        group: "Friends Group",
        tableNumber: 2,
        checkedIn: true,
        checkedInAt: new Date(Date.now() - 1800000),
        isVIP: false,
        specialRequirements: "",
        status: "active",
      },
      {
        guestId: "G006",
        name: "Arjun Verma",
        phone: "9876543215",
        group: "Friends Group",
        tableNumber: 2,
        checkedIn: false,
        isVIP: false,
        specialRequirements: "Gluten free",
        status: "active",
      },
      {
        guestId: "G007",
        name: "Rohit Mehta",
        phone: "9876543216",
        group: "Friends Group",
        tableNumber: 2,
        checkedIn: false,
        isVIP: false,
        specialRequirements: "",
        status: "active",
      },

      // College Friends (Seated at Table 5)
      {
        guestId: "G008",
        name: "Ananya Iyer",
        phone: "9876543217",
        group: "College Friends",
        tableNumber: 5,
        checkedIn: true,
        checkedInAt: new Date(Date.now() - 900000),
        isVIP: false,
        specialRequirements: "Wheelchair accessible seat",
        status: "active",
      },
      {
        guestId: "G009",
        name: "Vikram Das",
        phone: "9876543218",
        group: "College Friends",
        tableNumber: 5,
        checkedIn: false,
        isVIP: false,
        specialRequirements: "",
        status: "active",
      },

      // VIP Solo Guest
      {
        guestId: "G010",
        name: "Dr. Alok Nath",
        phone: "9876543219",
        group: "Keynote Speakers",
        tableNumber: 1,
        checkedIn: true,
        checkedInAt: new Date(Date.now() - 7200000),
        isVIP: true,
        specialRequirements: "VIP Protocol Officer assistance",
        status: "active",
      },

      // Unassigned guest
      {
        guestId: "G011",
        name: "Meera Reddy",
        phone: "9876543220",
        group: "Corporate Partners",
        tableNumber: 0,
        checkedIn: false,
        isVIP: false,
        specialRequirements: "",
        status: "active",
      },

      // Waitlisted guest
      {
        guestId: "G012",
        name: "Siddharth Roy",
        phone: "9876543221",
        group: "Walk-in Registrations",
        tableNumber: 0,
        checkedIn: false,
        isVIP: false,
        specialRequirements: "Waitlisted for Table 2",
        status: "waitlist",
      },
    ];

    await Guest.insertMany(guests);

    return NextResponse.json({
      success: true,
      message: "Placement demo data successfully loaded!",
      admin: {
        email: adminEmail,
        password: "admin123",
      },
      stats: {
        tablesCount: tables.length,
        guestsCount: guests.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
