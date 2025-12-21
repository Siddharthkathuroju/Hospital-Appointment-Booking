"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"

interface Doctor {
  _id: string
  name: string
  profile: {
    specialization: string
    consultationFee: number
    availableSlots: {
      day: string
      startTime: string
      endTime: string
    }[]
  }
}

interface BookAppointmentDialogProps {
  doctor: Doctor
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BookAppointmentDialog({ doctor, open, onClose, onSuccess }: BookAppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    appointmentDate: "",
    timeSlot: "",
    reason: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.appointmentDate || !formData.timeSlot || !formData.reason) {
      toast.error("Please fill all fields")
      return
    }

    setLoading(true)

    try {
      const [startTime, endTime] = formData.timeSlot.split("-")

      const res = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor._id,
          appointmentDate: formData.appointmentDate,
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          reason: formData.reason,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment")
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return date
  })

  // Generate time slots based on doctor's availability
  const timeSlots =
    doctor.profile.availableSlots.length > 0
      ? doctor.profile.availableSlots.map((slot) => `${slot.startTime} - ${slot.endTime}`)
      : ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment with Dr. {doctor.name} ({doctor.profile.specialization})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Appointment Date</Label>
            <Select
              value={formData.appointmentDate}
              onValueChange={(value) => setFormData({ ...formData, appointmentDate: value })}
            >
              <SelectTrigger id="date">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.toISOString()} value={date.toISOString()}>
                    {format(date, "EEEE, MMMM d, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time Slot</Label>
            <Select value={formData.timeSlot} onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot, idx) => (
                  <SelectItem key={idx} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea
              id="reason"
              placeholder="Describe your symptoms or reason for consultation..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
            />
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">Consultation Fee</p>
            <p className="text-lg font-semibold">${doctor.profile.consultationFee}</p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
