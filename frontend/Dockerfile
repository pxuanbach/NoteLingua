FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install

COPY . .

ENV PORT=3000
ENV NODE_ENV=test

EXPOSE $PORT

CMD ["pnpm", "run", "dev"]