# READ THIS FIRST (agents: Claude and any other agent)

The user (jnc/albert) switches between different AI agents on this project. This CONTEXT folder is how agents
talk to each other and keep the project state. Treat it as the source of truth.

## Rules for every agent
1. At the start of a session read, in this order: README_FOR_AGENTS.md, HANDOFF.md, PROGRESS.md,
   REQUIREMENTS.md, ARCHITECTURE.md.
2. After EVERY meaningful change (code written, decision made, bug found, user answered something):
   - update PROGRESS.md (move items between Done / In progress / Next, newest info wins)
   - add an entry at the TOP of HANDOFF.md: date, agent name, what you did, what is broken/untested, what to do next
   - record new technical decisions in ARCHITECTURE.md (with the reason)
   - record anything new the user told you in REQUIREMENTS.md (never delete the user's original words)
3. Be honest in PROGRESS.md about what is tested vs only written. Do not mark something done if it was never run.
4. Keep the app dependency-free: vanilla HTML/CSS/JS, ES modules, NO build step, so any agent can edit it.
5. User style: casual, direct, wants concise practical answers. Ask at most a few questions at a time.
6. Do not put secrets in the repo. (Firebase web config is not secret, the shared password is NEVER stored in the repo.)
7. If you are unsure about a decision the user made earlier, check REQUIREMENTS.md before asking again.

## Folder map
- /index.html, style.css, app.js, stats.js, store.js, i18n.js: the web app (served by GitHub Pages from repo root)
- /firebase-config.js: user fills in Firebase web config + family email
- /firestore.rules: security rules to paste into the Firebase console
- /README.md: setup/deploy steps for the user
- /CONTEXT/: this folder
