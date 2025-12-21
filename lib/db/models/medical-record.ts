import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IMedicalRecord {
  _id: string
  patientId: mongoose.Types.ObjectId
  appointmentId?: mongoose.Types.ObjectId
  recordType: "report" | "prescription" | "diagnosis" | "lab-result"
  title: string
  description: string
  fileUrl?: string
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    recordType: {
      type: String,
      enum: ["report", "prescription", "diagnosis", "lab-result"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const MedicalRecord = models.MedicalRecord || model<IMedicalRecord>("MedicalRecord", medicalRecordSchema)
