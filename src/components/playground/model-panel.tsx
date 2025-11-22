import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ModelOption } from "@/data/models";

interface ModelPanelProps {
  model: ModelOption;
}

export function ModelPanel({ model }: ModelPanelProps) {
  return (
    <Card className="space-y-4 border-dashed">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>{model.label}</CardTitle>
          <CardDescription>{model.bestFor}</CardDescription>
        </div>
        <Badge variant="outline">{model.provider}</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Release</dt>
          <dd className="font-medium">{model.release}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Context</dt>
          <dd className="font-medium">{model.contextWindow}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Best for</dt>
          <dd className="font-medium">{model.bestFor}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Max output</dt>
          <dd className="font-medium">{model.maxOutput.toLocaleString()} tokens</dd>
        </div>
      </dl>
    </Card>
  );
}
