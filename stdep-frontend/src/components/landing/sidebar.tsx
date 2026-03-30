import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Sidebar() {
  return (
    <aside className="h-[calc(100vh-2rem)]">
      <div className="bg-card rounded-2xl h-full p-6 shadow-sm border border-border">
        {/* Logo Section */}
        <div className="mb-8 animate-start-hidden animate-fade-in-up animation-delay-100">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            SmartTrend
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.2em]">
            BY BM5
          </p>
        </div>

        {/* About Button */}
        <div className="mb-6 animate-start-hidden animate-fade-in-up animation-delay-200">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6">
            About BM5
          </Button>
        </div>

        {/* Auth Cards */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Login Card */}
          <Card className="border border-border shadow-none animate-start-hidden animate-fade-in-up animation-delay-300">
            <CardHeader className="text-left pb-3">
              <CardTitle className="text-xl font-bold text-foreground">Log In</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you a registered PSCC Employee?<br />
                Click the Log In button below to authenticate.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border-t border-border pt-4">
                <Link href="/login">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5">
                    Log In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Register Card */}
          <Card className="border border-border shadow-none animate-start-hidden animate-fade-in-up animation-delay-400">
            <CardHeader className="text-left pb-3">
              <CardTitle className="text-xl font-bold text-primary">Register</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An access code from your admin is required.<br />
                Click the Register button below to complete registration.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground text-left">
                  Don&apos;t have an access code? Please contact your administrator for more information.
                </p>
                <Link href="/register">
                  <Button variant="outline" className="rounded-full px-8 py-5 border-border hover:bg-muted bg-transparent shrink-0">
                    Register
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 text-left animate-start-hidden animate-fade-in-up animation-delay-500">
          <p className="text-xs text-muted-foreground">
            * Your data is private and secured. Do not share your information.
          </p>
        </div>
      </div>
    </aside>
  )
}
