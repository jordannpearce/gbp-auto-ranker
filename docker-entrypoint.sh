#!/bin/sh
set -e
DATA_DIR="${DATA_DIR:-/data}"
mkdir -p "$DATA_DIR"
if [ "$(id -u)" = "0" ]; then
  chmod 777 "$DATA_DIR" 2>/dev/null || true
fi
exec node server.js
