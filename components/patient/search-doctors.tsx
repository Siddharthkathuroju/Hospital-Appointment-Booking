"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Activity, LogOut, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BookAppointmentDialog } from "./book-appointment-dialog"

interface Doctor {
  _id: string
  name: string
  email: string
  profile: {
    specialization: string
    experience: number
    consultationFee: number
    qualifications: string[]
    availableSlots: any[]
  }
}

export function SearchDoctors() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialization, setSpecialization] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/patient/doctors")
      if (!res.ok) throw new Error("Failed to fetch doctors")
      const data = await res.json()
      setDoctors(data.doctors)
    } catch (error) {
      console.error("[v0] Error fetching doctors:", error)
      toast.error("Failed to load doctors")
    } finally {
      setLoading(false)
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

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = specialization === "all" || doctor.profile.specialization === specialization
    return matchesSearch && matchesSpecialization
  })

  const specializations = Array.from(new Set(doctors.map((d) => d.profile.specialization)))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/patient" className="flex items-center gap-2">
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Doctors</h1>
          <p className="text-muted-foreground">Search for doctors by name or specialization</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doctors List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No doctors found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{doctor.name}</CardTitle>
                      <CardDescription>{doctor.profile.specialization}</CardDescription>
                    </div>
                    <Badge variant="secondary">{doctor.profile.experience} yrs exp</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Qualifications</p>
                      <div className="flex flex-wrap gap-1">
                        {doctor.profile.qualifications.slice(0, 3).map((qual, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Consultation Fee</p>
                        <p className="text-lg font-semibold">${doctor.profile.consultationFee}</p>
                      </div>
                      <Button onClick={() => setSelectedDoctor(doctor)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedDoctor && (
        <BookAppointmentDialog
          doctor={selectedDoctor}
          open={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onSuccess={() => {
            setSelectedDoctor(null)
            toast.success("Appointment booked successfully!")
          }}
        />
      )}
    </div>
  )
}
