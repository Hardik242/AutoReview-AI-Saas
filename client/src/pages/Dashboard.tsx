import {useQuery} from "@tanstack/react-query";
import {api} from "@/lib/api";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
	FolderGit2,
	FileSearch,
	Bug,
	CheckCircle,
	TrendingUp,
	Loader2,
} from "lucide-react";
import {useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import {toast} from "sonner";
import {
	Area,
	AreaChart,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Bar,
	BarChart,
	Cell,
} from "recharts";

const statusColors: Record<string, string> = {
	completed: "hsl(160, 84%, 39%)",
	failed: "hsl(0, 72%, 51%)",
	queued: "hsl(38, 92%, 50%)",
	processing: "hsl(210, 80%, 55%)",
};

export default function Dashboard() {
	const [searchParams] = useSearchParams();

	const {data: user} = useQuery({
		queryKey: ["user"],
		queryFn: api.user.profile,
	});
	const {data: stats, isLoading: statsLoading} = useQuery({
		queryKey: ["stats"],
		queryFn: api.user.stats,
	});
	const {data: repos = []} = useQuery({
		queryKey: ["repos"],
		queryFn: api.repos.list,
	});
	const {data: reviews = []} = useQuery({
		queryKey: ["reviews"],
		queryFn: () => api.reviews.list(5, 0),
	});

	useEffect(() => {
		if (searchParams.get("upgraded") === "true") {
			toast.success("Welcome to Pro! 🎉 Your plan has been upgraded.");
		}
	}, [searchParams]);

	const statCards = [
		{
			title: "Connected Repos",
			value: stats?.totalRepos ?? 0,
			icon: FolderGit2,
			color: "text-primary",
		},
		{
			title: "Reviews This Month",
			value: stats?.monthlyReviews ?? 0,
			icon: FileSearch,
			color: "text-blue-500",
		},
		{
			title: "Issues Found",
			value: stats?.issuesFound ?? 0,
			icon: Bug,
			color: "text-destructive",
		},
		{
			title: "Success Rate",
			value: `${stats?.successRate ?? 0}%`,
			icon: CheckCircle,
			color: "text-green-500",
		},
	];

	const statusData = stats
		? [
				{
					name: "Completed",
					value: stats.completed,
					fill: statusColors.completed,
				},
				{name: "Failed", value: stats.failed, fill: statusColors.failed},
				{name: "Queued", value: stats.queued, fill: statusColors.queued},
				{
					name: "Processing",
					value: stats.processing,
					fill: statusColors.processing,
				},
			].filter((d) => d.value > 0)
		: [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">
					Welcome back, {user?.username ?? ""}
				</h1>
				<p className="text-muted-foreground mt-1">
					Here's an overview of your code review activity.
				</p>
			</div>

			{/* Stats cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{statCards.map((s) => (
					<Card key={s.title}>
						<CardContent className="p-5">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">{s.title}</p>
									<p className="text-2xl font-bold mt-1">
										{statsLoading ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											s.value
										)}
									</p>
								</div>
								<s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Charts row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<Card className="lg:col-span-2">
					<CardHeader className="pb-2">
						<CardTitle className="text-base flex items-center gap-2">
							<TrendingUp className="w-4 h-4" /> Reviews Over Time
						</CardTitle>
					</CardHeader>
					<CardContent>
						{stats?.dailyReviews && stats.dailyReviews.length > 0 ? (
							<ResponsiveContainer width="100%" height={240}>
								<AreaChart data={stats.dailyReviews}>
									<defs>
										<linearGradient
											id="colorReviews"
											x1="0"
											y1="0"
											x2="0"
											y2="1">
											<stop
												offset="5%"
												stopColor="hsl(38, 92%, 50%)"
												stopOpacity={0.4}
											/>
											<stop
												offset="95%"
												stopColor="hsl(38, 92%, 50%)"
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-border"
									/>
									<XAxis
										dataKey="date"
										tick={{fontSize: 11}}
										className="text-muted-foreground"
										tickFormatter={(v) =>
											new Date(v).toLocaleDateString("en", {
												month: "short",
												day: "numeric",
											})
										}
									/>
									<YAxis
										tick={{fontSize: 11}}
										className="text-muted-foreground"
										allowDecimals={false}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
										labelFormatter={(v) =>
											new Date(v).toLocaleDateString("en", {
												month: "long",
												day: "numeric",
											})
										}
									/>
									<Area
										type="monotone"
										dataKey="count"
										stroke="hsl(38, 92%, 50%)"
										fill="url(#colorReviews)"
										strokeWidth={2}
										name="Reviews"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
								No review data yet. Reviews will appear here as PRs are
								analyzed.
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Review Status</CardTitle>
					</CardHeader>
					<CardContent>
						{statusData.length > 0 ? (
							<ResponsiveContainer width="100%" height={240}>
								<BarChart data={statusData} layout="vertical">
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-border"
										horizontal={false}
									/>
									<XAxis
										type="number"
										tick={{fontSize: 11}}
										allowDecimals={false}
									/>
									<YAxis
										type="category"
										dataKey="name"
										tick={{fontSize: 12}}
										width={85}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Bar dataKey="value" radius={[0, 4, 4, 0]} name="Count">
										{statusData.map((entry, idx) => (
											<Cell key={idx} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
								No reviews yet
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Recent reviews */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base">Recent Reviews</CardTitle>
				</CardHeader>
				<CardContent>
					{reviews.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4">
							No reviews yet. Connect a repo and open a PR to get started.
						</p>
					) : (
						<div className="divide-y divide-border">
							{reviews.map((r) => (
								<div
									key={r.id}
									className="flex items-center justify-between py-3">
									<div>
										<p className="text-sm font-medium">
											{r.prTitle || `PR #${r.prNumber}`}
										</p>
										<p className="text-xs text-muted-foreground">
											{new Date(r.createdAt).toLocaleString()}
										</p>
									</div>
									<Badge
										variant={
											r.status === "completed"
												? "default"
												: r.status === "failed"
													? "destructive"
													: "secondary"
										}>
										{r.status}
									</Badge>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
