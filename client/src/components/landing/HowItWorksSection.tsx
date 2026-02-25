"use client";

import {motion} from "framer-motion";
import {Github, GitPullRequest, Bot} from "lucide-react";

const steps = [
	{
		icon: Github,
		title: "Connect Your Repo",
		description:
			"Link your GitHub repositories with a single click. AutoReview starts watching immediately.",
	},
	{
		icon: GitPullRequest,
		title: "Open a Pull Request",
		description:
			"Push your code and open a PR as usual. AutoReview detects it automatically.",
	},
	{
		icon: Bot,
		title: "Get AI Review",
		description:
			"Receive detailed AI-powered code reviews with actionable inline comments in seconds.",
	},
];

export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="py-24 relative">
			<div className="container mx-auto px-6">
				<motion.div
					initial={{opacity: 0, y: 20}}
					whileInView={{opacity: 1, y: 0}}
					viewport={{once: true}}
					className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						How It <span className="gradient-text">Works</span>
					</h2>
					<p className="text-muted-foreground text-lg max-w-md mx-auto">
						Three simple steps to automated code reviews
					</p>
				</motion.div>

				<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					{steps.map((step, i) => (
						<motion.div
							key={step.title}
							initial={{opacity: 0, y: 30}}
							whileInView={{opacity: 1, y: 0}}
							viewport={{once: true}}
							transition={{delay: i * 0.15}}
							className="text-center">
							<div className="relative mx-auto mb-6">
								<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
									<step.icon className="w-7 h-7 text-primary" />
								</div>
								<span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold flex items-center justify-center">
									{i + 1}
								</span>
							</div>
							<h3 className="text-lg font-semibold mb-2">{step.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{step.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
