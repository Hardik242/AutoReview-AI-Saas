import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useEffect, useState } from "react";

const codeLines = [
  { num: 12, content: "  const data = await fetch(url);", type: "context" as const },
  { num: 13, content: '  const json = JSON.parse(data);', type: "removed" as const },
  { num: 13, content: "  const json = await data.json();", type: "added" as const },
  { num: 14, content: "  return json.results;", type: "context" as const },
];

const aiComment = "⚠️ Bug: `JSON.parse()` expects a string, but `fetch()` returns a Response object. Use `.json()` instead.";

export function CodeDiffMockup() {
  const [showComment, setShowComment] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShowComment(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showComment) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= aiComment.length) {
        setDisplayedText(aiComment.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [showComment]);

  return (
    <div className="glass rounded-xl overflow-hidden shadow-2xl shadow-primary/10">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-muted-foreground ml-2 font-mono">api/handler.ts</span>
      </div>

      {/* Code */}
      <div className="p-4 font-mono text-sm space-y-0">
        {codeLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.15 }}
            className={`flex items-center px-3 py-0.5 rounded-sm ${
              line.type === "removed"
                ? "bg-destructive/10 text-destructive"
                : line.type === "added"
                ? "bg-success/10 text-success"
                : "text-muted-foreground"
            }`}
          >
            <span className="w-8 text-right mr-4 text-muted-foreground/50 select-none text-xs">
              {line.num}
            </span>
            <span className="mr-2 select-none text-xs">
              {line.type === "removed" ? "−" : line.type === "added" ? "+" : " "}
            </span>
            <span>{line.content}</span>
          </motion.div>
        ))}
      </div>

      {/* AI Comment */}
      {showComment && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">AutoReview AI</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {displayedText}
            <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" />
          </p>
        </motion.div>
      )}
    </div>
  );
}
