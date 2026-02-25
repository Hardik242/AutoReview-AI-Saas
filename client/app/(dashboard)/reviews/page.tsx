"use client";

import {useQuery} from "@tanstack/react-query";
import {api, Review} from "@/lib/api";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Skeleton} from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	FileSearch,
	Search,
	Filter,
	ExternalLink,
	GitPullRequest,
	Clock,
	Bug,
	CheckCircle2,
	XCircle,
	Timer,
	Loader2,
	Sparkles,
	CircleDot,
	GitBranch,
} from "lucide-react";
import {useState, useMemo} from "react";

/* ── Helpers ─────────────────────────────────────────────────── */

const statusConfig: Record<
	string,
	{color: string; bg: string; icon: React.ElementType; label: string}
> = {
	completed: {
		color: "text-emerald-500",
		bg: "bg-emerald-500/10 border-emerald-500/20",
		icon: CheckCircle2,
		label: "Completed",
	},
	failed: {
		color: "text-red-500",
		bg: "bg-red-500/10 border-red-500/20",
		icon: XCircle,
		label: "Failed",
	},
	queued: {
		color: "text-amber-500",
		bg: "bg-amber-500/10 border-amber-500/20",
		icon: Timer,
		label: "Queued",
	},
	processing: {
		color: "text-blue-500",
		bg: "bg-blue-500/10 border-blue-500/20",
		icon: Loader2,
		label: "Processing",
	},
	pending: {
		color: "text-gray-500",
		bg: "bg-gray-500/10 border-gray-500/20",
		icon: CircleDot,
		label: "Pending",
	},
};

const getStatusConfig = (status: string) =>
	statusConfig[status] ?? statusConfig.pending;

const relativeTime = (date: string) => {
	const now = Date.now();
	const then = new Date(date).getTime();
	const diff = now - then;
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(date).toLocaleDateString("en", {
		month: "short",
		day: "numeric",
	});
};

const formatDuration = (start: string, end: string) => {
	const ms = new Date(end).getTime() - new Date(start).getTime();
	if (ms < 1000) return "<1s";
	const secs = Math.floor(ms / 1000);
	if (secs < 60) return `${secs}s`;
	const mins = Math.floor(secs / 60);
	const remSecs = secs % 60;
	return `${mins}m ${remSecs}s`;
};

/* ── Main Component ──────────────────────────────────────────── */

export default function Reviews() {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState("all");
	const [selected, setSelected] = useState<Review | null>(null);

	const {data: reviews = [], isLoading} = useQuery({
		queryKey: ["reviews"],
		queryFn: () => api.reviews.list(100, 0),
	});

	const filtered = useMemo(
		() =>
			reviews.filter((r) => {
				if (filter !== "all" && r.status !== filter) return false;
				if (
					search &&
					!r.prTitle?.toLowerCase().includes(search.toLowerCase()) &&
					!r.repoFullName?.toLowerCase().includes(search.toLowerCase())
				)
					return false;
				return true;
			}),
		[reviews, filter, search],
	);

	const stats = useMemo(() => {
		const total = reviews.length;
		const completed = reviews.filter((r) => r.status === "completed").length;
		const failed = reviews.filter((r) => r.status === "failed").length;
		const inProgress = reviews.filter(
			(r) => r.status === "queued" || r.status === "processing",
		).length;
		return {total, completed, failed, inProgress};
	}, [reviews]);

	/* ── Loading Skeleton ─────────────────────── */
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-4 w-64 mt-2" />
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{Array.from({length: 4}).map((_, i) => (
						<Skeleton key={i} className="h-20 rounded-xl" />
					))}
				</div>
				<div className="flex gap-3">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="space-y-2">
					{Array.from({length: 5}).map((_, i) => (
						<Skeleton key={i} className="h-24 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold">Reviews</h1>
				<p className="text-muted-foreground mt-1">
					Browse all AI code reviews across your repositories.
				</p>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<Card className="border-border/50">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<FileSearch className="w-5 h-5 text-primary" />
						</div>
						<div>
							<p className="text-2xl font-bold">{stats.total}</p>
							<p className="text-xs text-muted-foreground">Total</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/50">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
							<CheckCircle2 className="w-5 h-5 text-emerald-500" />
						</div>
						<div>
							<p className="text-2xl font-bold">{stats.completed}</p>
							<p className="text-xs text-muted-foreground">Completed</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/50">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
							<XCircle className="w-5 h-5 text-red-500" />
						</div>
						<div>
							<p className="text-2xl font-bold">{stats.failed}</p>
							<p className="text-xs text-muted-foreground">Failed</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/50">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
							<Loader2 className="w-5 h-5 text-blue-500" />
						</div>
						<div>
							<p className="text-2xl font-bold">{stats.inProgress}</p>
							<p className="text-xs text-muted-foreground">In Progress</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search by PR title or repository..."
						className="pl-9"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<Select value={filter} onValueChange={setFilter}>
					<SelectTrigger className="w-full sm:w-44">
						<Filter className="w-4 h-4 mr-2" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
						<SelectItem value="failed">Failed</SelectItem>
						<SelectItem value="queued">Queued</SelectItem>
						<SelectItem value="processing">Processing</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Results */}
			{filtered.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
							<FileSearch className="w-8 h-8 text-muted-foreground" />
						</div>
						<h3 className="font-semibold text-lg mb-1">
							{reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
						</h3>
						<p className="text-sm text-muted-foreground max-w-sm">
							{reviews.length === 0
								? "Reviews will appear here when PRs are opened on your connected repositories."
								: "Try changing your search or filter criteria."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-2">
					{filtered.map((review) => {
						const sc = getStatusConfig(review.status);
						const StatusIcon = sc.icon;
						return (
							<Card
								key={review.id}
								className="cursor-pointer hover:bg-muted/30 hover:border-primary/20 transition-all duration-200 group"
								onClick={() => setSelected(review)}>
								<CardContent className="p-4">
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0 flex-1">
											{/* Title row */}
											<div className="flex items-center gap-2 mb-1.5">
												<GitPullRequest className="w-4 h-4 text-muted-foreground shrink-0" />
												<p className="font-medium truncate group-hover:text-primary transition-colors">
													{review.prTitle || `PR #${review.prNumber}`}
												</p>
												<span className="text-xs text-muted-foreground font-mono shrink-0">
													#{review.prNumber}
												</span>
											</div>

											{/* Meta row */}
											<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground ml-6">
												{review.repoFullName && (
													<span className="flex items-center gap-1">
														<GitBranch className="w-3 h-3" />
														{review.repoFullName}
													</span>
												)}
												<span className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{relativeTime(review.createdAt)}
												</span>
												{review.issuesFound != null &&
													review.issuesFound > 0 && (
														<span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
															<Bug className="w-3 h-3" />
															{review.issuesFound} issue
															{review.issuesFound !== 1 ? "s" : ""}
														</span>
													)}
											</div>
										</div>

										{/* Right side badges */}
										<div className="flex items-center gap-2 shrink-0">
											<Badge
												variant="outline"
												className="text-[10px] px-1.5 py-0 h-5 font-normal">
												{review.reviewType === "full" ? (
													<>
														<Sparkles className="w-3 h-3 mr-0.5 text-amber-500" />
														Pro
													</>
												) : (
													"Free"
												)}
											</Badge>
											<Badge
												variant="outline"
												className={`${sc.bg} ${sc.color} border text-[11px] gap-1`}>
												<StatusIcon
													className={`w-3 h-3 ${review.status === "processing" ? "animate-spin" : ""}`}
												/>
												{sc.label}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Detail Dialog */}
			<Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
				<DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3 pr-6">
							<GitPullRequest className="w-5 h-5 text-primary shrink-0" />
							<span className="truncate">
								{selected?.prTitle || `PR #${selected?.prNumber}`}
							</span>
						</DialogTitle>
					</DialogHeader>
					{selected && (
						<div className="space-y-5">
							{/* Info grid */}
							<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
								<InfoCell label="Status">
									{(() => {
										const sc = getStatusConfig(selected.status);
										const StatusIcon = sc.icon;
										return (
											<Badge
												variant="outline"
												className={`${sc.bg} ${sc.color} border text-xs gap-1`}>
												<StatusIcon
													className={`w-3 h-3 ${selected.status === "processing" ? "animate-spin" : ""}`}
												/>
												{sc.label}
											</Badge>
										);
									})()}
								</InfoCell>
								<InfoCell label="Repository">
									{selected.repoFullName ? (
										<a
											href={`https://github.com/${selected.repoFullName}`}
											target="_blank"
											rel="noreferrer"
											className="font-medium text-sm truncate hover:text-primary transition-colors flex items-center gap-1"
											title={selected.repoFullName}>
											{selected.repoFullName.split("/")[1]}
											<ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
										</a>
									) : (
										<span className="text-sm">—</span>
									)}
								</InfoCell>
								<InfoCell label="Type">
									<Badge variant="outline" className="text-xs font-normal">
										{selected.reviewType === "full" ? (
											<>
												<Sparkles className="w-3 h-3 mr-1 text-amber-500" />
												Pro
											</>
										) : (
											"Free"
										)}
									</Badge>
								</InfoCell>
								<InfoCell label="Issues">
									<span className="text-sm font-medium">
										{selected.issuesFound ?? 0}
									</span>
								</InfoCell>
								<InfoCell label="Duration">
									<span className="text-sm font-medium">
										{selected.completedAt
											? formatDuration(selected.createdAt, selected.completedAt)
											: "—"}
									</span>
								</InfoCell>
							</div>

							{/* Timestamps */}
							<div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground px-1">
								<span>
									Created{" "}
									{new Date(selected.createdAt).toLocaleString("en", {
										month: "short",
										day: "numeric",
										year: "numeric",
										hour: "numeric",
										minute: "2-digit",
									})}
								</span>
								{selected.completedAt && (
									<span>
										Completed{" "}
										{new Date(selected.completedAt).toLocaleString("en", {
											month: "short",
											day: "numeric",
											year: "numeric",
											hour: "numeric",
											minute: "2-digit",
										})}
									</span>
								)}
							</div>

							{/* GitHub link */}
							{selected.repoFullName && (
								<a
									href={`https://github.com/${selected.repoFullName}/pull/${selected.prNumber}`}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-1">
									<ExternalLink className="w-4 h-4" />
									View Pull Request on GitHub
								</a>
							)}

							{/* AI Review Summary */}
							{selected.summary && (
								<div>
									<p className="text-sm font-semibold mb-3 flex items-center gap-2">
										<Sparkles className="w-4 h-4 text-primary" />
										AI Review Summary
									</p>
									<div className="text-sm bg-muted/30 border border-border rounded-xl p-5 prose prose-sm dark:prose-invert max-w-none overflow-x-auto [&_pre]:bg-muted [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_code]:text-xs [&_table]:text-xs">
										<div
											dangerouslySetInnerHTML={{
												__html: markdownToHtml(selected.summary),
											}}
										/>
									</div>
								</div>
							)}

							{/* Status messages */}
							{selected.status === "queued" && (
								<div className="flex items-center gap-3 text-sm text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
									<Timer className="w-5 h-5 text-amber-500 shrink-0" />
									This review is waiting in the queue and will be processed
									shortly.
								</div>
							)}
							{selected.status === "processing" && (
								<div className="flex items-center gap-3 text-sm text-primary bg-primary/5 border border-primary/20 rounded-lg p-4">
									<Loader2 className="w-5 h-5 animate-spin shrink-0" />
									AI is analyzing this pull request...
								</div>
							)}
							{selected.status === "failed" && !selected.summary && (
								<div className="flex items-center gap-3 text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
									<XCircle className="w-5 h-5 shrink-0" />
									This review failed to process. It may be retried
									automatically.
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

/* ── Sub-components ──────────────────────────────────────────── */

function InfoCell({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-muted/30 rounded-lg border border-border/50 p-3">
			<span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-medium mb-1.5">
				{label}
			</span>
			{children}
		</div>
	);
}

/* ── Minimal Markdown → HTML ─────────────────────────────────── */

function markdownToHtml(md: string): string {
	let html = md
		// Escape HTML entities first
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		// Code blocks (``` ... ```)
		.replace(
			/```(\w*)\n([\s\S]*?)```/g,
			(_m, lang, code) =>
				`<pre><code class="language-${lang}">${code.trim()}</code></pre>`,
		)
		// Inline code
		.replace(/`([^`]+)`/g, "<code>$1</code>")
		// Bold
		.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
		// Italic
		.replace(/\*(.+?)\*/g, "<em>$1</em>")
		// Headers
		.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
		.replace(/^### (.+)$/gm, "<h3>$1</h3>")
		.replace(/^## (.+)$/gm, "<h2>$1</h2>")
		.replace(/^# (.+)$/gm, "<h1>$1</h1>")
		// Horizontal rules
		.replace(/^---$/gm, "<hr />")
		// Unordered lists
		.replace(/^[*-] (.+)$/gm, "<li>$1</li>")
		// Ordered lists
		.replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
		// Links
		.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noreferrer">$1</a>',
		)
		// Line breaks → paragraphs (two newlines)
		.replace(/\n\n+/g, "</p><p>")
		// Single newlines within paragraphs
		.replace(/\n/g, "<br />");

	// Wrap consecutive <li> elements in <ul>
	html = html.replace(/(<li>[\s\S]*?<\/li>)(?:\s*<br \/>)*/g, "$1");
	html = html.replace(/((?:<li>[\s\S]*?<\/li>\s*)+)/g, "<ul>$1</ul>");

	return `<p>${html}</p>`;
}
