FROM --platform=linux/amd64 node:20-alpine AS base

WORKDIR /app

ENV NPM_CONFIG_UPDATE_NOTIFIER false

COPY package.json package-lock.json ./

RUN npm i

COPY . . 

RUN npm run build

EXPOSE 3000

CMD npm run start