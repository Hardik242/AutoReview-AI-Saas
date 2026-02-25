import {motion} from "framer-motion";
import {ArrowRight, Play} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {CodeDiffMockup} from "./CodeDiffMockup";

export function HeroSection() {
	return (
		<section
			id="hero"
			className="relative min-h-[90vh] flex items-center overflow-hidden">
			{/* Background glow */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-glow-pulse pointer-events-none" />

			<div className="container mx-auto px-6 py-20">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					<motion.div
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.6}}>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-muted-foreground mb-6">
							<span className="w-2 h-2 rounded-full bg-success animate-pulse" />
							Now with RAG-powered codebase context
						</div>

						<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
							AI-Powered Code Reviews{" "}
							<span className="gradient-text">in Seconds</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
							AutoReview AI catches bugs, security vulnerabilities, and
							performance issues — before they reach production.
						</p>

						<div className="flex flex-wrap gap-4">
							<Button
								asChild
								size="lg"
								className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground px-8 btn-press">
								<Link to="/login">
									Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="border-border/60 text-foreground hover:bg-secondary btn-press">
								<a href="#how-it-works">
									<Play className="mr-2 w-4 h-4" /> See How It Works
								</a>
							</Button>
						</div>
					</motion.div>

					<motion.div
						initial={{opacity: 0, x: 30}}
						animate={{opacity: 1, x: 0}}
						transition={{duration: 0.8, delay: 0.2}}
						className="hidden lg:block">
						<CodeDiffMockup />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
