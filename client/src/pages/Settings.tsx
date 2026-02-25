import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "@/lib/api";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
	User,
	CreditCard,
	Wand2,
	ScrollText,
	Plus,
	Trash2,
	Loader2,
	Lock,
	ExternalLink,
	LogOut,
	Sparkles,
} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";
import {useSearchParams, useNavigate} from "react-router-dom";

export default function SettingsPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get("tab") || "profile";

	const {data: user} = useQuery({
		queryKey: ["user"],
		queryFn: api.user.profile,
	});
	const {data: rules = []} = useQuery({
		queryKey: ["rules"],
		queryFn: api.rules.list,
	});

	const [newRule, setNewRule] = useState("");

	const setTab = (tab: string) => {
		setSearchParams({tab});
	};

	const autoFixMutation = useMutation({
		mutationFn: (enabled: boolean) => api.user.toggleAutoFix(enabled),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["user"]});
			toast.success("Auto-fix setting updated");
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const createRuleMutation = useMutation({
		mutationFn: (rule: string) => api.rules.create(rule),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["rules"]});
			setNewRule("");
			toast.success("Rule added");
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const deleteRuleMutation = useMutation({
		mutationFn: (id: number) => api.rules.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["rules"]});
			toast.success("Rule deleted");
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const toggleRuleMutation = useMutation({
		mutationFn: (id: number) => api.rules.toggle(id),
		onSuccess: () => queryClient.invalidateQueries({queryKey: ["rules"]}),
		onError: (err: Error) => toast.error(err.message),
	});

	const handleUpgrade = async () => {
		try {
			const {url} = await api.stripe.checkout();
			window.location.href = url;
		} catch (err) {
			toast.error((err as Error).message);
		}
	};

	const handlePortal = async () => {
		try {
			const {url} = await api.stripe.portal();
			window.location.href = url;
		} catch (err) {
			toast.error((err as Error).message);
		}
	};

	const handleLogout = async () => {
		try {
			await api.auth.logout();
		} catch {
			/* */
		}
		navigate("/login");
	};

	const ProLock = ({children}: {children: React.ReactNode}) => {
		if (user?.plan === "pro") return <>{children}</>;
		return (
			<div className="relative">
				<div className="opacity-50 pointer-events-none">{children}</div>
				<div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg backdrop-blur-sm">
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<Lock className="w-4 h-4" /> Pro feature
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground mt-1">
					Manage your account, billing, and review preferences.
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="profile" className="gap-1.5">
						<User className="w-4 h-4" />{" "}
						<span className="hidden sm:inline">Profile</span>
					</TabsTrigger>
					<TabsTrigger value="billing" className="gap-1.5">
						<CreditCard className="w-4 h-4" />{" "}
						<span className="hidden sm:inline">Billing</span>
					</TabsTrigger>
					<TabsTrigger value="autofix" className="gap-1.5">
						<Wand2 className="w-4 h-4" />{" "}
						<span className="hidden sm:inline">Auto-Fix</span>
					</TabsTrigger>
					<TabsTrigger value="rules" className="gap-1.5">
						<ScrollText className="w-4 h-4" />{" "}
						<span className="hidden sm:inline">Rules</span>
					</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent value="profile" className="space-y-4 mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Profile</CardTitle>
							<CardDescription>
								Your account details from GitHub
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-4">
								{user?.avatarUrl ? (
									<img
										src={user.avatarUrl}
										alt={user.username}
										className="w-16 h-16 rounded-full ring-2 ring-primary/20"
									/>
								) : (
									<div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent" />
								)}
								<div>
									<p className="text-lg font-semibold">{user?.username}</p>
									<p className="text-sm text-muted-foreground">
										{user?.email || "No email set"}
									</p>
								</div>
							</div>

							<Separator />

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Plan</p>
									<Badge
										className="mt-1"
										variant={user?.plan === "pro" ? "default" : "secondary"}>
										{user?.plan === "pro" ? "Pro" : "Free"}
									</Badge>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Reviews Used</p>
									<p className="text-lg font-semibold mt-0.5">
										{user?.reviewsUsed} / {user?.reviewsLimit}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Resets On</p>
									<p className="text-sm font-medium mt-0.5">
										{user?.reviewsResetAt
											? new Date(user.reviewsResetAt).toLocaleDateString()
											: "—"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-destructive/30">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-semibold text-destructive">Danger Zone</p>
									<p className="text-sm text-muted-foreground">
										Sign out of your account
									</p>
								</div>
								<Button variant="destructive" size="sm" onClick={handleLogout}>
									<LogOut className="w-4 h-4 mr-1" /> Logout
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Billing Tab */}
				<TabsContent value="billing" className="space-y-4 mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Current Plan</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-2xl font-bold">
										{user?.plan === "pro" ? "Pro" : "Free"}
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										{user?.plan === "pro"
											? "300 reviews/month, inline comments, auto-fix, custom rules"
											: "30 reviews/month, summary comments only"}
									</p>
								</div>
								{user?.plan === "pro" ? (
									<Button variant="outline" onClick={handlePortal}>
										<ExternalLink className="w-4 h-4 mr-2" /> Manage
										Subscription
									</Button>
								) : (
									<Button onClick={handleUpgrade}>
										<Sparkles className="w-4 h-4 mr-2" /> Upgrade to Pro —
										$10/mo
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Plan Comparison</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4 text-sm">
								<div className="font-medium text-muted-foreground">Feature</div>
								<div className="font-medium text-center">Free</div>
								<div className="font-medium text-center text-primary">Pro</div>

								{[
									["Reviews / month", "30", "300"],
									["Review type", "Summary", "Inline + Summary"],
									["Auto-fix commits", "—", "✓"],
									["Custom rules", "—", "✓"],
									["Priority queue", "—", "✓"],
								].map(([feature, free, pro]) => (
									<div key={feature} className="contents">
										<div className="py-2 border-t border-border">{feature}</div>
										<div className="py-2 border-t border-border text-center text-muted-foreground">
											{free}
										</div>
										<div className="py-2 border-t border-border text-center">
											{pro}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Auto-Fix Tab */}
				<TabsContent value="autofix" className="mt-4">
					<ProLock>
						<Card>
							<CardHeader>
								<CardTitle>Auto-Fix</CardTitle>
								<CardDescription>
									When enabled, AutoReview AI will automatically commit
									suggested fixes directly to your PR branch.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Wand2 className="w-5 h-5 text-primary" />
										<span className="font-medium">Enable Auto-Fix</span>
									</div>
									<Switch
										checked={user?.autoFixEnabled ?? false}
										onCheckedChange={(v) => autoFixMutation.mutate(v)}
										disabled={autoFixMutation.isPending}
									/>
								</div>
							</CardContent>
						</Card>
					</ProLock>
				</TabsContent>

				{/* Rules Tab */}
				<TabsContent value="rules" className="mt-4">
					<ProLock>
						<Card>
							<CardHeader>
								<CardTitle>Custom Review Rules</CardTitle>
								<CardDescription>
									Add custom instructions the AI will follow during code
									reviews.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex gap-2">
									<Input
										placeholder='e.g. "Always suggest using TypeScript strict mode"'
										value={newRule}
										onChange={(e) => setNewRule(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && newRule.trim()) {
												createRuleMutation.mutate(newRule.trim());
											}
										}}
									/>
									<Button
										disabled={!newRule.trim() || createRuleMutation.isPending}
										onClick={() => createRuleMutation.mutate(newRule.trim())}>
										{createRuleMutation.isPending ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Plus className="w-4 h-4" />
										)}
									</Button>
								</div>

								{rules.length === 0 ? (
									<p className="text-sm text-muted-foreground py-4 text-center">
										No custom rules yet. Add one above to guide the AI reviewer.
									</p>
								) : (
									<div className="space-y-2">
										{rules.map((rule) => (
											<div
												key={rule.id}
												className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
												<Switch
													checked={rule.isActive}
													onCheckedChange={() =>
														toggleRuleMutation.mutate(rule.id)
													}
												/>
												<span
													className={`flex-1 text-sm ${!rule.isActive ? "line-through text-muted-foreground" : ""}`}>
													{rule.rule}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => deleteRuleMutation.mutate(rule.id)}>
													<Trash2 className="w-3.5 h-3.5 text-destructive" />
												</Button>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</ProLock>
				</TabsContent>
			</Tabs>
		</div>
	);
}
