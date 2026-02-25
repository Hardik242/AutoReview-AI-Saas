"use client";

import {Github} from "lucide-react";
import {Button} from "@/components/ui/button";
import {motion} from "framer-motion";
import {api} from "@/lib/api";
import {useQuery, useMutation} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export default function Login() {
	const [token, setToken] = useState("");
	const router = useRouter();

	const {data: user} = useQuery({
		queryKey: ["user"],
		queryFn: api.user.profile,
		retry: false,
	});

	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		}
	}, [user, router]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
			{/* Background glow */}
			<div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />

			<motion.div
				initial={{opacity: 0, y: 20}}
				animate={{opacity: 1, y: 0}}
				className="glass rounded-2xl p-10 w-full max-w-sm text-center relative z-10">
				<img
					src="/logo.png"
					alt="AutoReview AI"
					className="w-14 h-14 rounded-2xl mx-auto mb-6"
				/>

				<h1 className="text-2xl font-bold mb-2">Sign in to AutoReview AI</h1>
				<p className="text-muted-foreground text-sm mb-8">
					Connect your GitHub to get started
				</p>

				<Button
					asChild
					size="lg"
					className="w-full bg-foreground text-background hover:bg-foreground/90 btn-press">
					<a href={api.auth.loginUrl()}>
						<Github className="mr-2 w-5 h-5" />
						Continue with GitHub
					</a>
				</Button>

				<p className="text-xs text-muted-foreground mt-6">
					By signing in, you agree to our{" "}
					<a href="#" className="underline hover:text-foreground">
						Terms of Service
					</a>
				</p>
			</motion.div>
		</div>
	);
}
