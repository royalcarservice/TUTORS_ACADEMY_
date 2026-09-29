#!/usr/bin/env bash
# Runs the identity migration and the RLS boundary test against a database.
#   DATABASE_URL=postgres://... scripts/test-rls.sh          # real Supabase project / supabase start
#   scripts/test-rls.sh --local                               # throwaway plain Postgres + auth shim (Tier 3)
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "${1:-}" == "--local" ]]; then
  PGBIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)
  DIR=$(mktemp -d /tmp/ta-pg.XXXX)
  "$PGBIN/initdb" -D "$DIR/data" -U postgres -A trust >/dev/null
  "$PGBIN/pg_ctl" -D "$DIR/data" -o "-p 54329 -k $DIR -c listen_addresses=''" -l "$DIR/log" start >/dev/null
  trap '"$PGBIN/pg_ctl" -D "$DIR/data" stop -m immediate >/dev/null; rm -rf "$DIR"' EXIT
  export DATABASE_URL="postgres://postgres@/postgres?host=$DIR&port=54329"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f supabase/local/auth_shim.sql
  echo "local Postgres $("$PGBIN/postgres" --version | awk '{print $3}') with auth shim (NOT Supabase Auth)"
fi
: "${DATABASE_URL:?set DATABASE_URL or pass --local}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f supabase/migrations/20260927000001_identity.sql
echo "migration applied"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f supabase/tests/rls_test.sql 2>&1 | grep -E "ok —|RLS:|FAILED|ERROR"
