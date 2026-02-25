"use client";

import {motion} from "framer-motion";
import {Check, Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

const plans = [
	{
		name: "Free",
		price: "$0",
		period: "/mo",
		features: [
			"30 reviews/month",
			"2 connected repos",
			"Bug + style checks",
			"Summary comments only",
			"7-day review history",
		],
		cta: "Get Started",
		highlighted: false,
	},
	{
		name: "Pro",
		price: "$10",
		period: "/mo",
		features: [
			"300 reviews/month",
			"10 connected repos",
			"Bug + security + performance",
			"Inline line-by-line comments",
			"Custom review rules",
			"Auto-fix commits",
			"Full repo RAG context",
			"90-day review history",
			"Priority queue processing",
		],
		cta: "Upgrade to Pro",
		highlighted: true,
	},
];

export function PricingSection() {
	const router = useRouter();
	return (
		<section id="pricing" className="py-24">
			<div className="container mx-auto px-6">
				<motion.div
					initial={{opacity: 0, y: 20}}
					whileInView={{opacity: 1, y: 0}}
					viewport={{once: true}}
					className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Simple, Transparent <span className="gradient-text">Pricing</span>
					</h2>
					<p className="text-muted-foreground text-lg">
						Start free. Upgrade when you need more power.
					</p>
				</motion.div>

				<div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
					{plans.map((plan, i) => (
						<motion.div
							key={plan.name}
							initial={{opacity: 0, y: 30, rotateY: i === 0 ? 2 : -2}}
							whileInView={{opacity: 1, y: 0, rotateY: 0}}
							viewport={{once: true}}
							transition={{delay: i * 0.15}}
							className={`relative rounded-2xl p-8 hover-lift ${
								plan.highlighted ? "gradient-border glass-strong" : "glass"
							}`}>
							{plan.highlighted && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-primary-foreground flex items-center gap-1">
									<Sparkles className="w-3 h-3" /> Popular
								</div>
							)}

							<h3 className="text-xl font-bold mb-1">{plan.name}</h3>
							<div className="flex items-baseline gap-1 mb-6">
								<span className="text-4xl font-bold">{plan.price}</span>
								<span className="text-muted-foreground">{plan.period}</span>
							</div>

							<ul className="space-y-3 mb-8">
								{plan.features.map((f) => (
									<li key={f} className="flex items-center gap-3 text-sm">
										<Check className="w-4 h-4 text-success flex-shrink-0" />
										<span className="text-muted-foreground">{f}</span>
									</li>
								))}
							</ul>

							<Button
								onClick={() => router.push("/login")}
								className={`w-full btn-press ${
									plan.highlighted
										? "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
										: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
								}`}>
								{plan.cta}
							</Button>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
