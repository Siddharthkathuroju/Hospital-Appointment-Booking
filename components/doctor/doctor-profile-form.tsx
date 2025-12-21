"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Activity, LogOut, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DoctorProfileForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    experience: "",
    consultationFee: "",
    qualifications: [] as string[],
    bio: "",
    phoneNumber: "",
    address: "",
  })
  const [newQualification, setNewQualification] = useState("")
  const [availableSlots, setAvailableSlots] = useState<{ day: string; startTime: string; endTime: string }[]>([])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/doctor/profile")
      if (!res.ok) throw new Error("Failed to fetch profile")
      const data = await res.json()

      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        specialization: data.profile.specialization || "",
        experience: data.profile.experience?.toString() || "",
        consultationFee: data.profile.consultationFee?.toString() || "",
        qualifications: data.profile.qualifications || [],
        bio: data.profile.bio || "",
        phoneNumber: data.profile.phoneNumber || "",
        address: data.profile.address || "",
      })

      setAvailableSlots(data.profile.availableSlots || [])
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, newQualification.trim()],
      })
      setNewQualification("")
    }
  }

  const handleRemoveQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    })
  }

  const handleAddSlot = () => {
    setAvailableSlots([...availableSlots, { day: "Monday", startTime: "09:00 AM", endTime: "10:00 AM" }])
  }

  const handleRemoveSlot = (index: number) => {
    setAvailableSlots(availableSlots.filter((_, i) => i !== index))
  }

  const handleSlotChange = (index: number, field: string, value: string) => {
    const newSlots = [...availableSlots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setAvailableSlots(newSlots)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          specialization: formData.specialization,
          experience: Number.parseInt(formData.experience) || 0,
          consultationFee: Number.parseInt(formData.consultationFee) || 0,
          qualifications: formData.qualifications,
          bio: formData.bio,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          availableSlots,
        }),
      })

      if (!res.ok) throw new Error("Failed to update profile")

      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/doctor" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-2xl font-semibold text-foreground">HealthCare</span>
            </Link>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your contact and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} disabled />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your medical expertise and credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="e.g., Cardiologist"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Qualifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add qualification"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddQualification())}
                  />
                  <Button type="button" onClick={handleAddQualification}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.qualifications.map((qual, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {qual}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveQualification(idx)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell patients about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>Set your weekly availability for appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableSlots.map((slot, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Day</Label>
                    <Input
                      placeholder="Monday"
                      value={slot.day}
                      onChange={(e) => handleSlotChange(idx, "day", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      placeholder="09:00 AM"
                      value={slot.startTime}
                      onChange={(e) => handleSlotChange(idx, "startTime", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>End Time</Label>
                    <Input
                      placeholder="10:00 AM"
                      value={slot.endTime}
                      onChange={(e) => handleSlotChange(idx, "endTime", e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveSlot(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddSlot}>
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/doctor")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
