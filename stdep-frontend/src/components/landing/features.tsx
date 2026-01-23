import { motion } from "motion/react"

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

export function Features() {
  return (
    <div className="ml-[30%] min-w-0 h-screen p-4 pl-0">
      <div className="flex flex-col gap-4">
        {features.map((feature, index) => (
          <section
            key={feature.title}
            className="h-[calc(100vh-2rem)] flex-shrink-0"
          >
            <div className="bg-card rounded-2xl w-full h-full flex flex-col items-center justify-center p-8 lg:p-16 shadow-sm border border-border relative">
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
                    <motion.div
                        className="text-xl"
                        animate={{ y: [0, 6, 0] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.6,
                            ease: "easeInOut",
                        }}
                    >
                        ↓
                    </motion.div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}