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
		<div className="h-screen grid grid-cols-2 gap-6 bg-background text-primary-text">
			{/* left section */}
			<section id="left-hero" className="flex flex-col gap-6">
				<Card className="mb-(--space-6)">
					<p>topleft</p>
				</Card>
				<Card>
					<p>bottomleft</p>
				</Card>
			</section>
			{/* right section */}
			<section id="right-hero" className="row-span-2">
				<Card>
					<p>right</p>
				</Card>
			</section>
		</div>
	);
}
