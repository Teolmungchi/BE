# 빌드 단계
FROM node:20.18.0-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build

# 실행 단계
FROM node:20.18.0-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
COPY --from=builder /app/dist ./dist
COPY .env ./
EXPOSE 3000
CMD ["node", "dist/main"]