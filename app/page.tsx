import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center justify-center gap-8 p-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Model Playground
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            An interactive playground to experiment with multiple large language
            models including GPT-4, Claude, and Gemini.
          </p>
        </div>
        <Link href={"/playground" as Route}>
          <Button size="lg" className="text-base">
            Open Playground
          </Button>
        </Link>
      </main>
    </div>
  );
}
