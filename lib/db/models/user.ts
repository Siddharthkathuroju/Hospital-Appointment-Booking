import { Schema, model, models } from "mongoose"

export interface IUser {
  _id: string
  email: string
  password: string
  name: string
  role: "patient" | "doctor" | "admin"
  isApproved: boolean
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: function (this: IUser) {
        return this.role !== "doctor"
      },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export const User = models.User || model<IUser>("User", userSchema)
