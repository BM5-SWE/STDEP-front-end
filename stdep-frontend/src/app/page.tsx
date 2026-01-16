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
		<main className="h-screen overflow-hidden bg-background text-primary-text p-0">
			<div
				className="grid h-full grid-cols-[360px_1fr] gap-4"
				style={{ minHeight: "100%" }}
			>
				{/* left section stays fixed while scrolling */}
				<section id="left-hero" className="sticky top-0 h-full">
					<div className="grid h-full grid-rows-[1.2fr_1fr_1fr_auto] gap-4">
						<motion.div initial="hidden" animate="visible" variants={fadeInUp} className="h-full">
							<Card className="justify-between p-4 h-full">
								<CardHeader className="gap-2 pb-3">
									<h1 className="text-4xl font-extrabold leading-tight text-brand-text">
										SmartTrend
									</h1>
									<p className="text-sm tracking-[0.3em] text-secondary-text uppercase">
										By BM5
									</p>
								</CardHeader>
								<CardFooter className="border-0 p-0 pt-1">
									<button className="w-full rounded-2xl bg-accent px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-95">
										About BM5
									</button>
								</CardFooter>
							</Card>
						</motion.div>
						<motion.div
							initial="hidden"
							animate="visible"
							variants={fadeInUpDelayed}
							className="h-full"
						>
							<Card className="p-5 h-full">
								<CardHeader>
									<CardTitle className="text-3xl">Log In</CardTitle>
									<CardDescription>
										Are you a registered PSCC Employee? Click the Log In button
										below to authenticate.
									</CardDescription>
								</CardHeader>
								<CardFooter className="border-0 p-0 pt-2">
									<button className="w-full rounded-2xl bg-brand-text px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-90">
										Log In
									</button>
								</CardFooter>
							</Card>
						</motion.div>
						<motion.div
							initial="hidden"
							animate="visible"
							variants={fadeInUpDelayed}
							className="h-full"
						>
							<Card className="p-5 h-full">
								<CardHeader>
									<CardTitle className="text-3xl">Register</CardTitle>
									<CardDescription>
										A 6-digit access code from your admin is required. Click the
										Register button below to complete registration.
									</CardDescription>
								</CardHeader>
								<CardFooter className="border-0 flex flex-col gap-2 p-0 pt-2">
									<button className="w-full rounded-2xl border border-brand-text px-4 py-3 text-base font-semibold text-brand-text transition hover:bg-brand-text hover:text-white">
										Register
									</button>
									<p className="text-xs text-secondary-text leading-snug">
										<span className="font-semibold text-brand-text">
											Click here for more information
										</span>
										.
									</p>
								</CardFooter>
							</Card>
						</motion.div>
						<div className="flex items-center text-[11px] leading-snug text-secondary-text">
							<span>
								* Your data is private and secured. Do not share your
								information.
							</span>
						</div>
					</div>
				</section>
				{/* right section scrolls independently */}
				<section id="right-hero" className="h-full overflow-y-auto pr-2">
					<motion.div
						className="h-full"
						initial="hidden"
						animate="visible"
						variants={fadeInUp}
					>
						<Card className="mb-6 h-full min-h-[540px] text-right justify-between px-10 py-12">
							<div className="space-y-6">
								<p className="text-sm font-medium uppercase tracking-[0.35em] text-secondary-text">
									Strategic Trend Forecasting Solutions For
								</p>
								<h1 className="text-6xl font-extrabold leading-tight text-brand-text">
									PSCC Management
								</h1>
								<p className="ml-auto max-w-2xl text-xl leading-relaxed text-primary-text">
									A centralized intelligence platform designed to help PSCC
									Management Inc. identify emerging product trends, analyze
									market shifts, and support data-driven strategic
									decision-making.
								</p>
							</div>
							<div className="flex flex-col items-center gap-2 pt-6 text-secondary-text">
								<span className="text-sm font-semibold tracking-wide">
									Scroll for more
								</span>
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
							</div>
						</Card>
					</motion.div>
					<div className="h-full space-y-4 py-6">
						{Array.from({ length: 2 }).map((_, idx) => (
							<motion.div
								key={idx}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true }}
								variants={fadeInSoft}
								className="h-full"
							>
								<Card className="h-full p-8 text-right">
									<h2 className="mb-2 text-2xl font-semibold text-brand-text">
										Insight Section {idx + 1}
									</h2>
									<p className="text-secondary-text">
										Add your detailed content here to showcase additional
										information, reports, or dashboards as users scroll.
									</p>
								</Card>
							</motion.div>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}
