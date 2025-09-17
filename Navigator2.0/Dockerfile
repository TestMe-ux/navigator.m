# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /app

ARG ENV=qa
# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .

# Use MY_ENV_VARIABLE in subsequent instructions, e.g., in a RUN command
RUN echo "The value is: ${ENV}"
RUN cp .env.${ENV} .env

RUN npm run build

# Stage 2: Run Next.js app in production
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Expose Next.js default port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]
