import {motion} from "framer-motion";
import {Bug, Shield, Zap, Settings, GitCommit, Brain} from "lucide-react";

const features = [
	{
		icon: Bug,
		title: "Bug Detection",
		description:
			"Catches logic errors, null references, and common bugs before they ship.",
	},
	{
		icon: Shield,
		title: "Security Scanning",
		description:
			"Identifies SQL injection, XSS, and other vulnerabilities automatically.",
	},
	{
		icon: Zap,
		title: "Performance Analysis",
		description: "Flags N+1 queries, memory leaks, and slow algorithms.",
	},
	{
		icon: Settings,
		title: "Custom Rules",
		description:
			"Define review rules in plain English. Your team's standards, enforced by AI.",
	},
	{
		icon: GitCommit,
		title: "Auto-Fix Commits",
		description:
			"AI pushes fix commits directly to your PR branch. Toggle on or off.",
	},
	{
		icon: Brain,
		title: "RAG Context",
		description:
			"Understands your entire codebase for context-aware, accurate reviews.",
	},
];

export function FeaturesSection() {
	return (
		<section id="features" className="py-24 relative">
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
			<div className="container mx-auto px-6 relative">
				<motion.div
					initial={{opacity: 0, y: 20}}
					whileInView={{opacity: 1, y: 0}}
					viewport={{once: true}}
					className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Everything You Need for{" "}
						<span className="gradient-text">Better Code</span>
					</h2>
					<p className="text-muted-foreground text-lg max-w-md mx-auto">
						Powerful features that make code review effortless
					</p>
				</motion.div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
					{features.map((feature, i) => (
						<motion.div
							key={feature.title}
							initial={{opacity: 0, y: 30}}
							whileInView={{opacity: 1, y: 0}}
							viewport={{once: true}}
							transition={{delay: i * 0.08}}
							className="glass rounded-xl p-6 hover-lift cursor-default group">
							<div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
								<feature.icon className="w-5 h-5 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">{feature.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
