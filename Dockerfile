# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM ${NODE_IMAGE} AS prod-deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production
# package.json is needed at runtime: it declares the app as an ES module.
COPY --from=prod-deps /app/package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["wget", "-qO-", "http://127.0.0.1:3000/api/v1/health"]
CMD ["node", "dist/main.js"]
