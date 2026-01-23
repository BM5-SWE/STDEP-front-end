import { Sidebar } from "@/components/landing/sidebar"
import { FeatureCards } from "@/components/landing/feature-cards"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background p-4">
      <Sidebar />
      <FeatureCards />
    </main>
  )
}
