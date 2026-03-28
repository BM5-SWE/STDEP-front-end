"use client";
import React, { useEffect, useState } from "react";
import { History, BarChart3 } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { apiFetch } from "@/lib/api";
import { useAuthGuard } from "@/hooks/use-auth-guard";

type QueryRecord = {
	id: string;
	query_text: string;
	platform: string;
	created_at: string;
};

type MarginRecord = {
	id: string;
	product_name: string;
	platform: string;
	cost_price: number;
	selling_price: number | null;
	margin_percentage: number | null;
	created_at: string;
};

export default function HistoryPage() {
	useAuthGuard();
	const [queries, setQueries] = useState<QueryRecord[]>([]);
	const [margins, setMargins] = useState<MarginRecord[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			apiFetch("/api/query-history").then((r) => r.ok ? r.json() : []),
			apiFetch("/api/margin-estimates").then((r) => r.ok ? r.json() : []),
		]).then(([q, m]) => {
			setQueries(q);
			setMargins(m);
		}).finally(() => setLoading(false));
	}, []);

	const amazonQueries = queries.filter((q) => q.platform?.toLowerCase() === "amazon");
	const aliQueries = queries.filter((q) => q.platform?.toLowerCase() === "aliexpress");

	return (
		<main className="min-h-screen bg-gradient-to-br from-background via-muted/60 to-background">
			<DashboardSidebar />
			<div className="ml-60 p-6 animate-fade-in-up">
				<div className="max-w-3xl mx-auto">
					<div className="flex items-center gap-3 mb-6">
						<span className="bg-primary/10 p-2 rounded-xl"><History className="text-primary w-6 h-6" /></span>
						<h1 className="text-2xl font-bold tracking-tight">Query & Margin History</h1>
					</div>
					{loading ? <p className="text-muted-foreground">Loading...</p> : (
						<>
							<section className="mb-8">
								<div className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
									<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
										<BarChart3 className="w-5 h-5 text-muted-foreground" /> Past Queries
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="rounded-lg bg-gradient-to-br from-[#f7fafc] to-[#e3e8ee] dark:from-[#23272e] dark:to-[#181a1b] border p-4">
											<h3 className="font-medium mb-2">Amazon</h3>
											{amazonQueries.length === 0 ? (
												<p className="text-muted-foreground text-sm">(No queries yet)</p>
											) : (
												<ul className="space-y-1">
													{amazonQueries.map((q) => (
														<li key={q.id} className="text-sm border-b pb-1 last:border-0">
															<span className="font-medium">{q.query_text}</span>
															<span className="text-muted-foreground ml-2 text-xs">{new Date(q.created_at).toLocaleDateString()}</span>
														</li>
													))}
												</ul>
											)}
										</div>
										<div className="rounded-lg bg-gradient-to-br from-[#f7fafc] to-[#e3e8ee] dark:from-[#23272e] dark:to-[#181a1b] border p-4">
											<h3 className="font-medium mb-2">AliExpress</h3>
											{aliQueries.length === 0 ? (
												<p className="text-muted-foreground text-sm">(No queries yet)</p>
											) : (
												<ul className="space-y-1">
													{aliQueries.map((q) => (
														<li key={q.id} className="text-sm border-b pb-1 last:border-0">
															<span className="font-medium">{q.query_text}</span>
															<span className="text-muted-foreground ml-2 text-xs">{new Date(q.created_at).toLocaleDateString()}</span>
														</li>
													))}
												</ul>
											)}
										</div>
									</div>
								</div>
							</section>
							<section>
								<div className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
									<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
										<BarChart3 className="w-5 h-5 text-muted-foreground" /> Past Margin Estimates
									</h2>
									{margins.length === 0 ? (
										<p className="text-muted-foreground text-sm">(No margin estimates yet)</p>
									) : (
										<ul className="space-y-2">
											{margins.map((m) => (
												<li key={m.id} className="rounded-lg border p-3 text-sm flex justify-between items-center">
													<div>
														<span className="font-medium">{m.product_name}</span>
														<span className="text-muted-foreground ml-2">{m.platform}</span>
													</div>
													<div className="text-right">
														<div>Cost: ${m.cost_price} {m.selling_price != null && `→ Sell: $${m.selling_price}`}</div>
														{m.margin_percentage != null && (
															<div className="text-green-600 font-medium">{m.margin_percentage.toFixed(1)}% margin</div>
														)}
													</div>
												</li>
											))}
										</ul>
									)}
								</div>
							</section>
						</>
					)}
				</div>
			</div>
		</main>
	);
}
