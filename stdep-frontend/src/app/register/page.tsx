"use client";

import {
	Card,
	CardHeader,
	CardFooter,
	CardDescription,
} from "@/components/ui/card";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

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

export default function RegisterPage() {
	const [accessCode, setAccessCode] = useState(["", "", "", "", "", ""]);

	const handleAccessCodeChange = (index: number, value: string) => {
		// Only allow single digits
		if (value.length <= 1 && /^\d*$/.test(value)) {
			const newCode = [...accessCode];
			newCode[index] = value;
			setAccessCode(newCode);

			// Auto-focus to next input
			if (value && index < 5) {
				const nextInput = document.getElementById(`code-${index + 1}`);
				nextInput?.focus();
			}
		}
	};

	return (
		<main className="h-screen overflow-hidden bg-background text-primary-text p-0">
			<div
				className="grid h-full grid-cols-[540px_1fr] gap-4"
				style={{ minHeight: "100%" }}
			>
				{/* left section - register form */}
				<section id="left-register" className="sticky top-0 h-full">
					<div className="flex h-full flex-col gap-6">
						<motion.div initial="hidden" animate="visible" variants={fadeInUp}>
							<Link href="/" className="m-2 block">
								<h1 className="text-4xl font-extrabold leading-tight text-brand-text">
									SmartTrend
								</h1>
								<p className="text-sm tracking-[0.2em] text-secondary-text uppercase">
									By BM5
								</p>
							</Link>
						</motion.div>

						<motion.div
							initial="hidden"
							animate="visible"
							variants={fadeInUpDelayed}
							className="flex-1"
						>
							<Card className="h-full flex flex-col">
								<CardHeader className="pb-6">
									<h2 className="text-3xl font-bold text-brand-text mb-2">
										Register
									</h2>
									<CardDescription className="text-base">
										Enter your credentials below.
									</CardDescription>
								</CardHeader>

								<div className="flex-1 flex flex-col gap-4 px-6 pb-6">
									{/* Access Code Input */}
									<div className="flex flex-col gap-2">
										<label className="text-sm font-medium text-primary-text">
											Access Code
										</label>
										<div className="flex gap-2">
											{accessCode.map((digit, index) => (
												<input
													key={index}
													id={`code-${index}`}
													type="text"
													maxLength={1}
													value={digit}
													onChange={(e) =>
														handleAccessCodeChange(index, e.target.value)
													}
													className="w-12 h-12 rounded-xl border border-line/50 bg-background text-center text-base font-semibold text-primary-text placeholder:text-secondary-text focus:border-brand-text focus:outline-none focus:ring-2 focus:ring-brand-text/20"
													placeholder="0"
												/>
											))}
										</div>
									</div>

									{/* Email Input */}
									<div className="flex flex-col gap-2">
										<label
											htmlFor="email"
											className="text-sm font-medium text-primary-text"
										>
											Email
										</label>
										<input
											type="email"
											id="email"
											className="w-full rounded-xl border border-line/50 bg-background px-4 py-3 text-base text-primary-text placeholder:text-secondary-text focus:border-brand-text focus:outline-none focus:ring-2 focus:ring-brand-text/20"
											placeholder=""
										/>
									</div>

									{/* Password Input */}
									<div className="flex flex-col gap-2">
										<label
											htmlFor="password"
											className="text-sm font-medium text-primary-text"
										>
											Password
										</label>
										<input
											type="password"
											id="password"
											className="w-full rounded-xl border border-line/50 bg-background px-4 py-3 text-base text-primary-text placeholder:text-secondary-text focus:border-brand-text focus:outline-none focus:ring-2 focus:ring-brand-text/20"
											placeholder=""
										/>
									</div>

									{/* Confirm Password Input */}
									<div className="flex flex-col gap-2">
										<label
											htmlFor="confirm-password"
											className="text-sm font-medium text-primary-text"
										>
											Confirm Password
										</label>
										<input
											type="password"
											id="confirm-password"
											className="w-full rounded-xl border border-line/50 bg-background px-4 py-3 text-base text-primary-text placeholder:text-secondary-text focus:border-brand-text focus:outline-none focus:ring-2 focus:ring-brand-text/20"
											placeholder=""
										/>
									</div>

									{/* Register Button */}
									<button className="w-full rounded-2xl bg-brand-text px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-90 mt-4">
										Log In
									</button>

									{/* Help Text */}
									<p className="text-sm text-primary-text mt-2">
										<span className="font-semibold text-brand-text">
											Don't have an access code?
										</span>
										<br />
										<a
											href="#"
											className="font-semibold text-brand-text hover:underline"
										>
											Click here
										</a>{" "}
										for more information.
									</p>
								</div>
							</Card>
						</motion.div>

						<motion.div
							initial="hidden"
							animate="visible"
							variants={fadeInSoft}
						>
							<div className="text-xs leading-relaxed text-secondary-text space-y-3">
								<p>
									* Your data is private and secured. Do not share your
									information.
								</p>
								<p>
									Your information is kept private and secure. We use
									industry-standard encryption and follow best practices to
									protect your personal data. By accessing or using this site, you
									acknowledge that certain data may be collected to improve
									functionality, enhance user experience, and maintain platform
									security. We do not sell or share your information with
									third-party advertisers without your explicit consent.
								</p>
								<p>
									All content, features, and services provided on this website are
									offered "as-is" and may be subject to change at any time without
									notice. While we strive to provide accurate, up-to-date
									information, we cannot guarantee that all materials are free
									from error, interruption, or omission.
								</p>
								<p>
									Use of this website is at your own discretion and risk. We are
									not liable for any damages, losses, or disruptions arising from
									your use of or reliance on site content. External links may
									direct you to third-party websites with their own policies; we
									are not responsible for the practices or content of those
									external sites.
								</p>
								<p>
									By continuing to browse, you agree to our Terms of Service,
									Privacy Policy, and any applicable guidelines or updates. If you
									have questions about how your information is managed, please
									contact our support team.
								</p>
							</div>
						</motion.div>
					</div>
				</section>

				{/* right section - welcome message */}
				<section
					id="right-welcome"
					className="h-full overflow-y-auto pr-2"
				>
					<motion.div
						className="h-full"
						initial="hidden"
						animate="visible"
						variants={fadeInUp}
					>
						<Card className="h-full min-h-[540px] text-right justify-center px-12 py-16">
							<div className="space-y-8">
								<p className="text-sm font-medium uppercase tracking-[0.35em] text-secondary-text">
									New Users
								</p>
								<h1 className="text-7xl font-extrabold leading-tight text-brand-text">
									Get
									<br />
									Started
								</h1>
								<p className="ml-auto max-w-2xl text-xl leading-relaxed text-primary-text">
									Register to gain access to your dashboard.
								</p>
							</div>
						</Card>
					</motion.div>
				</section>
			</div>
		</main>
	);
}
