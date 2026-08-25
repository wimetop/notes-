FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG REDIS_URL=redis://localhost:6379
ARG BETTER_AUTH_SECRET=build-time-secret-must-be-at-least-32-characters
ARG BETTER_AUTH_URL=http://localhost:3000
ARG TRASH_TTL_DAYS=30
ARG CRON_PURGE_SCHEDULE="0 3 * * *"
ARG PORT=3000
ENV DATABASE_URL=$DATABASE_URL REDIS_URL=$REDIS_URL BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET BETTER_AUTH_URL=$BETTER_AUTH_URL TRASH_TTL_DAYS=$TRASH_TTL_DAYS CRON_PURGE_SCHEDULE=$CRON_PURGE_SCHEDULE PORT=$PORT
RUN npm run build

FROM deps AS migrate
COPY . .
CMD ["npm", "run", "db:migrate"]

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist/worker ./dist/worker
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
