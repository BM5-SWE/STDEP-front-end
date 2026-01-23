"use client";
import  { Features } from "@/components/landing/features";
import  { Sidebar } from "@/components/landing/sidebar";

export default function Home() {
	return (
		<main className="">
			<Sidebar />
			<Features />
		</main>
	);
}
