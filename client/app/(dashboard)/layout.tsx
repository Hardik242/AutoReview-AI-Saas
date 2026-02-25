"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {
	LayoutDashboard,
	FolderGit2,
	FileSearch,
	Settings,
	LogOut,
	ChevronUp,
	Sparkles,
	Moon,
	Sun,
} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Badge} from "@/components/ui/badge";
import {useQuery} from "@tanstack/react-query";
import {api, AuthError} from "@/lib/api";
import {useEffect} from "react";

const navItems = [
	{to: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
	{to: "/repositories", label: "Repositories", icon: FolderGit2},
	{to: "/reviews", label: "Reviews", icon: FileSearch},
	{to: "/settings", label: "Settings", icon: Settings},
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [dark, setDark] = useState(() => {
		if (typeof window !== "undefined") {
			return (
				localStorage.getItem("theme") === "dark" ||
				(!localStorage.getItem("theme") &&
					window.matchMedia("(prefers-color-scheme: dark)").matches)
			);
		}
		return true;
	});

	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		localStorage.setItem("theme", dark ? "dark" : "light");
	}, [dark]);

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user"],
		queryFn: api.user.profile,
		retry: false,
		refetchInterval: 30000,
	});

	useEffect(() => {
		if (error instanceof AuthError) {
			window.location.href = "/login";
		} else if (error instanceof Error) {
			window.location.href = "/";
		}
	}, [error]);

	const handleLogout = async () => {
		try {
			await api.auth.logout();
		} catch {
			// ignore
		}
		window.location.href = "/login";
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!user) return null;

	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild tooltip="AutoReview AI">
								<Link href="/">
									<img
										src="/logo.png"
										alt="AutoReview AI"
										className="w-6 h-6 rounded dark:outline dark:outline-white ml-1"
									/>
									<span className="font-bold text-lg">AutoReview AI</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Navigation</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{navItems.map((item) => (
									<SidebarMenuItem key={item.to}>
										<SidebarMenuButton
											asChild
											isActive={pathname === item.to}
											tooltip={item.label}>
											<Link href={item.to}>
												<item.icon className="w-4 h-4" />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupLabel>Plan</SidebarGroupLabel>
						<SidebarGroupContent>
							<div className="px-2 py-1">
								<div className="flex items-center gap-2 text-sm group-data-[collapsible=icon]:hidden">
									<Badge
										variant="outline"
										className={`text-xs ${user.plan === "pro" ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"}`}>
										{user.plan === "pro" ? "Pro" : "Free"}
									</Badge>
									<span className="text-xs text-muted-foreground">
										{user.reviewsUsed}/{user.reviewsLimit}
									</span>
								</div>
								{user.plan === "free" && (
									<button
										onClick={async () => {
											try {
												const {url} = await api.stripe.checkout();
												window.location.href = url;
											} catch {
												/* ignore */
											}
										}}
										className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline group-data-[collapsible=icon]:hidden">
										<Sparkles className="w-3 h-3" /> Upgrade to Pro
									</button>
								)}
							</div>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								tooltip={dark ? "Light mode" : "Dark mode"}
								onClick={() => setDark(!dark)}>
								{dark ? (
									<Sun className="w-4 h-4" />
								) : (
									<Moon className="w-4 h-4" />
								)}
								<span>{dark ? "Light Mode" : "Dark Mode"}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton size="lg" tooltip={user.username}>
										{user.avatarUrl ? (
											<img
												src={user.avatarUrl}
												alt={user.username}
												className="w-6 h-6 rounded-full"
											/>
										) : (
											<div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent" />
										)}
										<div className="flex-1 text-left">
											<p className="text-sm font-medium truncate">
												{user.username}
											</p>
											<p className="text-xs text-muted-foreground truncate">
												{user.email || "No email"}
											</p>
										</div>
										<ChevronUp className="w-4 h-4" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent side="top" align="start" className="w-56">
									<DropdownMenuItem
										onClick={() => (window.location.href = "/settings")}>
										<Settings className="w-4 h-4 mr-2" /> Settings
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive"
										onClick={handleLogout}>
										<LogOut className="w-4 h-4 mr-2" /> Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>

			<SidebarInset className="flex relative flex-1 flex-col min-h-svh bg-background overflow-x-hidden">
				<header className="sticky top-0 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 md:px-6">
					<SidebarTrigger />
					<Separator orientation="vertical" className="h-5" />
					<span className="text-sm font-medium capitalize text-muted-foreground">
						{pathname === "/dashboard"
							? "Dashboard"
							: pathname.replace("/", "")}
					</span>
					<div className="flex-1" />
				</header>
				{/* main content */}
				<div className="flex-1 p-4 md:p-6">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
