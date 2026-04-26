FROM node:20-alpine

RUN apk add --no-cache tini

# Drop privileges to the unprivileged "node" user baked into the official image.
USER node
WORKDIR /home/node/app

# Workspace manifests first for layer caching.
COPY --chown=node:node package.json ./
COPY --chown=node:node tsconfig.base.json ./
COPY --chown=node:node packages/api/package.json ./packages/api/
COPY --chown=node:node packages/ui/package.json ./packages/ui/

RUN yarn install --network-timeout 600000

# Source.
COPY --chown=node:node packages/api ./packages/api
COPY --chown=node:node packages/ui ./packages/ui

WORKDIR /home/node/app/packages/api

ENV NODE_ENV=development
EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["yarn", "start"]
