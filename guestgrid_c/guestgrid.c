/**
 * ============================================================================
 * GuestGrid - Event Guest and Table Seating Manager
 * Category: Food, Hospitality and Events Foundation
 * Programming Language: C (ANSI C99 / C11)
 * ============================================================================
 */

#include "guestgrid.h"

Guest guests[MAX_GUESTS];
int guestCount = 0;

Table tables[MAX_TABLES];
int tableCount = 0;

/* Helper: Clear Console */
void clearScreen(void) {
#if defined(_WIN32) || defined(_WIN64)
    system("cls");
#else
    system("clear");
#endif
}

/* Helper: Pause */
void pauseConsole(void) {
    printf("\nPress ENTER to continue...");
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
    getchar();
}

/* Helper: Trim newline */
static void trimNewline(char *str) {
    size_t len = strlen(str);
    if (len > 0 && (str[len - 1] == '\n' || str[len - 1] == '\r')) {
        str[len - 1] = '\0';
    }
}

/* Generate unique ID: G001, G002... */
void generateNextGuestId(char *outId) {
    int maxId = 0;
    for (int i = 0; i < guestCount; i++) {
        int idNum = 0;
        if (sscanf(guests[i].guestId, "G%d", &idNum) == 1) {
            if (idNum > maxId) {
                maxId = idNum;
            }
        }
    }
    sprintf(outId, "G%03d", maxId + 1);
}

/* 2. Duplicate Detection */
int checkDuplicate(const char *phone, const char *excludeGuestId) {
    for (int i = 0; i < guestCount; i++) {
        if (guests[i].status == 0) continue; /* Skip cancelled */
        if (excludeGuestId && strcmp(guests[i].guestId, excludeGuestId) == 0) continue;

        if (strcmp(guests[i].phone, phone) == 0) {
            return i; /* Return index of existing duplicate */
        }
    }
    return -1; /* Unique */
}

/* Count how many guests currently seated at a given table */
static int getTableOccupancy(int tableNum) {
    int count = 0;
    for (int i = 0; i < guestCount; i++) {
        if (guests[i].status == 1 && guests[i].tableNumber == tableNum) {
            count++;
        }
    }
    return count;
}

/* Find table by number */
static int findTableIndex(int tableNum) {
    for (int i = 0; i < tableCount; i++) {
        if (tables[i].tableNumber == tableNum) return i;
    }
    return -1;
}

/* 1. Guest Registration & Management */
void addGuest(void) {
    if (guestCount >= MAX_GUESTS) {
        printf("\n[ERROR] Guest database is full (Max %d records).\n", MAX_GUESTS);
        pauseConsole();
        return;
    }

    Guest newGuest;
    memset(&newGuest, 0, sizeof(Guest));
    generateNextGuestId(newGuest.guestId);

    printf("\n======================================================\n");
    printf("              NEW GUEST REGISTRATION                 \n");
    printf("======================================================\n");
    printf("Assigned Guest ID: %s\n\n", newGuest.guestId);

    /* Read Name */
    printf("Enter Full Name: ");
    while (getchar() != '\n'); /* Flush leftover */
    fgets(newGuest.name, sizeof(newGuest.name), stdin);
    trimNewline(newGuest.name);
    if (strlen(newGuest.name) == 0) {
        printf("[ERROR] Name cannot be empty.\n");
        pauseConsole();
        return;
    }

    /* Read Phone & Check Duplicate */
    printf("Enter Phone Number: ");
    fgets(newGuest.phone, sizeof(newGuest.phone), stdin);
    trimNewline(newGuest.phone);

    int dupIndex = checkDuplicate(newGuest.phone, NULL);
    if (dupIndex != -1) {
        printf("\n------------------------------------------------------\n");
        printf("  WARNING: Duplicate Guest Detected!                 \n");
        printf("------------------------------------------------------\n");
        printf("  Guest Name        : %s\n", guests[dupIndex].name);
        printf("  Phone Number      : %s\n", guests[dupIndex].phone);
        printf("  Existing Guest ID : %s\n", guests[dupIndex].guestId);
        printf("  Seated at Table   : %d\n", guests[dupIndex].tableNumber);
        printf("------------------------------------------------------\n");
        printf("  [REGISTRATION BLOCKED] This guest is already registered.\n");
        pauseConsole();
        return;
    }

    /* Group / Family */
    printf("Enter Family / Group Name (or press ENTER if none): ");
    fgets(newGuest.group, sizeof(newGuest.group), stdin);
    trimNewline(newGuest.group);

    /* Table Selection */
    printf("\nAvailable Banquet Tables:\n");
    printf("%-8s %-10s %-10s %-10s\n", "Table", "Capacity", "Occupied", "Available");
    printf("----------------------------------------\n");
    for (int i = 0; i < tableCount; i++) {
        int occ = getTableOccupancy(tables[i].tableNumber);
        int avail = tables[i].capacity - occ;
        printf("Table %-2d %-10d %-10d %-10d %s\n",
               tables[i].tableNumber, tables[i].capacity, occ, avail,
               avail <= 0 ? "[FULL]" : "");
    }
    printf("Enter Desired Table Number (or 0 for Unassigned): ");
    scanf("%d", &newGuest.tableNumber);

    if (newGuest.tableNumber > 0) {
        int tIdx = findTableIndex(newGuest.tableNumber);
        if (tIdx == -1) {
            printf("[WARNING] Table %d does not exist. Defaulted to Unassigned (0).\n", newGuest.tableNumber);
            newGuest.tableNumber = 0;
        } else {
            int occ = getTableOccupancy(newGuest.tableNumber);
            if (occ >= tables[tIdx].capacity) {
                printf("[WARNING] Table %d is fully occupied (%d/%d seats). Set to Unassigned (0).\n",
                       newGuest.tableNumber, occ, tables[tIdx].capacity);
                newGuest.tableNumber = 0;
            }
        }
    }

    /* VIP */
    char vipChoice;
    printf("Mark as VIP Guest? (y/n): ");
    while (getchar() != '\n');
    scanf("%c", &vipChoice);
    newGuest.isVIP = (vipChoice == 'y' || vipChoice == 'Y');

    /* Special Requirements */
    printf("Dietary or Accessibility Requirements (press ENTER if none): ");
    while (getchar() != '\n');
    fgets(newGuest.specialReq, sizeof(newGuest.specialReq), stdin);
    trimNewline(newGuest.specialReq);

    newGuest.status = 1; /* Active */
    newGuest.checkedIn = false;
    strcpy(newGuest.checkInTime, "Pending");

    guests[guestCount++] = newGuest;
    saveGuests();

    printf("\n------------------------------------------------------\n");
    printf("SUCCESS: Guest %s (%s) registered successfully!\n", newGuest.guestId, newGuest.name);
    if (newGuest.tableNumber > 0) {
        printf("Assigned Table: Table %d\n", newGuest.tableNumber);
    } else {
        printf("Assigned Table: Unassigned (Please allocate before event begins)\n");
    }
    printf("------------------------------------------------------\n");
    pauseConsole();
}

/* Display All Guests */
void displayAllGuests(void) {
    printf("\n========================================================================================\n");
    printf("                                  COMPLETE GUEST REGISTRY                               \n");
    printf("========================================================================================\n");
    printf("%-7s %-20s %-13s %-16s %-7s %-9s %-10s\n",
           "ID", "Name", "Phone", "Group", "Table", "VIP", "Arrival");
    printf("----------------------------------------------------------------------------------------\n");

    int activeCount = 0;
    for (int i = 0; i < guestCount; i++) {
        if (guests[i].status == 0) continue;
        activeCount++;

        char tableStr[12];
        if (guests[i].tableNumber > 0) {
            sprintf(tableStr, "T%d", guests[i].tableNumber);
        } else {
            strcpy(tableStr, "None");
        }

        printf("%-7s %-20.20s %-13s %-16.16s %-7s %-9s %-10s\n",
               guests[i].guestId,
               guests[i].name,
               guests[i].phone,
               strlen(guests[i].group) > 0 ? guests[i].group : "-",
               tableStr,
               guests[i].isVIP ? "★ VIP" : "Standard",
               guests[i].checkedIn ? "ARRIVED" : "Pending");
    }

    if (activeCount == 0) {
        printf("                       No active guest registrations found.                             \n");
    }
    printf("----------------------------------------------------------------------------------------\n");
    printf("Total Active Registered Guests: %d\n", activeCount);
    pauseConsole();
}

/* 3. Guest Search */
void searchGuest(void) {
    char term[64];
    printf("\n======================================================\n");
    printf("                     SEARCH GUEST                     \n");
    printf("======================================================\n");
    printf("Enter Search Query (Guest ID, Name, or Phone): ");
    while (getchar() != '\n');
    fgets(term, sizeof(term), stdin);
    trimNewline(term);

    if (strlen(term) == 0) return;

    printf("\nMatches Found:\n");
    printf("%-7s %-20s %-13s %-16s %-8s %-10s\n", "ID", "Name", "Phone", "Group", "Table", "Status");
    printf("-----------------------------------------------------------------------------\n");

    int matches = 0;
    for (int i = 0; i < guestCount; i++) {
        if (strstr(guests[i].guestId, term) != NULL ||
            strstr(guests[i].name, term) != NULL ||
            strstr(guests[i].phone, term) != NULL) {

            matches++;
            printf("%-7s %-20.20s %-13s %-16.16s Table %-2d %s\n",
                   guests[i].guestId,
                   guests[i].name,
                   guests[i].phone,
                   strlen(guests[i].group) > 0 ? guests[i].group : "-",
                   guests[i].tableNumber,
                   guests[i].checkedIn ? "[Arrived]" : "[Pending]");
        }
    }

    if (matches == 0) {
        printf("No guests found matching '%s'.\n", term);
    }
    printf("-----------------------------------------------------------------------------\n");
    pauseConsole();
}

/* Update Guest Information */
void updateGuest(void) {
    char id[16];
    printf("\nEnter Guest ID to update (e.g. G001): ");
    scanf("%15s", id);

    int idx = -1;
    for (int i = 0; i < guestCount; i++) {
        if (strcmp(guests[i].guestId, id) == 0 && guests[i].status != 0) {
            idx = i;
            break;
        }
    }

    if (idx == -1) {
        printf("[ERROR] Guest with ID %s not found.\n", id);
        pauseConsole();
        return;
    }

    printf("\nUpdating Guest: %s (%s)\n", guests[idx].guestId, guests[idx].name);
    printf("Enter New Name (or press ENTER to keep '%s'): ", guests[idx].name);
    while (getchar() != '\n');
    char temp[MAX_NAME_LEN];
    fgets(temp, sizeof(temp), stdin);
    trimNewline(temp);
    if (strlen(temp) > 0) strcpy(guests[idx].name, temp);

    printf("Enter New Group Name (or press ENTER to keep '%s'): ", guests[idx].group);
    fgets(temp, sizeof(temp), stdin);
    trimNewline(temp);
    if (strlen(temp) > 0) strcpy(guests[idx].group, temp);

    printf("Enter New Table Number (Current: %d, enter -1 to keep): ", guests[idx].tableNumber);
    int newTable;
    scanf("%d", &newTable);
    if (newTable >= 0) {
        guests[idx].tableNumber = newTable;
    }

    saveGuests();
    printf("\nSUCCESS: Guest %s updated successfully!\n", guests[idx].guestId);
    pauseConsole();
}

/* Delete / Cancel Registration */
void deleteGuest(void) {
    char id[16];
    printf("\nEnter Guest ID to cancel/delete (e.g. G001): ");
    scanf("%15s", id);

    for (int i = 0; i < guestCount; i++) {
        if (strcmp(guests[i].guestId, id) == 0 && guests[i].status != 0) {
            guests[i].status = 0; /* Cancelled */
            int releasedTable = guests[i].tableNumber;
            guests[i].tableNumber = 0;
            saveGuests();
            printf("\nSUCCESS: Guest %s (%s) registration cancelled.", id, guests[i].name);
            if (releasedTable > 0) {
                printf(" Seat released at Table %d.\n", releasedTable);
            } else {
                printf("\n");
            }
            pauseConsole();
            return;
        }
    }

    printf("[ERROR] Active guest with ID %s not found.\n", id);
    pauseConsole();
}

/* 4. Smart Table Allocation System */
void allocateTable(void) {
    char id[16];
    printf("\n======================================================\n");
    printf("                SMART TABLE ALLOCATION                \n");
    printf("======================================================\n");
    printf("Enter Guest ID to allocate (e.g. G001): ");
    scanf("%15s", id);

    int gIdx = -1;
    for (int i = 0; i < guestCount; i++) {
        if (strcmp(guests[i].guestId, id) == 0 && guests[i].status == 1) {
            gIdx = i;
            break;
        }
    }

    if (gIdx == -1) {
        printf("[ERROR] Active guest %s not found.\n", id);
        pauseConsole();
        return;
    }

    printf("\nGuest: %s | Family: %s | Current Table: %d\n",
           guests[gIdx].name,
           strlen(guests[gIdx].group) > 0 ? guests[gIdx].group : "None",
           guests[gIdx].tableNumber);

    printf("\nAvailable Tables:\n");
    printf("%-8s %-10s %-10s %-10s\n", "Table", "Capacity", "Occupied", "Available");
    printf("----------------------------------------\n");
    for (int i = 0; i < tableCount; i++) {
        int occ = getTableOccupancy(tables[i].tableNumber);
        int avail = tables[i].capacity - occ;
        printf("Table %-2d %-10d %-10d %-10d %s\n",
               tables[i].tableNumber, tables[i].capacity, occ, avail,
               avail <= 0 ? "[FULL]" : "");
    }

    printf("\nEnter Destination Table Number: ");
    int targetTable;
    scanf("%d", &targetTable);

    int tIdx = findTableIndex(targetTable);
    if (tIdx == -1) {
        printf("[ERROR] Table %d does not exist.\n", targetTable);
        pauseConsole();
        return;
    }

    int currentOcc = getTableOccupancy(targetTable);
    if (currentOcc >= tables[tIdx].capacity) {
        printf("\n[ERROR - OVERCAPACITY BLOCKED]\n");
        printf("Table %d is at maximum seating capacity (%d/%d occupied)!\n",
               targetTable, currentOcc, tables[tIdx].capacity);
        pauseConsole();
        return;
    }

    guests[gIdx].tableNumber = targetTable;
    saveGuests();

    printf("\nSUCCESS: Guest %s assigned to Table %d (%d/%d seats now filled).\n",
           guests[gIdx].name, targetTable, currentOcc + 1, tables[tIdx].capacity);
    pauseConsole();
}

/* 5. Family & Group Management - Seating Guarantee */
void viewGroup(void) {
    char groupName[MAX_GROUP_LEN];
    printf("\nEnter Group / Family Name to view: ");
    while (getchar() != '\n');
    fgets(groupName, sizeof(groupName), stdin);
    trimNewline(groupName);

    printf("\n======================================================\n");
    printf("        GROUP ROSTER: %s                              \n", groupName);
    printf("======================================================\n");
    printf("%-7s %-20s %-13s %-8s %-10s\n", "ID", "Name", "Phone", "Table", "Arrival");
    printf("------------------------------------------------------\n");

    int count = 0;
    int tableDist[MAX_TABLES] = {0};

    for (int i = 0; i < guestCount; i++) {
        if (guests[i].status == 1 && strcasecmp(guests[i].group, groupName) == 0) {
            count++;
            printf("%-7s %-20.20s %-13s Table %-2d %s\n",
                   guests[i].guestId,
                   guests[i].name,
                   guests[i].phone,
                   guests[i].tableNumber,
                   guests[i].checkedIn ? "Arrived" : "Pending");

            if (guests[i].tableNumber > 0 && guests[i].tableNumber < MAX_TABLES) {
                tableDist[guests[i].tableNumber]++;
            }
        }
    }

    if (count == 0) {
        printf("No active members found in group '%s'.\n", groupName);
    } else {
        printf("------------------------------------------------------\n");
        printf("Total Members in Group: %d\n", count);

        /* Check if group is split */
        int tablesUsed = 0;
        int singleTable = 0;
        for (int t = 1; t < MAX_TABLES; t++) {
            if (tableDist[t] > 0) {
                tablesUsed++;
                singleTable = t;
            }
        }

        if (tablesUsed == 1) {
            printf("[STATUS: ALL MEMBERS SEATED TOGETHER AT TABLE %d]\n", singleTable);
        } else if (tablesUsed > 1) {
            printf("[WARNING: GROUP IS CURRENTLY SPLIT ACROSS %d DIFFERENT TABLES!]\n", tablesUsed);
        } else {
            printf("[STATUS: MEMBERS AWAITING SEAT ALLOCATION]\n");
        }
    }
    pauseConsole();
}

/* Allocate Entire Family/Group to One Table */
void allocateGroup(void) {
    char groupName[MAX_GROUP_LEN];
    printf("\n======================================================\n");
    printf("             ALLOCATE ENTIRE FAMILY / GROUP           \n");
    printf("======================================================\n");
    printf("Enter Group / Family Name: ");
    while (getchar() != '\n');
    fgets(groupName, sizeof(groupName), stdin);
    trimNewline(groupName);

    /* Count active members */
    int memberIndices[MAX_GUESTS];
    int groupSize = 0;
    for (int i = 0; i < guestCount; i++) {
        if (guests[i].status == 1 && strcasecmp(guests[i].group, groupName) == 0) {
            memberIndices[groupSize++] = i;
        }
    }

    if (groupSize == 0) {
        printf("[ERROR] No active guests found in group '%s'.\n", groupName);
        pauseConsole();
        return;
    }

    printf("\nFound %d members in '%s':\n", groupSize, groupName);
    for (int i = 0; i < groupSize; i++) {
        printf(" - %s (%s)\n", guests[memberIndices[i]].name, guests[memberIndices[i]].guestId);
    }

    printf("\nEnter Target Table Number for the whole family: ");
    int targetTable;
    scanf("%d", &targetTable);

    int tIdx = findTableIndex(targetTable);
    if (tIdx == -1) {
        printf("[ERROR] Table %d does not exist.\n", targetTable);
        pauseConsole();
        return;
    }

    /* Check available capacity */
    int currentOcc = getTableOccupancy(targetTable);
    /* If any group member is already seated at this table, don't double count */
    int alreadyAtTable = 0;
    for (int i = 0; i < groupSize; i++) {
        if (guests[memberIndices[i]].tableNumber == targetTable) {
            alreadyAtTable++;
        }
    }

    int effectiveNeeded = groupSize - alreadyAtTable;
    int freeSeats = tables[tIdx].capacity - currentOcc;

    if (effectiveNeeded > freeSeats) {
        printf("\n------------------------------------------------------\n");
        printf("  WARNING: Insufficient Seats for Entire Group!      \n");
        printf("------------------------------------------------------\n");
        printf("  Group Members Needed : %d\n", effectiveNeeded);
        printf("  Available Seats      : %d at Table %d\n", freeSeats, targetTable);
        printf("  Short By             : %d seat(s)\n", effectiveNeeded - freeSeats);
        printf("------------------------------------------------------\n");
        printf("  [SPLIT PREVENTED] System refuses to separate family members.\n");
        printf("  Please choose a table with at least %d free seats.\n", effectiveNeeded);
        pauseConsole();
        return;
    }

    /* Assign all members */
    for (int i = 0; i < groupSize; i++) {
        guests[memberIndices[i]].tableNumber = targetTable;
    }
    saveGuests();

    printf("\nSUCCESS: All %d members of '%s' allocated to Table %d!\n",
           groupSize, groupName, targetTable);
    pauseConsole();
}

/* 6. Available Seat Tracking */
void availableSeats(void) {
    int totalCap = 0;
    int totalOcc = 0;

    printf("\n======================================================\n");
    printf("             SEATING AVAILABILITY REPORT              \n");
    printf("======================================================\n");
    printf("%-8s %-10s %-10s %-10s %-10s\n", "Table", "Capacity", "Occupied", "Available", "Status");
    printf("------------------------------------------------------\n");

    for (int i = 0; i < tableCount; i++) {
        int occ = getTableOccupancy(tables[i].tableNumber);
        int avail = tables[i].capacity - occ;
        totalCap += tables[i].capacity;
        totalOcc += occ;

        printf("Table %-2d %-10d %-10d %-10d %s\n",
               tables[i].tableNumber,
               tables[i].capacity,
               occ,
               avail,
               avail <= 0 ? "FULL" : "Available");
    }

    int totalAvail = totalCap - totalOcc;
    double occPercent = totalCap > 0 ? ((double)totalOcc / totalCap) * 100.0 : 0.0;

    printf("------------------------------------------------------\n");
    printf("Total Tables           : %d\n", tableCount);
    printf("Total Seating Capacity : %d\n", totalCap);
    printf("Occupied Seats         : %d\n", totalOcc);
    printf("Available Seats        : %d\n", totalAvail);
    printf("Venue Seating Status   : %.2f%% Occupied\n", occPercent);
    printf("======================================================\n");
    pauseConsole();
}

/* 7. Guest Arrival and Check-In Management */
void checkInGuest(void) {
    char id[16];
    printf("\n======================================================\n");
    printf("                   GUEST CHECK-IN                     \n");
    printf("======================================================\n");
    printf("Enter Guest ID: ");
    scanf("%15s", id);

    int idx = -1;
    for (int i = 0; i < guestCount; i++) {
        if (strcmp(guests[i].guestId, id) == 0) {
            idx = i;
            break;
        }
    }

    if (idx == -1) {
        printf("\n[ERROR] Guest ID '%s' not found in registration database.\n", id);
        pauseConsole();
        return;
    }

    if (guests[idx].status == 0) {
        printf("\n[ERROR] Registration for %s has been cancelled.\n", guests[idx].name);
        pauseConsole();
        return;
    }

    if (guests[idx].checkedIn) {
        printf("\n[WARNING: ALREADY CHECKED IN]\n");
        printf("Guest %s was already checked in at %s.\n", guests[idx].name, guests[idx].checkInTime);
        printf("Assigned Table: Table %d\n", guests[idx].tableNumber);
        pauseConsole();
        return;
    }

    /* Mark check in */
    guests[idx].checkedIn = true;
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    strftime(guests[idx].checkInTime, sizeof(guests[idx].checkInTime), "%I:%M %p", t);
    saveGuests();

    printf("\n------------------------------------------------------\n");
    printf("Guest Name     : %s %s\n", guests[idx].name, guests[idx].isVIP ? "(VIP)" : "");
    printf("Table Number   : %d\n", guests[idx].tableNumber);
    if (strlen(guests[idx].specialReq) > 0) {
        printf("Notes / Dietary: %s\n", guests[idx].specialReq);
    }
    printf("Arrival Status : SUCCESSFULLY CHECKED IN\n");
    printf("------------------------------------------------------\n");
    pauseConsole();
}

/* 8. Event Reports and Analytics */
void generateReport(void) {
    int activeGuests = 0;
    int arrivedGuests = 0;
    int vipGuests = 0;
    int totalCap = 0;
    int totalOcc = 0;

    for (int i = 0; i < guestCount; i++) {
        if (guests[i].status == 1) {
            activeGuests++;
            if (guests[i].checkedIn) arrivedGuests++;
            if (guests[i].isVIP) vipGuests++;
        }
    }

    for (int i = 0; i < tableCount; i++) {
        totalCap += tables[i].capacity;
        totalOcc += getTableOccupancy(tables[i].tableNumber);
    }

    int pendingArrivals = activeGuests - arrivedGuests;
    int availableSeatsCount = totalCap - totalOcc;
    double attendPercent = activeGuests > 0 ? ((double)arrivedGuests / activeGuests) * 100.0 : 0.0;
    double occPercent = totalCap > 0 ? ((double)totalOcc / totalCap) * 100.0 : 0.0;

    /* Display on console */
    printf("\n========== EVENT REPORT ==========\n\n");
    printf("Total Registered Guests : %d\n", activeGuests);
    printf("Total Checked-in        : %d\n", arrivedGuests);
    printf("Pending Arrivals        : %d\n\n", pendingArrivals);
    printf("Total Tables            : %d\n", tableCount);
    printf("Total Seating Capacity  : %d\n", totalCap);
    printf("Occupied Seats          : %d\n", totalOcc);
    printf("Available Seats         : %d\n\n", availableSeatsCount);
    printf("Attendance Percentage   : %.1f%%\n", attendPercent);
    printf("Venue Occupancy Rate    : %.1f%%\n", occPercent);
    printf("VIP Guests Count        : %d\n", vipGuests);
    printf("\n==================================\n");

    /* Also Save to file */
    FILE *fp = fopen(REPORT_FILE, "w");
    if (fp) {
        fprintf(fp, "========== GUESTGRID EVENT REPORT ==========\n\n");
        fprintf(fp, "Total Registered Guests : %d\n", activeGuests);
        fprintf(fp, "Total Checked-in        : %d\n", arrivedGuests);
        fprintf(fp, "Pending Arrivals        : %d\n\n", pendingArrivals);
        fprintf(fp, "Total Tables            : %d\n", tableCount);
        fprintf(fp, "Total Seating Capacity  : %d\n", totalCap);
        fprintf(fp, "Occupied Seats          : %d\n", totalOcc);
        fprintf(fp, "Available Seats         : %d\n\n", availableSeatsCount);
        fprintf(fp, "Attendance Percentage   : %.1f%%\n", attendPercent);
        fprintf(fp, "Venue Occupancy Rate    : %.1f%%\n", occPercent);
        fprintf(fp, "VIP Guests Count        : %d\n\n", vipGuests);
        fprintf(fp, "--------------------------------------------\n");
        fprintf(fp, "TABLE-WISE BREAKDOWN:\n");
        for (int i = 0; i < tableCount; i++) {
            int occ = getTableOccupancy(tables[i].tableNumber);
            fprintf(fp, "Table %d (%s): Capacity %d | Occupied %d | Available %d\n",
                    tables[i].tableNumber, tables[i].label, tables[i].capacity, occ, tables[i].capacity - occ);
        }
        fprintf(fp, "============================================\n");
        fclose(fp);
        printf("[INFO] Full report successfully exported to '%s'\n", REPORT_FILE);
    }

    pauseConsole();
}

/* Add Table */
void addTable(void) {
    if (tableCount >= MAX_TABLES) {
        printf("[ERROR] Max table limit reached.\n");
        pauseConsole();
        return;
    }

    Table newTable;
    printf("\nEnter Table Number: ");
    scanf("%d", &newTable.tableNumber);

    if (findTableIndex(newTable.tableNumber) != -1) {
        printf("[ERROR] Table %d already exists.\n", newTable.tableNumber);
        pauseConsole();
        return;
    }

    printf("Enter Seating Capacity (Seats, e.g. 8): ");
    scanf("%d", &newTable.capacity);

    printf("Enter Table Label/Zone (e.g. VIP Front, Hall): ");
    while (getchar() != '\n');
    fgets(newTable.label, sizeof(newTable.label), stdin);
    trimNewline(newTable.label);

    tables[tableCount++] = newTable;
    printf("\nSUCCESS: Table %d added with capacity %d.\n", newTable.tableNumber, newTable.capacity);
    pauseConsole();
}

/* File Handling: Save and Load */
void saveGuests(void) {
    FILE *fp = fopen(DATA_FILE, "w");
    if (!fp) return;

    fprintf(fp, "%d %d\n", guestCount, tableCount);

    /* Save Tables */
    for (int i = 0; i < tableCount; i++) {
        fprintf(fp, "%d %d %s\n", tables[i].tableNumber, tables[i].capacity,
                strlen(tables[i].label) > 0 ? tables[i].label : "General");
    }

    /* Save Guests */
    for (int i = 0; i < guestCount; i++) {
        fprintf(fp, "%s|%s|%s|%s|%d|%d|%s|%d|%s|%d\n",
                guests[i].guestId,
                guests[i].name,
                guests[i].phone,
                guests[i].group,
                guests[i].tableNumber,
                guests[i].checkedIn ? 1 : 0,
                guests[i].checkInTime,
                guests[i].isVIP ? 1 : 0,
                guests[i].specialReq,
                guests[i].status);
    }

    fclose(fp);
}

void loadGuests(void) {
    FILE *fp = fopen(DATA_FILE, "r");
    if (!fp) return;

    if (fscanf(fp, "%d %d\n", &guestCount, &tableCount) != 2) {
        fclose(fp);
        return;
    }

    for (int i = 0; i < tableCount; i++) {
        fscanf(fp, "%d %d %s\n", &tables[i].tableNumber, &tables[i].capacity, tables[i].label);
    }

    for (int i = 0; i < guestCount; i++) {
        char line[512];
        if (fgets(line, sizeof(line), fp)) {
            trimNewline(line);
            char *token = strtok(line, "|");
            if (token) strcpy(guests[i].guestId, token);

            token = strtok(NULL, "|");
            if (token) strcpy(guests[i].name, token);

            token = strtok(NULL, "|");
            if (token) strcpy(guests[i].phone, token);

            token = strtok(NULL, "|");
            if (token) strcpy(guests[i].group, token);

            token = strtok(NULL, "|");
            if (token) guests[i].tableNumber = atoi(token);

            token = strtok(NULL, "|");
            if (token) guests[i].checkedIn = (atoi(token) == 1);

            token = strtok(NULL, "|");
            if (token) strcpy(guests[i].checkInTime, token);

            token = strtok(NULL, "|");
            if (token) guests[i].isVIP = (atoi(token) == 1);

            token = strtok(NULL, "|");
            if (token) strcpy(guests[i].specialReq, token);

            token = strtok(NULL, "|");
            if (token) guests[i].status = atoi(token);
        }
    }

    fclose(fp);
}

/* Seed Demo Data */
void seedDemoData(void) {
    tableCount = 0;
    tables[tableCount++] = (Table){1, 8, "VIP & Family Section"};
    tables[tableCount++] = (Table){2, 8, "Main Banquet Hall"};
    tables[tableCount++] = (Table){3, 8, "Main Banquet Hall"};
    tables[tableCount++] = (Table){4, 8, "Courtyard Terrace"};

    guestCount = 0;
    /* Sharma Family */
    guests[guestCount++] = (Guest){"G001", "Rahul Sharma", "9876543210", "Sharma Family", 1, true, "06:30 PM", true, "Vegetarian", 1};
    guests[guestCount++] = (Guest){"G002", "Priya Sharma", "9876543211", "Sharma Family", 1, true, "06:30 PM", true, "Vegetarian", 1};
    guests[guestCount++] = (Guest){"G003", "Amit Sharma", "9876543212", "Sharma Family", 1, false, "Pending", false, "", 1};
    guests[guestCount++] = (Guest){"G004", "Sneha Sharma", "9876543213", "Sharma Family", 1, false, "Pending", false, "", 1};

    /* Friends Group */
    guests[guestCount++] = (Guest){"G005", "Kiran Patel", "9876543214", "Friends Group", 2, true, "07:15 PM", false, "", 1};
    guests[guestCount++] = (Guest){"G006", "Arjun Verma", "9876543215", "Friends Group", 2, false, "Pending", false, "Gluten free", 1};

    saveGuests();
    printf("\nSUCCESS: Placement demo data loaded (4 tables, 6 guests, Sharma Family clustered).\n");
    pauseConsole();
}

/* Main Application Menu */
int main(void) {
    loadGuests();

    /* If first run, auto-seed defaults */
    if (tableCount == 0 && guestCount == 0) {
        seedDemoData();
    }

    int choice = 0;
    while (1) {
        clearScreen();
        printf("===============================================================\n");
        printf("        GUESTGRID : EVENT GUEST & TABLE SEATING MANAGER        \n");
        printf("        Category: Food, Hospitality and Events Foundation      \n");
        printf("===============================================================\n");
        printf("  [1] Guest Registration (with Duplicate Phone Detection)      \n");
        printf("  [2] View Complete Guest Registry                             \n");
        printf("  [3] Search Guests (by ID, Name, Phone)                       \n");
        printf("  [4] Update Guest Record                                      \n");
        printf("  [5] Cancel Guest Registration                                \n");
        printf("---------------------------------------------------------------\n");
        printf("  [6] Smart Table Allocation (Capacity Safeguards)             \n");
        printf("  [7] Family / Group Management (Split-Prevention Cluster)     \n");
        printf("  [8] Real-Time Seating Availability Report                    \n");
        printf("  [9] Add Banquet Table                                        \n");
        printf("---------------------------------------------------------------\n");
        printf("  [10] Fast Guest Check-In Desk (Arrival Logging)              \n");
        printf("  [11] Generate Full Event Analytics Report (.txt export)      \n");
        printf("  [12] Reset / Reload Demo Placement Data                      \n");
        printf("  [0]  Exit GuestGrid                                          \n");
        printf("===============================================================\n");
        printf("Enter your choice [0-12]: ");

        if (scanf("%d", &choice) != 1) {
            while (getchar() != '\n');
            continue;
        }

        switch (choice) {
            case 1:  addGuest(); break;
            case 2:  displayAllGuests(); break;
            case 3:  searchGuest(); break;
            case 4:  updateGuest(); break;
            case 5:  deleteGuest(); break;
            case 6:  allocateTable(); break;
            case 7:  allocateGroup(); break;
            case 8:  availableSeats(); break;
            case 9:  addTable(); break;
            case 10: checkInGuest(); break;
            case 11: generateReport(); break;
            case 12: seedDemoData(); break;
            case 0:
                saveGuests();
                printf("\nAll guest records saved. Exiting GuestGrid. Goodbye!\n");
                return 0;
            default:
                printf("\nInvalid option. Please enter a number between 0 and 12.\n");
                pauseConsole();
                break;
        }
    }

    return 0;
}
