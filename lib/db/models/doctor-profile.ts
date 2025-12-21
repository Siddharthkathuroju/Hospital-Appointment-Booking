import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IDoctorProfile {
  _id: string
  userId: mongoose.Types.ObjectId
  specialization: string
  qualifications: string[]
  experience: number
  consultationFee: number
  availableSlots: {
    day: string
    startTime: string
    endTime: string
  }[]
  bio: string
  phoneNumber: string
  address: string
  createdAt: Date
  updatedAt: Date
}

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    qualifications: [
      {
        type: String,
      },
    ],
    experience: {
      type: Number,
      required: true,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export const DoctorProfile = models.DoctorProfile || model<IDoctorProfile>("DoctorProfile", doctorProfileSchema)
