"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const router = useRouter();

	// Use env variable if available, fallback to hardcoded URL
	const API_BASE =
		process.env.NEXT_PUBLIC_API_BASE || "http://<EC2-PUBLIC-IP>:8000";

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password,
				}),
			});
			let data;
			try {
				data = await res.json();
			} catch (jsonErr) {
				data = {};
			}
			if (!res.ok) {
				setError(
					data && typeof data.detail === "string"
						? data.detail
						: "Login failed",
				);
			} else {
				// Store tokens in localStorage (or cookies if you want more security)
				if (data.access_token && data.refresh_token) {
					localStorage.setItem("access_token", data.access_token);
					localStorage.setItem("refresh_token", data.refresh_token);
				}
				setSuccess("Login successful!");
				// Redirect to dashboard after a short delay (or immediately)
				setTimeout(() => {
					router.push("/dashboard");
				}, 500);
			}
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-background p-4">
			<div className="flex gap-4 h-[calc(100vh-2rem)]">
				{/* Left Side - Login Form */}
				<aside className="w-[30%] min-w-[340px] max-w-[440px] flex flex-col">
					<div className="bg-card rounded-2xl flex flex-col h-full p-6 shadow-sm border border-border animate-slide-in-left">
						{/* Logo Section */}
						<div className="mb-8 animate-start-hidden animate-fade-in-up animation-delay-100">
							<Link href="/">
								<h1 className="text-3xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">
									SmartTrend
								</h1>
							</Link>
							<p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.2em]">
								BY BM5
							</p>
						</div>

						{/* Login Card */}
						<Card className="border border-border shadow-none flex-1 flex flex-col animate-start-hidden animate-fade-in-up animation-delay-200">
							<CardHeader className="text-left pb-3">
								<CardTitle className="text-xl font-bold text-foreground">
									Log In
								</CardTitle>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Enter your credentials below to access your account.
								</p>
							</CardHeader>
							<CardContent className="pt-0 flex-1 flex flex-col">
								<form
									className="border-t border-border pt-4 flex-1 flex flex-col"
									onSubmit={handleLogin}
								>
									<div className="space-y-4 flex-1">
										<div className="space-y-2 text-left">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
												className="rounded-lg"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<div className="space-y-2 text-left">
											<Label htmlFor="password">Password</Label>
											<Input
												id="password"
												type="password"
												placeholder="Enter your password"
												className="rounded-lg"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
											/>
										</div>
									</div>
									<div className="mt-auto pt-6">
										<Button
											className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5"
											type="submit"
											disabled={loading}
										>
											{loading ? "Logging in..." : "Log In"}
										</Button>
										{error && (
											<p className="text-xs text-red-500 text-center mt-2">
												{error}
											</p>
										)}
										{success && (
											<p className="text-xs text-green-600 text-center mt-2">
												{success}
											</p>
										)}
										<p className="text-xs text-muted-foreground text-center mt-4">
											{"Don't have an account? "}
											<Link
												href="/register"
												className="underline hover:text-foreground"
											>
												Register here
											</Link>
										</p>
									</div>
								</form>
							</CardContent>
						</Card>

						{/* Footer */}
						<div className="mt-auto pt-6 text-left animate-start-hidden animate-fade-in-up animation-delay-300">
							<p className="text-xs text-muted-foreground">
								* Your data is private and secured. Do not share your
								information.
							</p>
						</div>
					</div>
				</aside>

				{/* Right Side - Welcome Message */}
				<section className="flex-1">
					<div className="bg-card rounded-2xl h-full p-8 shadow-sm border border-border flex flex-col items-center justify-center text-center animate-slide-in-right">
						<p className="text-sm text-muted-foreground uppercase tracking-[0.3em] mb-4">
							WELCOME BACK TO
						</p>
						<h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
							SmartTrend Analytics
						</h2>
						<p className="text-lg text-muted-foreground max-w-xl leading-relaxed text-balance">
							Access your personalized dashboard to view market trends, track
							competitor insights, and make data-driven decisions for your
							business.
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}
