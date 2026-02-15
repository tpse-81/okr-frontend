#!/bin/sh

# Replace the backend url with the one set via environment variables,
# e.g. passed via `docker run -e PUBLIC_API_URL=https://example.com`
DEFAULT_API_URL="http://localhost:8000"
PUBLIC_API_URL=${PUBLIC_API_URL:-$DEFAULT_API_URL}

# input for xargs has to be null-separated (not newline) for busybox xargs
grep -rl "$DEFAULT_API_URL" ./build | tr '\n' '\0' | xargs -0 sed -i "s@$DEFAULT_API_URL@$PUBLIC_API_URL@g"
sed -i "s@$DEFAULT_API_URL@$PUBLIC_API_URL@g" .env

# Start the app
exec node build
