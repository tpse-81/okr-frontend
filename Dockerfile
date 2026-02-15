FROM node:22-alpine

WORKDIR /app
COPY package.json ./

RUN npm install

COPY . .

RUN npm run build && npm prune --production && npm cache clean --force
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "build"]
