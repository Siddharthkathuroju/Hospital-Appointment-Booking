import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IAppointment {
  _id: string
  patientId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  appointmentDate: Date
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled"
  reason: string
  notes?: string
  prescription?: string
  diagnosis?: string
  createdAt: Date
  updatedAt: Date
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    prescription: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export const Appointment = models.Appointment || model<IAppointment>("Appointment", appointmentSchema)
