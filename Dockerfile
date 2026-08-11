# syntax=docker/dockerfile:1.7
ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE} AS base
WORKDIR /app

# ---- deps (full, with dev) ----
# Lock dependencies deterministically with npm ci so node_modules is reproducible
# across arches and CI runs. A persistent npm cache speeds things up without
# changing the installed tree.
FROM base AS deps
RUN apk --no-cache upgrade && apk --no-cache add python3 make g++

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# ---- prod-deps (production only) ----
# Separate stage with only production dependencies. This gives us a complete
# node_modules tree (including prisma CLI and ALL its transitive deps like
# effect, c12, etc.) without devDependencies, to overlay on the runner.
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# ---- builder ----
# Copy installed node_modules from the deps stage (guaranteed to exist), then
# generate the Prisma client and build Next.js standalone output.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

# Prisma generate needs a DATABASE_URL only when introspecting; for plain
# client generation a placeholder is enough and avoids CI secret leakage.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner ----
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="velox"

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone server output (includes a traced node_modules tree under /app).
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Overlay full production node_modules on top of the standalone-traced tree.
# This ensures the Prisma CLI has ALL its transitive deps (effect, c12,
# empathic, etc.) needed for `prisma migrate deploy` at runtime.
COPY --from=prod-deps /app/node_modules ./node_modules

# Generated Prisma client (produced by `prisma generate` in the builder).
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Prisma schema + config + migrations (needed by `prisma migrate deploy` at startup).
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Entrypoint: runs prisma migrate deploy, then starts the server.
COPY --chmod=0755 docker-entrypoint.sh ./entrypoint.sh

RUN chown -R node:node /app
USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
