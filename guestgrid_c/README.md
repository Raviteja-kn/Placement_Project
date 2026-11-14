# GuestGrid – Console Event Guest & Table Seating Manager (C Implementation)

**Category:** Food, Hospitality and Events Foundation  
**Language:** ANSI C (C99 / C11 Standard)  
**File Persistence:** Text File I/O (`guestgrid_data.txt`, `guestgrid_report.txt`)

---

## 📋 Features Implemented (Sections 1 – 10)

1. **Guest Registration & Management:** Unique Auto-generated IDs (`G001`, `G002`...), stores name, phone, group/family, table number, VIP flag, and dietary requirements.
2. **Duplicate Guest Detection:** Validates phone numbers before registration. Displays the exact warning requested:
   ```text
   WARNING: Duplicate Guest Detected!
   Guest Name: Rahul
   Phone: 9876543210
   Existing Guest ID: G001
   This guest is already registered.
   ```
3. **Smart Table Allocation System:** Tracks table capacity, occupied, available seats, and blocks overcapacity allocations.
4. **Family & Group Seating Guarantee:** Automatically prevents splitting families across tables. If a table has insufficient seats, the system alerts the administrator instead of separating the family.
5. **Last-Minute Registration:** Quick seat assignment for last-minute arrivals.
6. **Real-Time Seating Availability:** Full breakdown of venue tables, occupancy percentage, and available seats.
7. **Fast Guest Check-In Desk:** ID lookup, verifies table number, stamps arrival time, prevents duplicate check-ins.
8. **Audit Reports & Text Export:** Formats console report and generates `guestgrid_report.txt`.
9. **File Storage:** Saves all guest and table data persistently.

---

## 🚀 How to Compile and Run

### Option 1: Using GCC / MinGW (Command Line)
```bash
cd "c:\Users\ravit\Desktop\Palcement Project\guestgrid_c"
gcc -std=c99 guestgrid.c -o guestgrid.exe
guestgrid.exe
```

### Option 2: Using Code::Blocks / Dev-C++ / Visual Studio
1. Open `guestgrid.c` and `guestgrid.h` in Code::Blocks or Dev-C++.
2. Click **Build and Run** (`F9` in Code::Blocks, `F11` in Dev-C++).

### Option 3: Online Compilers (Instant Demo)
Paste `guestgrid.h` and `guestgrid.c` into [OnlineGDB](https://www.onlinegdb.com/online_c_compiler) and click **Run**.
