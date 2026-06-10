# ============================================================
# Quanta — React + Vite Frontend Dockerfile
# Runtime: Bun
# ============================================================

FROM oven/bun:1 AS base
WORKDIR /app

# ============================================================
# Dependencies
# ============================================================
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ============================================================
# Development
# ============================================================
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev", "--", "--host"]
