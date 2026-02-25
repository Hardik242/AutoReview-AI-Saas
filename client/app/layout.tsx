import type {Metadata} from "next";
import "./globals.css";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import Providers from "./providers";

export const metadata: Metadata = {
	title: {
		default: "AI PR Code Reviewer",
		template: "%s | AI Code Reviewer",
	},
	description:
		"Automated Pull Request Reviews powered by Gemini AI. Get instant feedback on your code quality, bugs, and security issues.",
	keywords: ["code review", "ai", "gemini", "pull request", "github"],
	authors: [{name: "AutoReview AI"}],
	creator: "AutoReview AI",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased font-sans bg-background text-foreground">
				<Providers>
					<TooltipProvider>
						{children}
						<Toaster />
						<Sonner />
					</TooltipProvider>
				</Providers>
			</body>
		</html>
	);
}
