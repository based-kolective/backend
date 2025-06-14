# Use official Node.js 20 image
FROM node:20 AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the app
RUN pnpm build

# Production image
FROM node:20 AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port (default NestJS port)
EXPOSE 3000

# Run Prisma migrations and start the app
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"] 

