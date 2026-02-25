"use client";

import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {api, GitHubRepo} from "@/lib/api";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {
	Plus,
	Trash2,
	Loader2,
	FolderGit2,
	Lock,
	Globe,
	Search,
} from "lucide-react";

import {useState, useMemo} from "react";
import {toast} from "sonner";

export default function Repositories() {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const {data: repos = [], isLoading} = useQuery({
		queryKey: ["repos"],
		queryFn: api.repos.list,
	});

	const {data: githubRepos = [], isLoading: ghLoading} = useQuery({
		queryKey: ["github-repos"],
		queryFn: api.repos.github,
		enabled: open,
	});

	const availableRepos = useMemo(() => {
		const connectedIds = new Set(repos.map((r) => r.githubRepoId));
		let filtered = githubRepos.filter((r) => !connectedIds.has(r.id));
		if (search) {
			filtered = filtered.filter((r) =>
				r.fullName.toLowerCase().includes(search.toLowerCase()),
			);
		}
		return filtered;
	}, [githubRepos, repos, search]);

	const connectMutation = useMutation({
		mutationFn: (repo: GitHubRepo) => api.repos.connect(repo.id, repo.fullName),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["repos"]});
			queryClient.invalidateQueries({queryKey: ["stats"]});
			toast.success("Repository connected!");
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const disconnectMutation = useMutation({
		mutationFn: (id: number) => api.repos.disconnect(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["repos"]});
			queryClient.invalidateQueries({queryKey: ["stats"]});
			toast.success("Repository disconnected");
		},
		onError: (err: Error) => toast.error(err.message),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-48">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Repositories</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Connect your GitHub repositories to enable automated code reviews.
					</p>
				</div>

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="w-4 h-4 mr-2" /> Connect Repository
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-lg max-h-[80vh]">
						<DialogHeader>
							<DialogTitle>Connect a Repository</DialogTitle>
							<DialogDescription>
								Select a repository from your GitHub account to connect.
							</DialogDescription>
						</DialogHeader>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search repositories..."
								className="pl-9"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<div className="overflow-y-auto max-h-80 space-y-1 mt-2">
							{ghLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
									<span className="ml-2 text-sm text-muted-foreground">
										Loading GitHub repos...
									</span>
								</div>
							) : availableRepos.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">
									{search
										? "No matching repositories found."
										: "All your repositories are already connected!"}
								</p>
							) : (
								availableRepos.map((repo) => (
									<button
										key={repo.id}
										className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
										onClick={() => connectMutation.mutate(repo)}
										disabled={connectMutation.isPending}>
										{repo.private ? (
											<Lock className="w-4 h-4 text-muted-foreground shrink-0" />
										) : (
											<Globe className="w-4 h-4 text-muted-foreground shrink-0" />
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{repo.fullName}
											</p>
											{repo.description && (
												<p className="text-xs text-muted-foreground truncate">
													{repo.description}
												</p>
											)}
										</div>
										{repo.language && (
											<Badge variant="outline" className="text-xs shrink-0">
												{repo.language}
											</Badge>
										)}
									</button>
								))
							)}
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{repos.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<FolderGit2 className="w-12 h-12 text-muted-foreground mb-4" />
						<h3 className="font-semibold mb-1">No repositories connected</h3>
						<p className="text-sm text-muted-foreground max-w-sm">
							Click "Connect Repository" to link your GitHub repos and start
							getting automated AI code reviews on your PRs.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-3">
					{repos.map((repo) => (
						<Card key={repo.id}>
							<CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
								<div className="flex items-center gap-3 min-w-0">
									<FolderGit2 className="w-5 h-5 text-primary shrink-0" />
									<div className="min-w-0">
										<p className="font-medium truncate">{repo.fullName}</p>
										<p className="text-xs text-muted-foreground">
											Connected {new Date(repo.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant={repo.isActive ? "default" : "secondary"}>
										{repo.isActive ? "Active" : "Inactive"}
									</Badge>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => disconnectMutation.mutate(repo.id)}
										disabled={disconnectMutation.isPending}>
										<Trash2 className="w-4 h-4 text-destructive" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
