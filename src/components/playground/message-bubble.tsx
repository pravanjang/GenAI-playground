import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full flex-col gap-1", isUser ? "items-end" : "items-start")}
    >
      <Badge variant={isUser ? "success" : "outline"} className="capitalize">
        {role}
      </Badge>
      <div
        className={cn(
          "max-w-3xl rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/70 text-foreground",
        )}
      >
        <p className="whitespace-pre-line">{content}</p>
      </div>
      {timestamp ? (
        <span className="text-xs text-muted-foreground">
          {timestamp}
        </span>
      ) : null}
    </div>
  );
}
