# Progress (keep this up to date!)
Last updated: 2026-11-15 by Claude

## Done
- Phase 0: project folder + CONTEXT docs
- Phase 1 (user tested locally 2026-11-15: UI clean, all buttons work): add-entry form (auto date-time, whole-bag stepper, cleaned, restarted, note),
  edit/delete, history, custom date range + presets, settings dialog, CSV/JSON export, EN/HU, plain + weighted averages, next-refill estimate
- Phase 1.5 (written, trusted but not browser-tested): "since last cleaning" stat, SVG bar chart per refill interval (restart intervals in blue),
  skipRestarts setting (outage intervals excluded from averages), overdue refill warning (⚠), settings synced via Firestore `meta/settings`,
  PWA (manifest, icon.svg, sw.js) so it can be installed on phones
- Import button (CSV/JSON, same columns as the export: iso_time,bags,cleaned,restarted,note; skips duplicates by time+bags) added 2026-11-15,
  to load the paper diary history. Plan: user uploads photos of the paper book to Claude in chat, Claude transcribes to CSV, user checks it, imports it in the app.
- Firestore backend + shared-password login + firestore.rules + README setup steps are written (cloud mode not yet exercised)

## Blocked on the user (only they can do these)
1. Firebase project "pellet-tracker-fbf32" exists and its web config is already in firebase-config.js (transcribed from a screenshot, so if login fails
   with an "invalid api key" error, re-copy the values from the console). Still to do by user: enable Firestore, Email/Password auth + the one family user,
   disable sign-up, publish firestore.rules (README steps 2-4, 6).
2. DONE 2026-11-15 by Claude: repo https://github.com/albertUnc/pellet-tracker (public, branch main) created and pushed, GitHub Pages enabled
   -> live at https://albertunc.github.io/pellet-tracker/ (first build takes ~1-2 min).
   Deploy = `git add -A && git commit -m "..." && git push` from the project folder. Agents: commit + push after every change.
3. User still must add `albertunc.github.io` in Firebase -> Authentication -> Settings -> Authorized domains, and confirm Firestore is created + rules published.

## Decisions from user
- 2026-11-15: user trusts the agent's code, does NOT want to be asked to test after each change. Work through everything and report when done.
- 2026-11-15: thermostat stuff is OUT OF SCOPE for now. Do not start it. Come back to the user when everything else is done.

## Next (non-thermostat)
- Nothing mandatory left besides the two user-only steps above. Possible polish if the user asks: undo-delete, duplicate-entry warning,
  more charts (monthly totals), seasonal totals / cost tracking (price per bag), notification when refill is due (needs a push channel).

## Later (parked)
- Phase 3: thermostat logging + failure detection + notifications (see ARCHITECTURE.md "Future"; needs hardware decision + model photos from user).
