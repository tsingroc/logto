# Build stage
FROM node:16-alpine as builder
WORKDIR /etc/logto
ENV CI=true
COPY . .

# PATCH(tsingroc): 换国内源
RUN npm config --global set registry https://registry.npmmirror.com/ \
    && sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
# Install toolchain
RUN npm install --global pnpm@^7.2.1
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#node-gyp-alpine
RUN apk add --no-cache python3 make g++

# Install dependencies and build
RUN pnpm i
RUN pnpm -- lerna run build --stream

# Prune dependencies for production
RUN rm -rf node_modules packages/*/node_modules
RUN NODE_ENV=production pnpm i

# Clean up
RUN rm -rf .parcel-cache pnpm-*.yaml

# Seal stage
FROM node:16-alpine as app
WORKDIR /etc/logto
COPY --from=builder /etc/logto .
EXPOSE 3001
ENV NO_INQUIRY true
ENTRYPOINT ["npm", "start"]
