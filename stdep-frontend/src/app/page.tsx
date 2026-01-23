import { Sidebar } from "@/components/landing/sidebar"
import { FeatureCards } from "@/components/landing/feature-cards"

export default function LandingPage() {
  return (
    <main
      className="
        min-h-screen bg-background p-4
        grid
        grid-cols-[clamp(320px,30vw,440px)_1fr]
        gap-4
      "
    >
      <Sidebar />
      <FeatureCards />
    </main>
  )
}
