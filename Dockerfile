FROM node as builder

# Create app directory
WORKDIR /src

# Install app dependencies
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN ls -la

FROM node:slim

ENV NODE_ENV production
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm ci --production

COPY --from=builder /src/dist ./dist

EXPOSE 8080
CMD [ "node", "dist/bot.js" ]