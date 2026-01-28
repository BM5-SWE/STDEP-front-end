import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <DashboardContent />
    </main>
  )
}
