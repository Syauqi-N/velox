#!/bin/sh
set -e

echo "▶ Running Prisma migrations..."
node node_modules/prisma/build/cli.js migrate deploy --schema prisma/schema.prisma

echo "▶ Starting Velox server..."
exec node server.js
