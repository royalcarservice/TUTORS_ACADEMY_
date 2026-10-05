# HANDOVER PROMPT — paste into the new chat, unchanged

```
TUTORS ACADEMY — WORKSPACE HANDOVER. One window. READ-ONLY.

Context: this chat is fresh; the previous chat's sandbox wedged. I need a complete, portable export of
this workspace so work can continue here without guessing.

FIRST — STATE WHAT EXISTS. Run exactly these and paste raw:
  pwd; git log --oneline -5; git status --porcelain; git remote -v; ls
IF THIS IS NOT THE TUTORS ACADEMY REPO (no git history, no prompts/ directory): STOP. Say so plainly,
list what IS here, and change nothing. NO setup, NO install, NO rebuild, NO guessing.

IF IT IS THE REPO, DO THREE THINGS:

1. ZIP IT — excluding node_modules, .next, .git, .env*, and any run output:
   zip -r /home/user/handover-$(git rev-parse --short HEAD).zip . \
     -x 'node_modules/*' '.next/*' '.git/*' '.env*' 'coverage/*' 'dist/*' 'out/*'

2. WRITE /home/user/HANDOVER.md, in this order:
   a. HEAD hash + branch + subject; git status --porcelain RAW
   b. Word from git ls-files | wc -l; then git ls-files (full list)
   c. prompts/ directory listing (names + sizes), and every PHASE*_REPORT*.md on disk with its commit
   d. FULL CONTENTS of: docs/DECISIONS.md · the exceptions register (wherever it lives) ·
      docs/TUTOR_DISTANCE.md · docs/TUTOR_VISIBILITY.md · docs/STATE_LANGUAGE.md ·
      docs/PROGRESS_LANGUAGE.md · prompts/README.md · docs/proposed/*.sql
      (truncate any single file at 400 lines and SAY WHERE YOU TRUNCATED)
   e. audit/*.cjs and scripts/test-*.{sh,mjs}: one line each — name + what it asserts
   f. Test account names · migration filenames · env var NAMES ONLY (never any value)
   g. The last five commit messages verbatim: git log -5 --format='%h %s'
3. PRINT to chat: path + byte size of HANDOVER.md, path + byte size of the zip, and the HEAD hash.

CONFIRM in one line: no secret value was printed anywhere, and .env.local is NOT inside the zip.

RULES: read-only. No builds, no installs, no servers, no migrations, no commits, no edits beyond the two
files above. Paste what is there — do not summarise what you have not read.
```

**After it runs:** download the zip (or the `HANDOVER.md`) from the workspace and attach it to whichever
chat you continue in. That single file is the entire state — repo, prompts, reports, docs.
