FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY demo/package.json demo/package-lock.json ./
RUN npm ci
COPY demo/ ./
# Next.js serializes rewrites at build time. Railway supplies this service variable.
ARG BACKEND_URL=http://127.0.0.1:5050
ENV BACKEND_URL=$BACKEND_URL
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
CMD ["node", "server.js"]
