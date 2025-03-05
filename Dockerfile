# 빌드 단계
FROM node:20.18.0-alpine AS builder
WORKDIR /app

# package.json과 package-lock.json 복사 후 의존성 설치
COPY package.json package-lock.json ./
RUN npm install

# 전체 소스 복사 및 빌드 실행
COPY . .
RUN npm run build

# 실행 단계
FROM node:20.18.0-alpine AS runner
WORKDIR /app

# tini 설치 (컨테이너 종료 처리를 위해)
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# 프로덕션 의존성 설치를 위해 package.json과 package-lock.json 복사
COPY package.json package-lock.json ./
RUN npm install --production

# 빌드 산출물 복사
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]