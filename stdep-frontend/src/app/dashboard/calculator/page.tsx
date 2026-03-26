"use client";

import { useMemo, useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock products (should be shared in real app)
type Product = {
	id: string;
	name: string;
	platform: "Amazon" | "AliExpress";
	price: string;
	category: string;
};
const mockProducts: Product[] = [
	{
		id: "1",
		name: "Wireless Earbuds",
		platform: "Amazon",
		price: "$29.99",
		category: "Electronics",
	},
	{
		id: "2",
		name: "LED Makeup Mirror",
		platform: "AliExpress",
		price: "$15.50",
		category: "Beauty & Grooming",
	},
];

export default function MarginCalculatorPage() {
	const [activeTab, setActiveTab] = useState<"calculator" | "estimator">(
		"calculator",
	);
	const [bulkPrice, setBulkPrice] = useState("");
	const [bulkQuantity, setBulkQuantity] = useState("");
	const [sellingPrice, setSellingPrice] = useState("");
	const [optionalQuantity, setOptionalQuantity] = useState("");
	const [productName, setProductName] = useState("");
	const [brand, setBrand] = useState("");
	const [category, setCategory] = useState("");
	const [price, setPrice] = useState("");
	const [estimateResult, setEstimateResult] = useState<{
		bulkCost: number;
		sellingPrice: number;
		marginPercent: number | null;
		marginValue: number | null;
		uncertainty: string;
	} | null>(null);
	const [estimateError, setEstimateError] = useState<string | null>(null);
	const [isEstimating, setIsEstimating] = useState(false);

	const calculation = useMemo(() => {
		const price = Number.parseFloat(bulkPrice);
		const bulkQty = Number.parseInt(bulkQuantity, 10);
		const sellPrice = Number.parseFloat(sellingPrice);

		const qtyProvided = optionalQuantity.trim().length > 0;
		const qtyValue = qtyProvided ? Number.parseInt(optionalQuantity, 10) : null;

		if (!Number.isFinite(price) || price <= 0) {
			return { error: "Enter a valid bulk price greater than 0." };
		}
		if (!Number.isFinite(bulkQty) || bulkQty <= 0) {
			return { error: "Enter a valid bulk quantity greater than 0." };
		}
		if (!Number.isFinite(sellPrice) || sellPrice <= 0) {
			return { error: "Enter a valid selling price greater than 0." };
		}
		if (qtyProvided && (!Number.isFinite(qtyValue) || (qtyValue ?? 0) <= 0)) {
			return {
				error: "Optional quantity must be a whole number greater than 0.",
			};
		}

		const costPerItem = price / bulkQty;
		const marginPercent = ((sellPrice - costPerItem) / sellPrice) * 100;

		if (qtyProvided && qtyValue !== null) {
			const profit = (sellPrice - costPerItem) * qtyValue;
			return { marginPercent, profit };
		}

		return { marginPercent };
	}, [bulkPrice, bulkQuantity, sellingPrice, optionalQuantity]);

	const handleEstimate = async () => {
		setEstimateError(null);
		setEstimateResult(null);

		const trimmedName = productName.trim();
		const trimmedBrand = brand.trim();
		const trimmedCategory = category.trim();
		const priceValue = Number.parseFloat(price);

		if (!trimmedName || !trimmedBrand || !trimmedCategory) {
			setEstimateError("Please fill in product name, brand, and category.");
			return;
		}
		if (!Number.isFinite(priceValue) || priceValue <= 0) {
			setEstimateError("Please enter a valid price greater than 0.");
			return;
		}

		try {
			setIsEstimating(true);
			const response = await fetch("http://localhost:8000/gemini/estimate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					product_name: trimmedName,
					brand: trimmedBrand,
					category: trimmedCategory,
					price: priceValue,
				}),
			});

			if (!response.ok) {
				const errorPayload = await response.json().catch(() => null);
				const message = errorPayload?.detail || "Failed to generate estimate.";
				throw new Error(message);
			}

			const data = (await response.json()) as {
				bulk_cost: number;
				selling_price: number;
				margin_percent?: number;
				margin_value?: number;
				margin?: number;
				uncertainty: string;
			};

			const normalizedMarginPercent =
				typeof data.margin_percent === "number"
					? data.margin_percent
					: typeof data.margin === "number"
						? data.margin
						: null;

			const normalizedMarginValue =
				typeof data.margin_value === "number" ? data.margin_value : null;

			setEstimateResult({
				bulkCost: data.bulk_cost,
				sellingPrice: data.selling_price,
				marginPercent: normalizedMarginPercent,
				marginValue: normalizedMarginValue,
				uncertainty: data.uncertainty,
			});
		} catch (error) {
			setEstimateError(
				error instanceof Error ? error.message : "Something went wrong.",
			);
		} finally {
			setIsEstimating(false);
		}
	};

	return (
		<main className="min-h-screen bg-background">
			<DashboardSidebar />
			<div className="ml-60 min-h-screen p-4 pl-0">
				<div className="flex flex-col gap-4">
					{/* Top Tabs */}
					<div className="flex justify-center animate-fade-in-up">
						<div className="bg-card rounded-full p-1 border border-border shadow-sm">
							<button
								onClick={() => setActiveTab("calculator")}
								className={cn(
									"px-6 py-2 rounded-full text-sm font-medium transition-colors",
									activeTab === "calculator"
										? "bg-foreground text-background"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								Calculator
							</button>
							<button
								onClick={() => setActiveTab("estimator")}
								className={cn(
									"px-6 py-2 rounded-full text-sm font-medium transition-colors",
									activeTab === "estimator"
										? "bg-foreground text-background"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								Estimator
							</button>
						</div>
					</div>

					{activeTab === "calculator" ? (
						<div>
							<div className="mb-6">
								<h2 className="text-lg font-semibold mb-2">
									Select a Saved Product for Margin Estimation
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{mockProducts.map((product) => (
										<button
											key={product.id}
											className={cn(
												"border rounded-lg p-4 bg-background/80 text-left hover:shadow-md transition-all",
												productName === product.name
													? "border-primary ring-2 ring-primary"
													: "",
											)}
											onClick={() => {
												setProductName(product.name);
												setBrand(product.platform);
												setCategory(product.category);
												setPrice(product.price.replace("$", ""));
											}}
										>
											<div className="flex justify-between items-center mb-2">
												<span className="font-semibold">{product.name}</span>
												<span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
													{product.platform}
												</span>
											</div>
											<div className="text-sm text-muted-foreground mb-1">
												{product.category}
											</div>
											<div className="text-sm font-medium">{product.price}</div>
										</button>
									))}
								</div>
								<p className="text-xs text-muted-foreground mt-2">
									Only one product can be selected at a time. Selecting will
									auto-fill the estimator below.
								</p>
							</div>
							<Card className="border border-border shadow-sm animate-slide-in-right">
								<CardHeader className="pb-2">
									<CardTitle className="text-lg font-bold text-foreground">
										Margin Calculator
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="bulk-price">
												Bulk buying cost (total)
											</Label>
											<Input
												id="bulk-price"
												type="number"
												min="0"
												step="0.01"
												placeholder="e.g., 120"
												value={bulkPrice}
												onChange={(event) => setBulkPrice(event.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="bulk-quantity">
												Bulk quantity (items)
											</Label>
											<Input
												id="bulk-quantity"
												type="number"
												min="1"
												step="1"
												placeholder="e.g., 24"
												value={bulkQuantity}
												onChange={(event) =>
													setBulkQuantity(event.target.value)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="selling-price">
												Selling price (per item)
											</Label>
											<Input
												id="selling-price"
												type="number"
												min="0"
												step="0.01"
												placeholder="e.g., 9.99"
												value={sellingPrice}
												onChange={(event) =>
													setSellingPrice(event.target.value)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="optional-quantity">
												Optional quantity (items)
											</Label>
											<Input
												id="optional-quantity"
												type="number"
												min="1"
												step="1"
												placeholder="Leave blank for margin only"
												value={optionalQuantity}
												onChange={(event) =>
													setOptionalQuantity(event.target.value)
												}
											/>
										</div>
									</div>

									<div className="rounded-xl border border-border bg-muted/40 p-4">
										{"error" in calculation ? (
											<p className="text-sm text-destructive">
												{calculation.error}
											</p>
										) : (
											<div className="flex flex-col gap-2">
												<p className="text-sm text-muted-foreground">Margin</p>
												<p className="text-3xl font-bold text-foreground">
													{calculation.marginPercent.toFixed(2)}%
												</p>
												{typeof calculation.profit === "number" && (
													<p className="text-sm text-muted-foreground">
														Profit for quantity:{" "}
														<span className="font-semibold text-foreground">
															${calculation.profit.toFixed(2)}
														</span>
													</p>
												)}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					) : (
						<Card className="border border-border shadow-sm animate-slide-in-right">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg font-bold text-foreground">
									AI Margin Estimator
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
									AI-generated estimates are informed guesses and may differ
									from real-world prices or margins. Use these results as
									guidance only.
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="product-name">Product name</Label>
										<Input
											id="product-name"
											placeholder="e.g., Anker Soundcore 2"
											value={productName}
											onChange={(event) => setProductName(event.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="brand">Brand</Label>
										<Input
											id="brand"
											placeholder="e.g., Anker"
											value={brand}
											onChange={(event) => setBrand(event.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="category">Category</Label>
										<Input
											id="category"
											placeholder="e.g., Electronics > Portable Speakers"
											value={category}
											onChange={(event) => setCategory(event.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="estimate-price">Price</Label>
										<Input
											id="estimate-price"
											type="number"
											min="0"
											step="0.01"
											placeholder="e.g., 44.99"
											value={price}
											onChange={(event) => setPrice(event.target.value)}
										/>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={handleEstimate}
										className={cn(
											"px-5 py-2 rounded-lg text-sm font-medium transition-colors",
											isEstimating
												? "bg-muted text-muted-foreground cursor-not-allowed"
												: "bg-foreground text-background hover:bg-foreground/90",
										)}
										disabled={isEstimating}
									>
										{isEstimating ? "Estimating..." : "Generate estimate"}
									</button>
									{estimateError && (
										<span className="text-sm text-destructive">
											{estimateError}
										</span>
									)}
								</div>

								{estimateResult && (
									<div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												Bulk cost (unit)
											</span>
											<span className="text-sm font-semibold text-foreground">
												${estimateResult.bulkCost.toFixed(2)}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												Suggested selling price
											</span>
											<span className="text-sm font-semibold text-foreground">
												${estimateResult.sellingPrice.toFixed(2)}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												Margin estimate
											</span>
											<span className="text-sm font-semibold text-foreground">
												{estimateResult.marginPercent !== null
													? `${estimateResult.marginPercent.toFixed(2)}%`
													: "—"}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												Margin value
											</span>
											<span className="text-sm font-semibold text-foreground">
												{estimateResult.marginValue !== null
													? `$${estimateResult.marginValue.toFixed(2)}`
													: "—"}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												Uncertainty
											</span>
											<span className="text-sm font-semibold text-foreground">
												{estimateResult.uncertainty}
											</span>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</main>
	);
}
