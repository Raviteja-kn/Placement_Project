import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGuestDocument extends Document {
  guestId: string;
  name: string;
  phone: string;
  group: string;
  tableNumber: number;
  checkedIn: boolean;
  checkedInAt?: Date;
  isVIP: boolean;
  specialRequirements: string;
  status: "active" | "cancelled" | "waitlist";
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuestDocument>(
  {
    guestId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    group: {
      type: String,
      default: "",
      trim: true,
    },
    tableNumber: {
      type: Number,
      default: 0,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    isVIP: {
      type: Boolean,
      default: false,
    },
    specialRequirements: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "waitlist"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to auto-generate guestId in the format G001, G002, etc.
 * Finds the max existing guestId and increments by 1.
 */
GuestSchema.pre("save", async function () {
  if (this.guestId) {
    return;
  }

  const GuestModel = mongoose.model<IGuestDocument>("Guest");

  const lastGuest = await GuestModel.findOne({}, { guestId: 1 })
    .sort({ guestId: -1 })
    .lean();

  let nextNumber = 1;

  if (lastGuest && lastGuest.guestId) {
    const match = lastGuest.guestId.match(/^G(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  this.guestId = `G${String(nextNumber).padStart(3, "0")}`;
});

// Index for fast lookups
GuestSchema.index({ tableNumber: 1 });
GuestSchema.index({ status: 1 });
GuestSchema.index({ group: 1 });
GuestSchema.index({ checkedIn: 1 });

const Guest: Model<IGuestDocument> =
  mongoose.models.Guest || mongoose.model<IGuestDocument>("Guest", GuestSchema);

export default Guest;
