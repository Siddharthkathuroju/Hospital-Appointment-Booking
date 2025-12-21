"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, LogOut, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Appointment {
  _id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  reason: string
  patient: {
    name: string
    email: string
  }
  prescription?: string
  diagnosis?: string
}

export function DoctorAppointments() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [prescription, setPrescription] = useState("")
  const [diagnosis, setDiagnosis] = useState("")

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/doctor/appointments")
      if (!res.ok) throw new Error("Failed to fetch appointments")
      const data = await res.json()
      setAppointments(data.appointments)
    } catch (error) {
      console.error("[v0] Error fetching appointments:", error)
      toast.error("Failed to load appointments")
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Failed to update appointment")

      toast.success(`Appointment ${status}`)
      fetchAppointments()
    } catch (error) {
      toast.error("Failed to update appointment")
    }
  }

  const handleAddNotes = async () => {
    if (!selectedAppointment) return

    try {
      const res = await fetch(`/api/doctor/appointments/${selectedAppointment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescription,
          diagnosis,
          status: "completed",
        }),
      })

      if (!res.ok) throw new Error("Failed to add notes")

      toast.success("Notes added successfully")
      setSelectedAppointment(null)
      setPrescription("")
      setDiagnosis("")
      fetchAppointments()
    } catch (error) {
      toast.error("Failed to add notes")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-secondary text-secondary-foreground"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "completed":
        return "bg-primary/10 text-primary"
      case "cancelled":
      case "rejected":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const pending = appointments.filter((a) => a.status === "pending")
  const upcoming = appointments.filter((a) => a.status === "confirmed")
  const past = appointments.filter((a) => ["completed", "rejected", "cancelled"].includes(a.status))

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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : pending.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">No pending appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {appointment.patient.name}
                          </CardTitle>
                          <CardDescription>{appointment.patient.email}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(appointment.appointmentDate), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                        <div className="pt-2">
                          <p className="text-sm font-medium mb-1">Reason</p>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleStatusChange(appointment._id, "rejected")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusChange(appointment._id, "confirmed")}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : upcoming.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">No upcoming appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcoming.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {appointment.patient.name}
                          </CardTitle>
                          <CardDescription>{appointment.patient.email}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(appointment.appointmentDate), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                        <div className="pt-2">
                          <p className="text-sm font-medium mb-1">Reason</p>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        </div>
                        <Button size="sm" onClick={() => setSelectedAppointment(appointment)}>
                          Add Prescription & Diagnosis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : past.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">No past appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {past.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {appointment.patient.name}
                          </CardTitle>
                          <CardDescription>{appointment.patient.email}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(appointment.appointmentDate), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        {appointment.diagnosis && (
                          <div className="pt-2">
                            <p className="text-sm font-medium mb-1">Diagnosis</p>
                            <p className="text-sm text-muted-foreground">{appointment.diagnosis}</p>
                          </div>
                        )}
                        {appointment.prescription && (
                          <div className="pt-2">
                            <p className="text-sm font-medium mb-1">Prescription</p>
                            <p className="text-sm text-muted-foreground">{appointment.prescription}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Notes Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Prescription & Diagnosis</DialogTitle>
            <DialogDescription>Complete the appointment with medical notes</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Enter diagnosis..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea
                id="prescription"
                placeholder="Enter prescription..."
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleAddNotes} className="flex-1">
                Save & Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
