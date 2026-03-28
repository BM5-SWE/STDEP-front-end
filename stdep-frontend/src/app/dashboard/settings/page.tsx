"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { apiFetch } from "@/lib/api";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function SettingsPage() {
	useAuthGuard();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [showDelete, setShowDelete] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	// Pre-fill form with current user data
	useEffect(() => {
		apiFetch("/auth/me").then(async (res) => {
			if (res.ok) {
				const data = await res.json();
				setName(data.name ?? "");
				setEmail(data.email ?? "");
				setUsername(data.username ?? "");
			}
		});
	}, []);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			const res = await apiFetch("/auth/user", {
				method: "PUT",
				body: JSON.stringify({ name, email, username }),
			});
			if (res.ok) {
				setSuccess("Settings updated successfully.");
				setTimeout(() => setSuccess(""), 3000);
			} else {
				const data = await res.json();
				setError(data?.detail ?? "Update failed.");
			}
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setShowDelete(false);
		try {
			await apiFetch("/auth/user", { method: "DELETE" });
		} finally {
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			router.replace("/login");
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-background via-muted/60 to-background">
			<DashboardSidebar />
			<div className="ml-60 p-6 animate-fade-in-up">
				<div className="max-w-xl mx-auto">
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
								className="lucide lucide-settings text-primary"
							>
								<circle cx="12" cy="12" r="3" />
								<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1V13a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 8.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .66.42 1.25 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.24.53.24 1.14 0 1.67z" />
							</svg>
						</span>
						<h1 className="text-2xl font-bold tracking-tight">Settings</h1>
					</div>
					<form
						onSubmit={handleSave}
						className="space-y-6 rounded-2xl bg-card/80 border border-border shadow-sm p-6"
					>
						<div>
							<label htmlFor="name" className="block font-medium mb-1">
								Name
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="border rounded px-3 py-2 w-full"
								placeholder="Enter your name"
							/>
						</div>
						<div>
							<label htmlFor="username" className="block font-medium mb-1">
								Username
							</label>
							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="border rounded px-3 py-2 w-full"
								placeholder="Enter your username"
							/>
						</div>
						<div>
							<label htmlFor="email" className="block font-medium mb-1">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="border rounded px-3 py-2 w-full"
								placeholder="Enter your email"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="bg-foreground text-background px-5 py-2 rounded font-medium hover:bg-foreground/90 transition disabled:opacity-50"
						>
							{loading ? "Saving..." : "Save Changes"}
						</button>
						{success && <div className="text-green-600 text-sm mt-2">{success}</div>}
						{error && <div className="text-destructive text-sm mt-2">{error}</div>}
					</form>
					<div className="mt-10 border-t pt-6">
						<button
							className="text-destructive font-semibold hover:underline"
							onClick={() => setShowDelete(true)}
						>
							Delete Account
						</button>
					</div>
					{showDelete && (
						<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
							<div className="bg-background rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative animate-fade-in-up">
								<h2 className="text-xl font-bold mb-2 text-destructive">
									Delete Account
								</h2>
								<p className="mb-4">
									Are you sure you want to delete your account? This action
									cannot be undone.
								</p>
								<div className="flex gap-4">
									<button
										className="bg-destructive text-background px-4 py-2 rounded font-medium hover:bg-destructive/90"
										onClick={handleDelete}
									>
										Yes, Delete
									</button>
									<button
										className="bg-muted px-4 py-2 rounded font-medium hover:bg-muted/80"
										onClick={() => setShowDelete(false)}
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
