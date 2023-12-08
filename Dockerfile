FROM node:16.16.0-alpine
USER root

RUN mkdir -p /app
WORKDIR /app
COPY . .

RUN npm install --force
CMD [ "node", "index.js" ]