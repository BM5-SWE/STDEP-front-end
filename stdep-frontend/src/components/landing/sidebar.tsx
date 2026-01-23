"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "motion/react"

type AuthMode = "login" | "register" | null

export function Sidebar() {
  const [activeCard, setActiveCard] = useState<AuthMode>(null)

  return (
    <aside className="fixed left-0 top-0 h-screen w-[30%] min-w-[340px] max-w-[440px] flex flex-col p-4">
      <div className="bg-card rounded-2xl flex flex-col h-full p-6 shadow-sm border border-border">
        {/* Logo Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            SmartTrend
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.2em]">
            BY BM5
          </p>
        </div>

        {/* About Button */}
        <div className="mb-6">
          <motion.button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6">
            About BM5
          </motion.button>
        </div>

        {/* Auth Cards */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Login Card */}
          <Card 
            className={`border shadow-none cursor-pointer transition-all duration-300 ${
              activeCard === "login" 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-muted-foreground/30"
            }`}
            onClick={() => setActiveCard(activeCard === "login" ? null : "login")}
          >
            <CardHeader className="text-left pb-2">
              <CardTitle className="text-xl font-bold text-foreground">Log In</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you a registered PSCC Employee?<br />
                Click the Log In button below to authenticate.
              </p>
            </CardHeader>
            
            {activeCard === "login" && (
              <CardDescription className="pt-2" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <motion.label htmlFor="email">Email</motion.label>
                    <motion.input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <motion.label htmlFor="password">Password</motion.label>
                    <motion.input 
                      id="password" 
                      type="password" 
                      placeholder="Enter your password" 
                      className="rounded-lg"
                    />  
                  </div>
                  <motion.button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5">
                    Log In
                  </motion.button>
                </div>
              </CardDescription>
            )}
          </Card>

          {/* Register Card */}
          <Card 
            className={`border shadow-none cursor-pointer transition-all duration-300 ${
              activeCard === "register" 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-muted-foreground/30"
            }`}
            onClick={() => setActiveCard(activeCard === "register" ? null : "register")}
          >
            <CardHeader className="text-left pb-2">
              <CardTitle className="text-xl font-bold text-primary">Register</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A 6-digit access code from your admin required.<br />
                Click the Register button below to complete registration.
              </p>
            </CardHeader>
            
            {activeCard === "register" && (
              <CardDescription className="pt-2" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <motion.label htmlFor="reg-email">Email</motion.label>
                    <motion.input 
                      id="reg-email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <motion.label htmlFor="access-code">Access Code</motion.label>
                    <motion.input 
                      id="access-code" 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      maxLength={6}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <motion.label htmlFor="reg-password">Password</motion.label>
                    <motion.input 
                      id="reg-password" 
                      type="password" 
                      placeholder="Create a password" 
                      className="rounded-lg"
                    />
                  </div>
                  <motion.button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5">
                    Register
                  </motion.button>
                  <p className="text-xs text-muted-foreground text-left">
                    {"Don't have an access code? "}
                    <span className="underline cursor-pointer hover:text-foreground">
                      Click here
                    </span>
                    {" for more information"}
                  </p>
                </div>
              </CardDescription>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 text-left">
          <p className="text-xs text-muted-foreground">
            * Your data is private and secured. Do not share your information.
          </p>
        </div>
      </div>
    </aside>
  )
}