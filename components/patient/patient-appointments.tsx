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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Appointment {
  _id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  reason: string
  doctor: {
    name: string
    profile: {
      specialization: string
    }
  }
  prescription?: string
  diagnosis?: string
}

export function PatientAppointments() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/patient/appointments")
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

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/patient/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (!res.ok) throw new Error("Failed to cancel appointment")

      toast.success("Appointment cancelled")
      fetchAppointments()
    } catch (error) {
      toast.error("Failed to cancel appointment")
    }
    setCancelId(null)
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

  const upcoming = appointments.filter((a) => ["pending", "confirmed"].includes(a.status))
  const past = appointments.filter((a) => ["completed", "cancelled", "rejected"].includes(a.status))

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
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : upcoming.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  <Link href="/patient/doctors">
                    <Button>Book Appointment</Button>
                  </Link>
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
                            Dr. {appointment.doctor.name}
                          </CardTitle>
                          <CardDescription>{appointment.doctor.profile.specialization}</CardDescription>
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
                        {appointment.status === "pending" && (
                          <Button variant="destructive" size="sm" onClick={() => setCancelId(appointment._id)}>
                            Cancel Appointment
                          </Button>
                        )}
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
                            Dr. {appointment.doctor.name}
                          </CardTitle>
                          <CardDescription>{appointment.doctor.profile.specialization}</CardDescription>
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelId && handleCancel(cancelId)}>Yes, cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
