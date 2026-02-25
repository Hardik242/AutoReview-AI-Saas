import {useQuery} from "@tanstack/react-query";
import {api, Review} from "@/lib/api";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
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
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	FileSearch,
	Loader2,
	Search,
	Filter,
	ExternalLink,
	GitPullRequest,
} from "lucide-react";
import {useState, useMemo} from "react";

const statusVariant = (status: string) => {
	switch (status) {
		case "completed":
			return "default" as const;
		case "failed":
			return "destructive" as const;
		default:
			return "secondary" as const;
	}
};

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
				if (search && !r.prTitle?.toLowerCase().includes(search.toLowerCase()))
					return false;
				return true;
			}),
		[reviews, filter, search],
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-48">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Reviews</h1>
				<p className="text-muted-foreground mt-1">
					Browse all AI code reviews across your repositories.
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search by PR title..."
						className="pl-9"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<Select value={filter} onValueChange={setFilter}>
					<SelectTrigger className="w-full sm:w-40">
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
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<FileSearch className="w-12 h-12 text-muted-foreground mb-4" />
						<h3 className="font-semibold mb-1">
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
				<div className="grid gap-2">
					{filtered.map((review) => (
						<Card
							key={review.id}
							className="cursor-pointer hover:bg-muted/30 transition-colors"
							onClick={() => setSelected(review)}>
							<CardContent className="flex items-center justify-between p-4">
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<GitPullRequest className="w-4 h-4 text-muted-foreground" />
										<p className="font-medium truncate">
											{review.prTitle || `PR #${review.prNumber}`}
										</p>
									</div>
									<p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
										<span>{review.repoFullName || "Unknown Repository"}</span>
										<span>•</span>
										<span>{new Date(review.createdAt).toLocaleString()}</span>
									</p>
								</div>
								<Badge variant={statusVariant(review.status)}>
									{review.status}
								</Badge>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Detail Dialog */}
			<Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
				<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center justify-between pr-6">
							<span className="truncate">
								{selected?.prTitle || `PR #${selected?.prNumber}`}
							</span>
							{selected?.repoFullName && (
								<a
									href={`https://github.com/${selected.repoFullName}/pull/${selected.prNumber}`}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary transition-colors">
									<ExternalLink className="w-4 h-4" />
									View on GitHub
								</a>
							)}
						</DialogTitle>
					</DialogHeader>
					{selected && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-border">
								<div>
									<span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
										Status
									</span>
									<Badge variant={statusVariant(selected.status)}>
										{selected.status}
									</Badge>
								</div>
								<div>
									<span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
										Repository
									</span>
									<p
										className="font-medium truncate"
										title={selected.repoFullName || ""}>
										{selected.repoFullName || "—"}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
										Format
									</span>
									<p className="font-medium capitalize">
										{selected.reviewType === "full"
											? "Pro (Markdown)"
											: "Basic"}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
										Created
									</span>
									<p className="text-xs mt-1">
										{new Date(selected.createdAt).toLocaleString()}
									</p>
								</div>
							</div>

							{selected.summary && (
								<div>
									<p className="text-sm font-semibold mb-3 flex items-center gap-2">
										AI Review Output
									</p>
									<div className="text-sm bg-muted/40 border border-border rounded-lg p-5 whitespace-pre-wrap font-mono relative">
										{selected.summary}
									</div>
								</div>
							)}

							{selected.status === "queued" && (
								<p className="text-sm text-muted-foreground text-center py-4">
									This review is waiting in the queue and will be processed
									shortly.
								</p>
							)}
							{selected.status === "processing" && (
								<div className="flex items-center justify-center gap-2 text-sm text-primary py-4">
									<Loader2 className="w-5 h-5 animate-spin" /> AI is analyzing
									this PR...
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
