# Architecture & decisions

## Stack
- Frontend: vanilla HTML/CSS/JS (ES modules), no build step, no npm. Mobile-first, light/dark via prefers-color-scheme.
- Hosting: GitHub Pages (repo root). Static only.
- Data: Firebase Firestore (free Spark plan) + Firebase Auth email/password with ONE shared family account.
  Firebase JS SDK is loaded from the gstatic CDN (v10.12.2) only when firebase-config.js is filled in.
- Fallback: if firebase-config.js is empty the app runs in LOCAL mode (localStorage, this browser only) so it can be tested immediately.

## Why Firestore (decision 2026-11-15, Claude)
- GitHub Pages is read-only; writing a JSON file in the repo would need a GitHub token in the browser (unsafe).
- Supabase free projects pause after ~1 week of inactivity (bad for a log used irregularly).
- Firestore: no card needed, no pausing, ~1 GiB, ~20k writes/day free, live sync between family phones.
  A refill log is tiny. Thermostat logging at 1/min = 1440 writes/day, still fine; downsample if needed.

## Security model
- "Shared password": Firebase Auth email/password, fixed email in firebase-config.js (FAMILY_EMAIL), password typed by the user.
  The user creates that single user manually in the Firebase console.
- IMPORTANT: also DISABLE sign-up in Firebase Auth settings AND use rules that check the email
  (firestore.rules) - otherwise anyone with the public apiKey could create their own account and pass `request.auth != null`.

## Data model (Firestore collection `entries`)
`{ ts: number (ms epoch), bags: int >= 0, cleaned: bool, restarted: bool, note: string }`
- One document = one line of the paper diary. bags = 0 is allowed for "only cleaned / only restarted" entries.
- Settings: shared ones (horizon, capacity, levelAfter, kgPerBag, defaultBags, skipRestarts) are synced in Firestore doc `meta/settings`
  (and cached in localStorage `pellet.settings`); language is per-device only.
- PWA: manifest.webmanifest + icon.svg + sw.js (network-first, cache fallback) so it can be installed to the phone home screen.
  Bump CACHE name in sw.js and add new files to SHELL when adding files.

## Stats (stats.js, pure functions, no DOM)
- Refill intervals: for consecutive refills (bags > 0) i and i+1, bags_i were consumed during dt_i days
  (assumes the user refills with roughly the same leftover each time).
- Plain average (range) = sum(bags_i) / sum(dt_i) over intervals fully inside the range.
- Weighted average = sum(w_i * bags_i) / sum(w_i * dt_i), w_i = max(0.05, 1 - age_i / horizonDays), age_i = days since interval midpoint.
  Linear fade of old data (user's CPU-burst-estimate idea). Horizon default 14 days, configurable.
- Prediction: rate = weighted rate over ALL entries.
  - If user set "bags in hopper right after a refill" (L): next refill ~ lastRefill + L / rate days.
  - Else assume the usual leftover: next refill ~ lastRefill + lastBags / rate days.
  - Suggested bags = max(1, round(rate * typical gap)), typical gap = mean of the last 5 intervals.
- Outage handling: setting `skipRestarts` (default on) drops intervals that END with a restarted refill from the averages/prediction
  (hopper ran empty, rate would be biased). Chart still shows them in blue.

## Future: thermostat logging (not started)
- No always-on device at home, and the Computherm wireless thermostat has no known API. Options to evaluate with the user:
  1. Check the exact Computherm model (Q-series Wi-Fi models have a cloud app; this "wireless thermo control system" with a relay module probably does not).
  2. Cheap ESP32 (Wi-Fi) near the boiler wiring the receiver's relay/LED to a pin to log heating on/off and post to Firestore (REST) - needs a few euros of hardware.
  3. ESP32 + temperature sensor (DS18B20) for real current temp.
  4. Notifications: free push via ntfy.sh or a Telegram bot, triggered by the ESP32 or a scheduled GitHub Action reading Firestore.
- Failure detection idea: heating requested (set temp > current) for N hours with no temperature rise, or no heating cycles for a long time -> alert.
