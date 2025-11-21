"use client";

import {
	Card,
	CardBody,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { motion } from "motion/react";

const fadeInUp = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.65 },
	},
};

const fadeInUpDelayed = {
	hidden: { opacity: 0, y: 32 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.75, delay: 0.1 },
	},
};

const fadeInSoft = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5 },
	},
};

const heroHighlights = [
	{
		title: "Live Signals",
		description:
			"Monitor emerging patterns with AI-filtered alerts tailored to your sector and region.",
	},
	{
		title: "Scenario Builder",
		description:
			"Model outcomes faster with reusable templates and automated dataset enrichment.",
	},
];

const collaborationHighlights = [
	{
		title: "Shared dashboards",
		description: "Deliver weekly snapshots with stakeholder-specific views.",
	},
	{
		title: "Automation recipes",
		description:
			"Trigger alerts, send summaries, and sync notes with the tools you already use.",
	},
];

export default function Home() {
	return (
		<main className="bg-background text-primary-text">
			<section className="mx-auto max-w-screen px-(--space-4) pb-(--space-6) pt-(--space-3) sm:px-(--space-6) sm:pt-(--space-4) lg:px-(--space-8) lg:pb-(--space-8) lg:pt-(--space-5)">
				<div className="grid gap-(--space-4) lg:grid-cols-[420px_1fr]">
					<aside className="grid gap-(--space-4) lg:sticky lg:top-4 lg:h-[calc(100svh-2rem)]">
						<motion.div
							className="flex h-full"
							variants={fadeInUp}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.4 }}
						>
							<Card className="h-full justify-between">
								<CardHeader>
									<CardTitle>Create your SmartTrend account</CardTitle>
									<CardDescription>
										Register to unlock AI-driven trend insights, personalized alerts, and
										collaborative workspaces for your projects.
									</CardDescription>
								</CardHeader>
								<CardBody>
									<ul className="space-y-2 text-sm text-secondary-text">
										<li>• Build data-backed forecasts with ease.</li>
										<li>• Track market signals as soon as they surface.</li>
										<li>• Share dashboards with your entire team.</li>
									</ul>
								</CardBody>
								<CardFooter className="flex items-center justify-between gap-4 pt-(--space-2) text-secondary-text">
									<span className="text-xs uppercase tracking-wide">New to SmartTrend?</span>
									<button className="rounded-full bg-background px-5 py-2 text-sm font-semibold text-brand-text transition-colors hover:bg-background/80">
										Register
									</button>
								</CardFooter>
							</Card>
						</motion.div>

						<motion.div
							className="flex h-full"
							variants={fadeInUpDelayed}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.4 }}
						>
							<Card className="h-full justify-between">
								<CardHeader>
									<CardTitle>Welcome back</CardTitle>
									<CardDescription>
										Sign in to jump straight into your active forecasts and briefings.
									</CardDescription>
								</CardHeader>
								<CardBody>
									<div className="flex flex-col gap-(--space-2) text-sm text-secondary-text">
										<span>Single sign-on available for enterprise accounts.</span>
										<span>Need help? Contact your workspace admin.</span>
									</div>
								</CardBody>
								<CardFooter className="flex items-center justify-between gap-4 pt-(--space-2) text-secondary-text">
									<span className="text-xs uppercase tracking-wide">Returning user</span>
									<button className="rounded-full border border-background/20 px-5 py-2 text-sm font-semibold text-brand-text transition-colors hover:border-background/40 hover:bg-background/10">
										Sign in
									</button>
								</CardFooter>
							</Card>
						</motion.div>
					</aside>

					<div className="flex h-full flex-col gap-(--space-4) rounded-[28px] bg-background/40 p-(--space-3) lg:h-[calc(100svh-2rem)] lg:overflow-y-auto lg:pr-(--space-2) lg:[scrollbar-gutter:stable]">
						<motion.div
							className="flex flex-1 overflow-visible"
							initial={{ opacity: 0, y: 32 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.4 }}
							transition={{ duration: 0.55 }}
						>
							<Card className="flex min-h-[calc(100vh-3rem)] flex-col justify-between">
								<CardHeader className="items-end text-right">
									<span className="rounded-full bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-text opacity-80">
										Intelligent market monitoring
									</span>
									<CardTitle className="text-4xl font-bold leading-tight text-brand-text">
										Welcome to SmartTrend
									</CardTitle>
									<CardDescription className="max-w-xl self-end text-lg text-secondary-text text-right">
										Stay ahead of the curve with real-time trend detection, automated analysis, and collaborative reporting.
									</CardDescription>
								</CardHeader>
								<CardBody className="gap-(--space-5) items-end text-right">
									<motion.div
										className="grid w-full gap-6 md:grid-cols-2"
										variants={fadeInSoft}
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true, amount: 0.4 }}
									>
										{heroHighlights.map((item) => (
											<div key={item.title} className="rounded-2xl bg-background/10 p-6 text-right">
												<h4 className="text-lg font-semibold text-brand-text">{item.title}</h4>
												<p className="mt-2 text-sm text-secondary-text">{item.description}</p>
											</div>
										))}
									</motion.div>
									<motion.div
										className="flex w-full flex-col items-end gap-(--space-3) md:flex-row md:justify-end"
										variants={fadeInSoft}
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true, amount: 0.4 }}
									>
										<button className="rounded-full bg-background px-6 py-3 text-sm font-semibold text-brand-text transition-transform hover:-translate-y-0.5">
											Explore the platform
										</button>
										<button className="rounded-full border border-background/20 px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-background/40 hover:bg-background/10">
											Watch a demo
										</button>
									</motion.div>
								</CardBody>
								<CardFooter className="flex flex-col items-end justify-end gap-(--space-1) border-0 text-xs uppercase tracking-wide text-secondary-text md:flex-row md:gap-(--space-3)">
									<span>Powered by adaptive data pipelines</span>
									<span>Insights refreshed every 15 minutes</span>
								</CardFooter>
							</Card>
						</motion.div>

						<motion.div
							className="flex flex-none overflow-visible pb-(--space-4)"
							initial={{ opacity: 0, y: 48 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.6, delay: 0.15 }}
						>
							<Card className="flex h-full flex-col justify-between bg-foreground/90">
								<CardHeader className="items-end text-right">
									<span className="rounded-full bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-text opacity-80">
										Collaboration in focus
									</span>
									<CardTitle className="text-3xl font-semibold leading-tight text-brand-text">
										Bring your team into every forecast
									</CardTitle>
									<CardDescription className="max-w-xl self-end text-lg text-secondary-text text-right">
										Launch shared workspaces, invite stakeholders, and annotate signals together with live commenting and version history.
									</CardDescription>
								</CardHeader>
								<CardBody className="gap-(--space-4) items-end text-right">
									<motion.div
										className="grid w-full gap-4 md:grid-cols-2"
										variants={fadeInSoft}
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true, amount: 0.3 }}
									>
										{collaborationHighlights.map((item) => (
											<div key={item.title} className="rounded-2xl bg-background/10 p-6 text-right">
												<h4 className="text-lg font-semibold text-brand-text">{item.title}</h4>
												<p className="mt-2 text-sm text-secondary-text">{item.description}</p>
											</div>
										))}
									</motion.div>
									<motion.div
										className="flex w-full flex-col items-end gap-(--space-3) md:flex-row md:justify-end"
										variants={fadeInSoft}
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true, amount: 0.3 }}
									>
										<button className="rounded-full bg-background px-6 py-3 text-sm font-semibold text-brand-text transition-transform hover:-translate-y-0.5">
											Explore collaboration tools
										</button>
										<button className="rounded-full border border-background/20 px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-background/40 hover:bg-background/10">
											Book a walkthrough
										</button>
									</motion.div>
								</CardBody>
								<CardFooter className="flex flex-col items-end justify-end gap-(--space-1) border-0 text-xs uppercase tracking-wide text-secondary-text md:flex-row md:gap-(--space-3)">
									<span>Limitless seats for enterprise plans</span>
									<span>Syncs with Slack, Teams, and email</span>
								</CardFooter>
							</Card>
						</motion.div>
					</div>
				</div>
			</section>
		</main>
	);
}
