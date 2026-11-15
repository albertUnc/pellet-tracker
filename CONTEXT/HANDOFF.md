# Handoff log (newest first). Every agent: add an entry at the TOP after each work session.

## 2026-11-15 (third session) - Claude
- User said: trust the code, no need to come back for testing; leave ALL thermostat stuff out for now and come back when everything else is done.
- Added: skipRestarts setting (stats.js intervalsOf/plainRate/weightedRate take a skipRestarts flag), overdue-refill warning, blue bars for restart
  intervals, shared settings via Firestore meta/settings (store.js subscribeSettings/saveSettings), PWA files (manifest, icon.svg, sw.js).
- Everything non-thermostat is now done in code. Remaining steps need the user (Firebase project, GitHub Pages) - see PROGRESS.md.
- Do NOT start thermostat work until the user asks.


## 2026-11-15 (later) - Claude
- User tested local mode: UI and buttons fine. Asked me to continue.
- Added "since last cleaning" stat (stats.js sinceClean) and an SVG bar chart of bags/day per refill interval (app.js renderChart). Untested in browser.
- Cloud (Firebase) mode is still untested: needs the user to create the Firebase project (README steps).
- Next for whoever continues: help user with Firebase + GitHub Pages deploy, then sync settings via Firestore, then Phase 3 questions.

## 2026-11-15 - Claude (chat, Desktop Commander file access)
- Interviewed the user, recorded answers in REQUIREMENTS.md.
- Chose Firebase Firestore + shared-password auth (reasons in ARCHITECTURE.md).
- Wrote the whole Phase 1 app (vanilla JS modules). I could NOT run it, so expect small bugs: please run
  `python3 -m http.server 8000` in the project folder and test in a browser first.
- Things to double check: datetime-local handling, Firestore `setDoc` replacing whole docs on edit,
  `dialog` close -> settings save, Hungarian wording (written by an AI, user may want to fix).
- Next: see PROGRESS.md "Next". Do not start Phase 3 before asking the user about thermostat hardware.
