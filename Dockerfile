FROM node:24-alpine AS build
WORKDIR /app

# Empty builds the whole application; otherwise the name of a folder in src/modules.
ARG VITE_APP_MODULE=
ENV VITE_APP_MODULE=$VITE_APP_MODULE

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN if [ -n "$VITE_APP_MODULE" ]; then \
      case "$VITE_APP_MODULE" in *[!A-Za-z0-9_-]*) bad=1 ;; esac; \
      [ -z "$bad" ] && [ -d "src/modules/$VITE_APP_MODULE" ] \
        || { echo "Unknown module: '$VITE_APP_MODULE'" >&2; exit 1; }; \
    fi
RUN npx vue-tsc --build && npx vite build --outDir dist/app

FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# also work with company registry
FROM gcr.io/distroless/nodejs24-debian13:nonroot
ENV NODE_ENV=production
WORKDIR /app

COPY --chown=nonroot:nonroot package.json ./
COPY --from=prod-deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot server ./server
COPY --from=build --chown=nonroot:nonroot /app/dist/app ./dist/app

EXPOSE 3000
ENTRYPOINT ["/nodejs/bin/node", "server/index.ts"]
