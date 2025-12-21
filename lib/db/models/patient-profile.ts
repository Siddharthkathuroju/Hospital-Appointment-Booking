import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IPatientProfile {
  _id: string
  userId: mongoose.Types.ObjectId
  dateOfBirth?: Date
  gender?: string
  bloodGroup?: string
  allergies: string[]
  phoneNumber: string
  address: string
  emergencyContact: {
    name: string
    phone: string
    relation: string
  }
  createdAt: Date
  updatedAt: Date
}

const patientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bloodGroup: {
      type: String,
    },
    allergies: [
      {
        type: String,
      },
    ],
    phoneNumber: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  },
)

export const PatientProfile = models.PatientProfile || model<IPatientProfile>("PatientProfile", patientProfileSchema)
