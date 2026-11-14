// ─── Guest ────────────────────────────────────────────────────────────────────

export interface IGuest {
  _id?: string;
  guestId: string;
  name: string;
  phone: string;
  group: string;
  tableNumber: number;
  checkedIn: boolean;
  checkedInAt?: Date | string;
  isVIP: boolean;
  specialRequirements: string;
  status: "active" | "cancelled" | "waitlist";
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Table ────────────────────────────────────────────────────────────────────

export interface ITable {
  _id?: string;
  tableNumber: number;
  capacity: number;
  label: string;
  assignedGuests?: IGuest[];
  currentOccupancy?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "organizer";
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalGuests: number;
  checkedInGuests: number;
  pendingGuests: number;
  cancelledGuests: number;
  waitlistedGuests: number;
  vipGuests: number;
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
  totalCapacity: number;
  seatedGuests: number;
  unseatedGuests: number;
  checkInPercentage: number;
  capacityUtilization: number;
}

// ─── Guest Filters ────────────────────────────────────────────────────────────

export interface GuestFilters {
  search?: string;
  status?: "active" | "cancelled" | "waitlist";
  tableNumber?: number;
  group?: string;
  isVIP?: boolean;
  checkedIn?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Table with Guests (joined view) ─────────────────────────────────────────

export interface TableWithGuests extends ITable {
  guests: IGuest[];
  remainingCapacity: number;
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export interface BulkAssignPayload {
  assignments: {
    guestId: string;
    tableNumber: number;
  }[];
}

export interface BulkCheckInPayload {
  guestIds: string[];
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "organizer";
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organizer";
}
