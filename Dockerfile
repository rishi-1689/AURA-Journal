# Use Node 22 Alpine — small image, matches better-sqlite3's supported versions
FROM node:22-alpine

# better-sqlite3 is a native addon (C++ code).
# It needs these build tools to compile when running `npm ci` inside the container.
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first. Docker caches each layer — if these files
# haven't changed, it skips re-running npm ci on the next build.
COPY package*.json ./

# Install ALL deps (dev too — we need tsx and vite to run the dev server)
RUN npm ci

# Copy the rest of the source code.
# Note: node_modules is excluded via .dockerignore so this COPY is fast.
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]