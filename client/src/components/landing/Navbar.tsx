"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useQuery} from "@tanstack/react-query";
import {api} from "@/lib/api";
import {LayoutDashboard} from "lucide-react";

export function Navbar() {
	const {data: user} = useQuery({
		queryKey: ["user"],
		queryFn: api.user.profile,
		retry: false,
	});

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
			<div className="container mx-auto px-6 h-16 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<img
						src="/logo.png"
						alt="AutoReview AI"
						className="w-7 h-7 rounded-lg"
					/>
					<span className="font-bold text-lg">AutoReview AI</span>
				</Link>

				<div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
					<a
						href="#how-it-works"
						className="hover:text-foreground transition-colors">
						How It Works
					</a>
					<a
						href="#features"
						className="hover:text-foreground transition-colors">
						Features
					</a>
					<a
						href="#pricing"
						className="hover:text-foreground transition-colors">
						Pricing
					</a>
				</div>

				{user ? (
					<Button
						asChild
						size="sm"
						className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground btn-press">
						<Link href="/dashboard">
							<LayoutDashboard className="w-4 h-4 mr-1.5" /> Go to Dashboard
						</Link>
					</Button>
				) : (
					<Button
						asChild
						size="sm"
						className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground btn-press">
						<Link href="/login">Get Started</Link>
					</Button>
				)}
			</div>
		</nav>
	);
}
