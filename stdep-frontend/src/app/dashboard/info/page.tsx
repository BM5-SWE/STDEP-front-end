"use client";
import React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function InfoPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-background via-muted/60 to-background">
			<DashboardSidebar />
			<div className="ml-60 p-6 animate-fade-in-up">
				<div className="max-w-2xl mx-auto">
					<div className="flex items-center gap-3 mb-6">
						<span className="bg-primary/10 p-2 rounded-xl">
							<svg
								width="24"
								height="24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-help-circle text-primary"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3" />
								<path d="M12 17h.01" />
							</svg>
						</span>
						<h1 className="text-2xl font-bold tracking-tight">
							About, FAQ & Policies
						</h1>
					</div>
					<section className="mb-8 rounded-2xl bg-card/80 border border-border shadow-sm p-6">
						<h2 className="text-xl font-semibold mb-2">About TrendPulse</h2>
						<p className="text-muted-foreground mb-2">
							TrendPulse is a smart trend-driven e-commerce analytics platform.
							It helps you discover market trends, track competitor insights,
							and make data-driven decisions for your business.
						</p>
					</section>
					<section className="mb-8 rounded-2xl bg-card/80 border border-border shadow-sm p-6">
						<h2 className="text-xl font-semibold mb-2">
							Frequently Asked Questions
						</h2>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								<strong>Is my data secure?</strong> Yes, your data is encrypted
								and never shared with third parties.
							</li>
							<li>
								<strong>How do I save products?</strong> Use the save button on
								any product card in the dashboard.
							</li>
							<li>
								<strong>Can I delete my account?</strong> Yes, visit the
								Settings page to delete your account at any time.
							</li>
						</ul>
					</section>
					<section className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
						<h2 className="text-xl font-semibold mb-2">Policies</h2>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								<strong>Privacy Policy:</strong> We respect your privacy and
								only collect data necessary for analytics and personalization.
							</li>
							<li>
								<strong>Terms of Service:</strong> Use of this platform is
								subject to our terms and conditions. Misuse may result in
								account suspension.
							</li>
						</ul>
					</section>
				</div>
			</div>
		</main>
	);
}
