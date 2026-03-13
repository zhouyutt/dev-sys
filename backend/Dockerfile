FROM node:18-alpine

WORKDIR /app

ARG NPM_REGISTRY=
ENV NODE_ENV=production

COPY package*.json ./

RUN if [ -n "$NPM_REGISTRY" ]; then npm config set registry "$NPM_REGISTRY"; fi \
    && npm ci --omit=dev \
    && npm cache clean --force \
    && apk add --no-cache busybox-extras

COPY . .

RUN mkdir -p uploads

EXPOSE 3000

RUN cat > /usr/local/bin/docker-entrypoint.sh <<'EOF'
#!/bin/sh
set -e

if [ -n "${DB_HOST:-}" ]; then
  host="${DB_HOST}"
  port="${DB_PORT:-3306}"

  echo "Waiting for MySQL at ${host}:${port}..."
  until nc -z "$host" "$port"; do
    >&2 echo "MySQL is unavailable - sleeping"
    sleep 2
  done
fi

exec "$@"
EOF

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
