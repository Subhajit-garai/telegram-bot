# docker build command
# docker build -t subhajitgarai04/tele_bot:0.0.4 .

FROM node:lts-alpine AS builder

WORKDIR /build

COPY package*.json tsconfig.json  ./
RUN npm install 
COPY .  .



RUN npm run build

FROM  node:lts-alpine

ENV NODE_ENV production

WORKDIR /app

COPY  package*.json .
# RUN npm install --production

COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist

CMD ["node", "dist/index.js"]

