# GuestGrid – Event Guest & Table Seating Manager

> **Category:** Food, Hospitality and Events Foundation  
> **Dual Architecture:**  
> 1. **C Console Application** (ANSI C Standard, File I/O, Menu-Driven)  
> 2. **Enterprise Next.js Web Platform** (Next.js App Router, Tailwind CSS, MongoDB Atlas, NextAuth, Vercel-ready)

---

## 📁 Project Directory Structure

```text
Palcement Project/
├── guestgrid/                        # Next.js Full-Stack Web Application (Vercel-ready)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/                  # 12 REST API endpoints
│   │   │   │   ├── auth/             # NextAuth & registration
│   │   │   │   ├── dashboard/        # Real-time venue metrics
│   │   │   │   ├── groups/           # Family & group aggregations
│   │   │   │   ├── guests/           # Registry & duplicate detection
│   │   │   │   ├── reports/          # Audit & text report generators
│   │   │   │   ├── seed/             # 1-click placement demo seeder
│   │   │   │   └── tables/           # Capacity & allocation logic
│   │   │   ├── dashboard/            # Executive SaaS dashboard pages
│   │   │   │   ├── checkin/          # Fast reception check-in desk
│   │   │   │   ├── groups/           # Family split-prevention manager
│   │   │   │   ├── guests/           # Guest registry with duplicate warnings
│   │   │   │   ├── reports/          # Attendance & seating analytics
│   │   │   │   └── tables/           # Visual banquet table floor plan
│   │   │   ├── login/                # Sign-in portal
│   │   │   ├── register/             # Organizer registration
│   │   │   ├── globals.css           # Modern corporate styling
│   │   │   ├── layout.tsx            # App root layout
│   │   │   └── page.tsx              # Business landing & auth portal
│   │   ├── components/               # Reusable UI widgets
│   │   │   ├── Badge.tsx             # Status chip badges
│   │   │   ├── ConfirmDialog.tsx     # Deletion confirmation
│   │   │   ├── DashboardLayout.tsx   # Sidebar + content wrapper
│   │   │   ├── GuestForm.tsx         # Guest registration form
│   │   │   ├── Modal.tsx             # Dialog modals
│   │   │   ├── Providers.tsx         # Session & Toast providers
│   │   │   ├── Sidebar.tsx           # Dark navigation sidebar
│   │   │   ├── StatsCard.tsx         # KPI analytics cards
│   │   │   └── TableForm.tsx         # Table configuration form
│   │   ├── lib/
│   │   │   ├── models/               # Mongoose ODM schemas (Guest, Table, User)
│   │   │   ├── auth.ts               # NextAuth JWT session provider
│   │   │   ├── db.ts                 # MongoDB connection cache
│   │   │   └── types.ts              # TypeScript domain interfaces
│   │   └── middleware.ts             # Route access protection
│   ├── .env.example                  # Environment variables template
│   ├── next.config.ts                # Next.js configuration
│   ├── package.json                  # Dependencies & scripts
│   └── vercel.json                   # Vercel deployment configuration
│
├── guestgrid_c/                      # C Console Application (College Placement Core)
│   ├── guestgrid.h                   # Data models, structs & function prototypes
│   ├── guestgrid.c                   # Complete 10-module C implementation
│   ├── build.bat                     # Quick Windows build script
│   └── README.md                     # C compilation & viva preparation guide
│
├── VERCEL_DEPLOYMENT_GUIDE.md        # Step-by-step MongoDB Atlas + Vercel setup
└── README.md                         # Project documentation
```

---

## 🎯 Core Features Verified & Tested

| Feature Module | C Console Application | Next.js Web Application |
|---|---|---|
| **1. Guest Registration** | `addGuest()` with auto `G001` IDs | `/dashboard/guests` + auto `G001` hook |
| **2. Duplicate Detection** | `checkDuplicate()` blocks duplicate phone | Instant modal & toast warning on duplicate |
| **3. Smart Table Allocation** | `allocateTable()` blocks overcapacity | Visual capacity bars + seat assignment modal |
| **4. Family/Group Seating** | `allocateGroup()` refuses to split families | Cluster manager + multi-member single-table lock |
| **5. Last-Minute Registration** | Supports on-the-fly table updates | Instant modal registration + table dropdown |
| **6. Seat Tracking** | `availableSeats()` table-wise status | Live occupancy bar + venue utilization % |
| **7. Fast Guest Check-In** | `checkInGuest()` timestamp & table directive | Fast reception desk + search & live feed |
| **8. Event Reports** | `generateReport()` console & `.txt` export | Downloadable `.txt` audit + table breakdown |
| **9. File Handling / DB** | `saveGuests()` & `loadGuests()` (`.txt`) | MongoDB Atlas via Mongoose ODM |
| **10. Demo Data Seed** | Option `[12]` pre-populates Sharma Family | 1-click button on login screen |
