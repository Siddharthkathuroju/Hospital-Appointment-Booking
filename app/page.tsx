import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Shield, UserCheck, Activity, Stethoscope } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">HealthCare</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Your Health, Our Priority
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Book appointments with top doctors, manage your health records, and get the care you deserve - all in one
            place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=patient">
              <Button size="lg" className="w-full sm:w-auto">
                Book an Appointment
              </Button>
            </Link>
            <Link href="/register?role=doctor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Join as Doctor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>Book appointments with your preferred doctors at your convenience</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>Your medical records are encrypted and kept completely confidential</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <UserCheck className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Verified Doctors</CardTitle>
                <CardDescription>All doctors are verified professionals with proven credentials</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-lg mb-2">Create Account</h3>
            <p className="text-muted-foreground">Sign up as a patient or doctor in minutes</p>
          </div>

          <div className="text-center">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2">Find Your Doctor</h3>
            <p className="text-muted-foreground">Search by specialization and availability</p>
          </div>

          <div className="text-center">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2">Get Care</h3>
            <p className="text-muted-foreground">Attend appointments and manage your health</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <Stethoscope className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of patients and doctors who trust us for their healthcare needs
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 HealthCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
