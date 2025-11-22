# syntax=docker/dockerfile:1.6

FROM node:20.17-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM node:20.17-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN adduser -S nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
