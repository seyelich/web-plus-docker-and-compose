FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build \
    && rm -rf ./src \
    && rm -rf node ./node_modules

FROM node:16-alpine AS backend
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY ./ecosystem.config.js ./
RUN npm i --omit=dev --no-audit --no-fund && npm i pm2 -g
COPY --from=builder /app/dist ./dist/

EXPOSE 4000

CMD ["pm2-runtime", "start", "./ecosystem.config.js"] 