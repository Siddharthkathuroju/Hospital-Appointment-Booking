"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, LogOut, UserCheck, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Doctor {
  _id: string
  name: string
  email: string
  isApproved: boolean
  isBlocked: boolean
  profile?: {
    specialization?: string
    experience?: number
    qualifications?: string[]
  }
}

export function ManageDoctors() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/admin/doctors")
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

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      })

      if (!res.ok) throw new Error("Failed to approve doctor")

      toast.success("Doctor approved successfully")
      fetchDoctors()
    } catch (error) {
      toast.error("Failed to approve doctor")
    }
  }

  const handleBlock = async (id: string, block: boolean) => {
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: block }),
      })

      if (!res.ok) throw new Error(`Failed to ${block ? "block" : "unblock"} doctor`)

      toast.success(`Doctor ${block ? "blocked" : "unblocked"} successfully`)
      fetchDoctors()
    } catch (error) {
      toast.error(`Failed to ${block ? "block" : "unblock"} doctor`)
    }
  }

  const pending = doctors.filter((d) => !d.isApproved)
  const approved = doctors.filter((d) => d.isApproved && !d.isBlocked)
  const blocked = doctors.filter((d) => d.isBlocked)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-2xl font-semibold text-foreground">HealthCare Admin</span>
            </Link>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Doctors</h1>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="blocked">Blocked ({blocked.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading doctors...</p>
              </div>
            ) : pending.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">No pending doctors</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending.map((doctor) => (
                  <Card key={doctor._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            {doctor.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {doctor.email}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {doctor.profile?.specialization && (
                          <div>
                            <p className="text-sm font-medium">Specialization</p>
                            <p className="text-sm text-muted-foreground">{doctor.profile.specialization}</p>
                          </div>
                        )}
                        {doctor.profile?.experience && (
                          <div>
                            <p className="text-sm font-medium">Experience</p>
                            <p className="text-sm text-muted-foreground">{doctor.profile.experience} years</p>
                          </div>
                        )}
                        {doctor.profile?.qualifications && doctor.profile.qualifications.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Qualifications</p>
                            <div className="flex flex-wrap gap-1">
                              {doctor.profile.qualifications.map((qual, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {qual}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => handleApprove(doctor._id)} className="flex-1">
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBlock(doctor._id, true)}
                            className="flex-1"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading doctors...</p>
              </div>
            ) : approved.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">No approved doctors</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {approved.map((doctor) => (
                  <Card key={doctor._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            {doctor.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {doctor.email}
                          </CardDescription>
                        </div>
                        <Badge className="bg-secondary text-secondary-foreground">Approved</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {doctor.profile?.specialization && (
                          <div>
                            <p className="text-sm font-medium">Specialization</p>
                            <p className="text-sm text-muted-foreground">{doctor.profile.specialization}</p>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBlock(doctor._id, true)}
                          className="w-full"
                        >
                          Block Doctor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocked">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading doctors...</p>
              </div>
            ) : blocked.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">No blocked doctors</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {blocked.map((doctor) => (
                  <Card key={doctor._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            {doctor.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {doctor.email}
                          </CardDescription>
                        </div>
                        <Badge variant="destructive">Blocked</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" onClick={() => handleBlock(doctor._id, false)} className="w-full">
                        Unblock Doctor
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
