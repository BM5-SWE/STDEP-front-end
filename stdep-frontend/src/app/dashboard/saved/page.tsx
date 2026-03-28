"use client";
import React, { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { apiFetch } from "@/lib/api";
import { useAuthGuard } from "@/hooks/use-auth-guard";

type Product = {
	id: string;
	product_name: string;
	platform: string;
	price: number | null;
	currency: string | null;
	category: string | null;
	platform_url: string | null;
	product_image_url: string | null;
};

export default function SavedPage() {
	useAuthGuard();
	const [products, setProducts] = useState<Product[]>([]);
	const [filter, setFilter] = useState("");
	const [selected, setSelected] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		apiFetch("/api/saved-products")
			.then((res) => (res.ok ? res.json() : []))
			.then((data) => setProducts(data))
			.finally(() => setLoading(false));
	}, []);

	const filteredProducts = products.filter((p) =>
		p.product_name.toLowerCase().includes(filter.toLowerCase()),
	);

	return (
		<main className="min-h-screen bg-gradient-to-br from-background via-muted/60 to-background">
			<DashboardSidebar />
			<div className="ml-60 p-6 animate-fade-in-up">
				<div className="max-w-4xl mx-auto">
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
								className="lucide lucide-bookmark text-primary"
							>
								<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
							</svg>
						</span>
						<h1 className="text-2xl font-bold tracking-tight">
							Saved Products
						</h1>
					</div>
					<div className="mb-4 flex gap-2 items-center">
						<label htmlFor="filter" className="font-medium">
							Contains:
						</label>
						<input
							id="filter"
							type="text"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							className="border rounded px-2 py-1 text-sm"
							placeholder="Enter keyword..."
						/>
					</div>
					<div className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
						{loading ? (
							<p className="text-muted-foreground">Loading...</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{filteredProducts.length === 0 ? (
									<div className="col-span-full text-muted-foreground">
										No products found.
									</div>
								) : (
									filteredProducts.map((product) => (
										<div
											key={product.id}
											className="border rounded-lg p-4 bg-gradient-to-br from-[#f7fafc] to-[#e3e8ee] dark:from-[#23272e] dark:to-[#181a1b] cursor-pointer hover:shadow-md transition-all"
											onClick={() => setSelected(product)}
										>
											<div className="flex justify-between items-center mb-2">
												<span className="font-semibold">
													{product.product_name}
												</span>
												<span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
													{product.platform}
												</span>
											</div>
											<div className="text-sm text-muted-foreground mb-1">
												{product.category ?? "—"}
											</div>
											<div className="text-sm font-medium">
												{product.price != null
													? `${product.currency ?? ""} ${product.price}`.trim()
													: "—"}
											</div>
										</div>
									))
								)}
							</div>
						)}
					</div>
					{selected && (
						<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
							<div className="bg-background rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative animate-fade-in-up">
								<button
									className="absolute top-2 right-2 text-lg font-bold text-muted-foreground hover:text-foreground"
									onClick={() => setSelected(null)}
									aria-label="Close"
								>
									×
								</button>
								<h2 className="text-xl font-bold mb-2">
									{selected.product_name}
								</h2>
								<div className="mb-2">
									<span className="font-medium">Platform:</span>{" "}
									{selected.platform}
								</div>
								<div className="mb-2">
									<span className="font-medium">Category:</span>{" "}
									{selected.category ?? "—"}
								</div>
								<div className="mb-2">
									<span className="font-medium">Price:</span>{" "}
									{selected.price != null
										? `${selected.currency ?? ""} ${selected.price}`.trim()
										: "—"}
								</div>
								{selected.platform_url && (
									<div className="mb-2">
										<a
											href={selected.platform_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary underline text-sm"
										>
											View on {selected.platform}
										</a>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
