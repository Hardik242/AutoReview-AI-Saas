export function Footer() {
	return (
		<footer className="border-t border-border/50 py-12">
			<div className="container mx-auto px-6">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					<a href="#hero">
						<div className="flex items-center gap-2">
							<img
								src="/logo.png"
								alt="AutoReview AI"
								className="w-5 h-5 rounded-lg"
							/>
							<span className="font-semibold">AutoReview AI</span>
						</div>
					</a>
					<div className="flex items-center gap-8 text-sm text-muted-foreground">
						<a
							target="_blank"
							href="https://github.com/Hardik242/AutoReview-AI-Saas"
							className="hover:text-foreground transition-colors">
							GitHub
						</a>
						<a
							target="_blank"
							href="https://github.com/Hardik242/AutoReview-AI-Saas"
							className="hover:text-foreground transition-colors">
							Documentation
						</a>
					</div>
					<p className="text-sm text-muted-foreground">
						Built with ❤️ by Hardik Goel
					</p>
				</div>
			</div>
		</footer>
	);
}
