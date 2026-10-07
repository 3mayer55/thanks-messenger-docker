FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY public ./public
RUN mkdir -p /data && chown node:node /data
ENV DATA_DIR=/data PORT=3000
USER node
EXPOSE 3000
VOLUME /data
CMD ["node","server.js"]
