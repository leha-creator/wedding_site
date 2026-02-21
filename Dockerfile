# Stage 1: Build — better-sqlite3 requires node-gyp (Python, make, g++)
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Runtime — copy compiled node_modules, no build tools needed
FROM node:20-slim

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
