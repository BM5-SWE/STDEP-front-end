import type { ComponentPropsWithoutRef } from "react";

// Lightweight class name helper to keep component usage flexible.
function mergeClassNames(base: string, extra?: string) {
	return extra ? `${base} ${extra}` : base;
}

export type CardProps = ComponentPropsWithoutRef<"div">;

const cardBaseClasses =
	"relative flex w-full flex-col align-items-center rounded-4xl bg-foreground p-(--space-6) border border-color-line border-[0.5px] text-primary-text transition-all";

export function Card({ className, ...props }: CardProps) {
	return (
		<div className={mergeClassNames(cardBaseClasses, className)} {...props} />
	);
}

export type CardSectionProps = ComponentPropsWithoutRef<"div">;

export function CardHeader({ className, ...props }: CardSectionProps) {
	return (
		<div
			className={mergeClassNames(
				"flex flex-col gap-(--space-2) pb-(--space-2)",
				className
			)}
			{...props}
		/>
	);
}

export function CardBody({ className, ...props }: CardSectionProps) {
	return (
		<div
			className={mergeClassNames(
				"flex flex-col gap-(--space-2) py-(--space-2)",
				className
			)}
			{...props}
		/>
	);
}

export function CardFooter({ className, ...props }: CardSectionProps) {
	return (
		<div
			className={mergeClassNames(
				"flex items-center justify-between gap-(--space-1) pt-(--space-2) border-t border-primary/20 text-sm text-secondary-text",
				className
			)}
			{...props}
		/>
	);
}

export type CardTitleProps = ComponentPropsWithoutRef<"h3">;

export function CardTitle({ className, ...props }: CardTitleProps) {
	return (
		<h3
			className={mergeClassNames(
				"text-2xl font-semibold tracking-tight text-brand-text",
				className
			)}
			{...props}
		/>
	);
}

export type CardDescriptionProps = ComponentPropsWithoutRef<"p">;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
	return (
		<p
			className={mergeClassNames(
				"text-base leading-relaxed text-secondary-text",
				className
			)}
			{...props}
		/>
	);
}
