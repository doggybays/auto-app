FROM node:20-bullseye AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --production
COPY client/package*.json client/ || true
RUN if [ -f client/package.json ]; then cd client && npm install && npm run build; fi
COPY . .

FROM node:20-bullseye-slim AS runtime
RUN apt-get update && apt-get install -y ffmpeg curl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app ./
RUN useradd --create-home appuser || true
USER appuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node","app.js"]
