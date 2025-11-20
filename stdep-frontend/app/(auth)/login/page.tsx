// src/app/(auth)/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				}
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				const message =
					errorData?.detail ||
					errorData?.message ||
					`Login failed (status ${res.status})`;
				setError(String(message));
				return;
			}

			const data = await res.json().catch(() => null);

			if (data && (data.access_token || data.token)) {
				const token = data.access_token || data.token;
				try {
					localStorage.setItem("token", token);
				} catch {
					// ignore if localStorage not available
				}
			}

			router.push("/dashboard");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Network error. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
			<div className="w-full max-w-md space-y-6 rounded-xl bg-slate-900/60 p-6 shadow-lg">
				<h1 className="text-xl font-semibold text-center">
					PSCC Analytics – Login
				</h1>
				<form className="space-y-4" onSubmit={handleSubmit}>
					{error && <p className="text-red-400 text-sm">{error}</p>}
					<div className="space-y-1 text-sm">
						<label className="block text-slate-200">Email</label>
						<input
							type="email"
							className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-1 text-sm">
						<label className="block text-slate-200">Password</label>
						<input
							type="password"
							className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-600 disabled:opacity-60"
					>
						{isLoading ? "Signing in…" : "Sign in"}
					</button>
				</form>
			</div>
		</main>
	);
}
