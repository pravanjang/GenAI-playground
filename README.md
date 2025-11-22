<div align="center">

# GenAI Playground

<p>
	<a href="https://nextjs.org/docs"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" /></a>
	<a href="https://pnpm.io"><img src="https://img.shields.io/badge/pnpm-9.12-ffbe0b?logo=pnpm" alt="pnpm" /></a>
	<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-0a7ea4" alt="License" /></a>
	<a href="https://hub.docker.com/"><img src="https://img.shields.io/badge/docker-ready-0db7ed?logo=docker" alt="Docker ready" /></a>
</p>

Play with the newest OpenAI hosted LLMs, tune sampling parameters, and ship prompt presets with a Shadcn-powered experience.

</div>

## ✨ Highlights

- **Modern stack** – Next.js 16 App Router, TailwindCSS 4, Shadcn UI primitives, lucide icons.
- **Streaming chat** – `/api/chat` wraps the official `ai` SDK + `@ai-sdk/openai` for low-latency responses.
- **Prompt presets** – Load curated presets that also adjust temperature/top-p for consistent experimentation.
- **Docker-ready** – Multi-stage `Dockerfile` produces a slim standalone image using PNPM + `next build`.

## 🧰 Tech choices (all released ≤ 6 months ago)

| Area | Library |
| --- | --- |
| UI kit | [shadcn/ui](https://ui.shadcn.com) components (Radix + Tailwind 4) |
| Chat runtime | [`ai@5`](https://sdk.vercel.ai/docs) + [`@ai-sdk/openai`](https://sdk.vercel.ai/docs/reference/ai-sdk-openai) |
| State helpers | React 19 + App Router hooks |
| Styling | Tailwind 4 + CSS radial gradients |
| Notifications | [`sonner`](https://sonner.emilkowal.ski/) |

## 🚀 Getting started

1. Install dependencies

	```bash
	pnpm install
	```

2. Create an env file

	```bash
	cp .env.example .env.local
	# fill in OPENAI_API_KEY
	```

3. Run dev server

	```bash
	pnpm dev
	```

Visit `http://localhost:3000` and load one of the prompt presets to see streaming responses.

## 🧪 Quality gates

```bash
pnpm lint          # ESLint flat config
pnpm test          # (placeholder should you add tests)
pnpm audit --prod  # ensure no high / medium vulnerabilities
```

## 🐳 Docker usage

```bash
docker build -t genai-playground .
docker run --rm -p 3000:3000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  genai-playground
```

The image uses `next build` standalone output so it only ships the compiled server bundle.

## 📁 Project structure

- `src/app/page.tsx` – main playground UI using the `useChat` hook.
- `src/app/api/chat/route.ts` – OpenAI proxy with streaming responses and runtime validation.
- `src/data` – model metadata + prompt presets.
- `src/components` – shadcn/ui primitives plus playground-specific components.

## 🖼️ Screenshot

![GenAI Playground UI](public/preview.png)

> Export a capture of the running app (e.g., via browser devtools screenshot) and save it as `public/preview.png` so the preview renders in docs and PRs.

## 🔐 Environment variables

| Name | Description |
| --- | --- |
| `OPENAI_API_KEY` | Server-side key used by the `/api/chat` route. Required for all environments. |

Happy experimenting! 🎨🤖
