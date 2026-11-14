import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITableDocument extends Document {
  tableNumber: number;
  capacity: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITableDocument>(
  {
    tableNumber: {
      type: Number,
      required: [true, "Table number is required"],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      default: 8,
      min: [1, "Capacity must be at least 1"],
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
TableSchema.index({ tableNumber: 1 });

const Table: Model<ITableDocument> =
  mongoose.models.Table ||
  mongoose.model<ITableDocument>("Table", TableSchema);

export default Table;
