#!/bin/bash
# THE RECOVERY PATH (Phase 6 · Step 6 · Part 6). From an empty sandbox to every
# harness green, EACH STEP TIMED and appended to audit/cold-start.json.
#   bash audit/cold-start.sh            (needs .env.local present; never prints it)
# Steps: toolchain · install · chrome · build (npm run build = prebuild validator
# + next build) · migrations applied? · test accounts present? · prod server ·
# dev server (for /dev/* harness routes) · every harness in check mode.
set -u
cd "$(dirname "$0")/.."
ROOT=$PWD
OUT=audit/cold-start.json
export PATH=$HOME/.local/node22/bin:$PATH NODE_PATH=$ROOT/node_modules
echo '{"startedAt":"'"$(date -u +%FT%TZ)"'","steps":[' > $OUT
first=1
step() { # name, command...  → appends {name, seconds, exit, tail}
  local name=$1; shift
  local t0=$(date +%s.%N)
  local log=/tmp/cold-$(echo "$name" | tr -c 'a-zA-Z0-9' '_').log
  "$@" > "$log" 2>&1; local ec=$?
  local t1=$(date +%s.%N)
  local secs=$(python3 -c "print(round($t1-$t0,1))")
  local tail=$(grep -v "Warning\|experimental\|trace-warnings" "$log" | tail -3 | python3 -c 'import sys,json;print(json.dumps(sys.stdin.read()[-400:]))')
  [ $first = 1 ] || echo ',' >> $OUT; first=0
  echo "{\"name\":$(python3 -c "import json;print(json.dumps('$name'))"),\"seconds\":$secs,\"exit\":$ec,\"tail\":$tail}" >> $OUT
  printf "%-46s %7ss  exit %s\n" "$name" "$secs" "$ec"
}
step "1 toolchain: node 22 present (install if not)" bash -c 'if [ ! -x ~/.local/node22/bin/node ]; then mkdir -p ~/.local && cd /tmp && curl -fsSL https://nodejs.org/dist/v22.12.0/node-v22.12.0-linux-x64.tar.xz -o node22.tar.xz && tar -xJf node22.tar.xz && rm -rf ~/.local/node22 && mv node-v22.12.0-linux-x64 ~/.local/node22; fi; node -v'
step "2 chrome system libs + psql (apt)" bash -c 'sudo apt-get update -qq >/dev/null 2>&1; sudo apt-get install -y -qq libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 postgresql-client >/dev/null 2>&1 || true; which psql'
step "3 npm ci (project deps)" bash -c 'npm ci --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund >/dev/null; ls node_modules | wc -l'
step "4 harness deps (puppeteer, axe, lighthouse — not in package.json)" bash -c 'npm install --no-save --no-audit --no-fund puppeteer @axe-core/puppeteer lighthouse >/dev/null 2>&1; npx puppeteer browsers install chrome 2>&1 | tail -1'
step "5 npm run build (prebuild validator + next build)" bash -c 'npm run build 2>&1 | grep -E "lever combinations|ALL SUBJECTS VALID|Compiled|Generating static|error" | head -5'
cat > /tmp/cold-migrations.sql <<'SQL'
select string_agg(t||':'||c, ' ' order by t) from (select tablename t, count(*) c from pg_policies where schemaname='public' group by tablename) x;
select count(*)||' of 5 tables' from information_schema.tables where table_schema='public' and table_name in ('profiles','enrolments','environment_state','relationships','environment_settings');
SQL
step "6 migrations applied? (tables + policies on the live DB)" bash -c 'set -a; . ./.env.local; set +a; psql "$DATABASE_URL" -Atf /tmp/cold-migrations.sql'
step "7 test accounts present? (fixture, is_test_account, no real identity)" bash -c 'set -a; . ./.env.local; set +a; psql "$DATABASE_URL" -Atc "select (select count(*) from public.profiles where is_test_account) as test, (select count(*) from public.profiles where not is_test_account) as real, (select count(*) from public.relationships) as relationships, (select count(*) from public.environment_settings) as settings"'
step "8 prod server up (:3100)" bash -c 'for pid in $(ss -ltnp 2>/dev/null | grep ":3100 " | grep -o "pid=[0-9]*" | cut -d= -f2 | sort -u); do kill $pid; done; sleep 1; (nohup npx next start -p 3100 -H 0.0.0.0 > /tmp/prod.log 2>&1 &); for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3100/ && break; sleep 1; done; curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/'
step "9 dev server up (:3000, /dev/* routes)" bash -c 'for pid in $(ss -ltnp 2>/dev/null | grep ":3000 " | grep -o "pid=[0-9]*" | cut -d= -f2 | sort -u); do kill $pid; done; sleep 1; (nohup npx next dev -p 3000 > /tmp/dev.log 2>&1 &); for i in $(seq 1 60); do curl -sf -o /dev/null http://localhost:3000/dev/tokens && break; sleep 1; done; curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dev/tokens'
step "10 subjects: validate + sql check + import guard" bash -c 'node scripts/validate-subjects.mjs | tail -1; node scripts/check-subject-sql.mjs | tail -1; node scripts/check-subject-imports.mjs | tail -1'
step "11 RLS (76 assertions, live DB, transaction)" bash -c 'set -a; . ./.env.local; set +a; bash scripts/test-rls.sh 2>&1 | grep -E "assertions passed|FAILED|ERROR" | tail -2'
step "12 visibility (real path: tutor JWT through PostgREST)" bash -c 'set -a; . ./.env.local; set +a; node scripts/test-tutor-visibility.mjs 2>&1 | tail -3'
step "13 progress + next-action (pure)" bash -c 'node --import ./scripts/ts-loader.mjs scripts/test-progress.mjs 2>&1 | tail -1; node --import ./scripts/ts-loader.mjs scripts/test-next-action.mjs 2>&1 | tail -1'
step "14 attacks (7 files, exact TS codes)" bash -c 'node audit/attacks.cjs 2>&1 | tail -1'
step "15 page harness --check" bash -c 'node audit/page.cjs --check 2>&1 | grep -cE "^PASS"; node audit/page.cjs --check >/dev/null 2>&1; echo exit=$?'
step "16 shell harness --check" bash -c 'node audit/shell.cjs --check 2>&1 | grep -cE "^PASS"; node audit/shell.cjs --check 2>&1 | grep -E "^FAIL|DIFF" | head -3'
step "17 environment harness --check" bash -c 'node audit/environment.cjs --check 2>&1 | grep -cE "^PASS"; node audit/environment.cjs --check 2>&1 | grep -iE "undeclared|declared exceptions|no diffs" | tail -1'
step "18 permissions harness" bash -c 'node audit/permissions.cjs 2>&1 | grep -cE "^PASS"; node audit/permissions.cjs 2>&1 | grep -E "^FAIL" | head -3'
step "19 states harness --check" bash -c 'node audit/states.cjs --check 2>&1 | grep -cE "^PASS"; node audit/states.cjs --check 2>&1 | grep -E "^FAIL|DIFF" | head -3'
step "20 5.8 gate harness --check" bash -c 'node audit/gate.cjs --check 2>&1 | grep -cE "^PASS"; node audit/gate.cjs --check 2>&1 | grep -E "^FAIL" | head -3'
step "21 tutor harness --check" bash -c 'node audit/tutor.cjs --check 2>&1 | grep -cE "^PASS"; node audit/tutor.cjs --check 2>&1 | grep -E "^FAIL|DIFFS|no diffs" | head -3'
step "22 relationship harness --check" bash -c 'node audit/relationship.cjs --check 2>&1 | grep -cE "^PASS"; node audit/relationship.cjs --check 2>&1 | grep -E "^FAIL|DIFFS|no diffs" | head -3'
step "23 levers harness --check" bash -c 'node audit/levers.cjs --check 2>&1 | grep -cE "^PASS"; node audit/levers.cjs --check 2>&1 | grep -E "^FAIL|ALL GATES|DIFFS" | head -3'
step "24 identity matrix --check" bash -c 'node audit/identity-matrix.cjs --check 2>&1 | grep -cE "^PASS"; node audit/identity-matrix.cjs --check 2>&1 | grep -E "^FAIL" | head -3'
echo '],"finishedAt":"'"$(date -u +%FT%TZ)"'"}' >> $OUT
python3 - <<'EOF'
import json;d=json.load(open("audit/cold-start.json"));t=sum(s["seconds"] for s in d["steps"]);d["totalSeconds"]=round(t,1);json.dump(d,open("audit/cold-start.json","w"),indent=1)
print("TOTAL", round(t,1),"s =", round(t/60,1),"min; failures:", [s["name"] for s in d["steps"] if s["exit"]!=0])
EOF
