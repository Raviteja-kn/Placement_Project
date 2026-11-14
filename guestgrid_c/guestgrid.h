/**
 * ============================================================================
 * GuestGrid - Event Guest and Table Seating Manager
 * Category: Food, Hospitality and Events Foundation
 * Programming Language: C (Standard C99 / C11)
 * ============================================================================
 */

#ifndef GUESTGRID_H
#define GUESTGRID_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

#define MAX_GUESTS 500
#define MAX_TABLES 50
#define MAX_NAME_LEN 64
#define MAX_PHONE_LEN 16
#define MAX_GROUP_LEN 48
#define MAX_NOTES_LEN 128
#define GUEST_ID_LEN 12
#define DATA_FILE "guestgrid_data.txt"
#define REPORT_FILE "guestgrid_report.txt"

/* Guest Structure */
typedef struct {
    char guestId[GUEST_ID_LEN];       /* Auto-generated: G001, G002... */
    char name[MAX_NAME_LEN];          /* Full Name */
    char phone[MAX_PHONE_LEN];        /* Unique Contact Number */
    char group[MAX_GROUP_LEN];        /* Family or Group Name */
    int tableNumber;                  /* Assigned Table (0 = Unassigned) */
    bool checkedIn;                   /* Arrival Status */
    char checkInTime[32];             /* Timestamp of check-in */
    bool isVIP;                       /* VIP Flag */
    char specialReq[MAX_NOTES_LEN];   /* Dietary / Accessibility notes */
    int status;                       /* 1: Active, 2: Waitlist, 0: Cancelled */
} Guest;

/* Table Structure */
typedef struct {
    int tableNumber;                  /* Table # (1, 2, 3...) */
    int capacity;                     /* Seating Capacity (default 8) */
    char label[MAX_GROUP_LEN];        /* Section Label (e.g. VIP Front) */
} Table;

/* System State Global Container */
extern Guest guests[MAX_GUESTS];
extern int guestCount;
extern Table tables[MAX_TABLES];
extern int tableCount;

/* Function Declarations - Core Modules */
/* 1. Guest Management */
void addGuest(void);
void updateGuest(void);
void deleteGuest(void);
void displayAllGuests(void);

/* 2. Duplicate Detection */
int checkDuplicate(const char *phone, const char *excludeGuestId);

/* 3. Guest Search */
void searchGuest(void);

/* 4. Table Management & Seating */
void allocateTable(void);
void changeTable(void);
void availableSeats(void);
void tableStatus(void);
void addTable(void);

/* 5. Family & Group Management */
void viewGroup(void);
void allocateGroup(void);

/* 6. Guest Check-In & Arrival */
void checkInGuest(void);
void attendanceReport(void);

/* 7. Reports & Analytics */
void generateReport(void);

/* 8. File Handling */
void saveGuests(void);
void loadGuests(void);

/* Helper Utilities */
void generateNextGuestId(char *outId);
void clearScreen(void);
void pauseConsole(void);
void seedDemoData(void);

#endif /* GUESTGRID_H */
