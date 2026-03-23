import { ChevronDown } from "lucide-react"

const features = [
  {
    subtitle: "STRATEGIC TREND FORECASTING SOLUTIONS FOR",
    title: "PSCC Management",
    description: "A centralized intelligence platform designed to help PSCC Management Inc. identify emerging product trends, analyze market shifts, and support data-driven strategic decision-making.",
  },
  {
    subtitle: "REAL-TIME ANALYTICS AND INSIGHTS FOR",
    title: "Market Intelligence",
    description: "Track emerging trends across thousands of e-commerce platforms. Our AI-powered engine analyzes millions of data points to surface opportunities before your competitors.",
  },
  {
    subtitle: "COMPETITIVE ANALYSIS SOLUTIONS FOR",
    title: "Business Growth",
    description: "Monitor pricing strategies, product launches, and market positioning. Stay one step ahead with actionable insights delivered directly to your dashboard.",
  },
  {
    subtitle: "PREDICTIVE MODELING AND FORECASTING FOR",
    title: "Demand Planning",
    description: "Predict future demand with machine learning models trained on historical sales data, seasonality patterns, and external factors like economic indicators.",
  },
]

export function FeatureCards() {
  return (
    <div className="h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex flex-col gap-4">
        {features.map((feature, index) => (
          <section
            key={feature.title}
            className="h-[calc(100vh-2rem)] shrink-0"
          >
            <div 
              className="bg-card rounded-2xl w-full h-full flex flex-col items-center justify-center p-8 lg:p-16 shadow-sm border border-border relative animate-slide-in-right"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="max-w-2xl text-center">
                {/* Subtitle */}
                <p className="text-sm text-muted-foreground uppercase tracking-[0.25em] mb-6">
                  {feature.subtitle}
                </p>
                
                {/* Title */}
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-8 text-balance">
                  {feature.title}
                </h2>
                
                {/* Description */}
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty">
                  {feature.description}
                </p>
              </div>
              
              {/* Scroll Indicator - only on first card */}
              {index === 0 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="text-xs uppercase tracking-[0.2em]">Scroll for more</span>
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
