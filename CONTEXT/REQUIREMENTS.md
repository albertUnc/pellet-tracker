# Requirements (everything the user told us)

Project owner: jnc (student, hobbyist programmer). Date started: 2026-11-15. other/more popular programmer name: albert

## Situation (user's words, lightly cleaned)
Me and my family have a boiler that runs on pellets (small woody things in 15 kg bags). We have a little book
where we note whenever we put pellets in it, how much, and whether we cleaned it or had to restart it (because
it failed from pellet outage, or from not being cleaned in too long). "Cleaned" = removing the soot / black
dust that comes from burning.

## What the user wants
Digitalize that diary because it adds a lot:
- auto writing the date and time of each addition
- calculating the daily average of pellet use in the last ... time (custom range)
- calculating the daily average of pellet use in the last ... time, BUT it gradually/linearly decreases how much
  a fill matters to the average (older = matters less, "kinda like how CPU scheduling calculates the estimated
  next CPU burst"). This is used to calculate WHEN it needs a refill and HOW MUCH.
- searching up usage and average in a period of time

Later, if possible: auto tracking and logging thermostat data (set temp, current temp, is the heat on / heating
right now or not). From these data + the pellet log, detect if the boiler had a failure and send a notification
or similar, and more stuff. The point: log as much info as we can and calculate as much useful data as we can.

## Architecture the user suggested
- HTML/CSS/JS frontend so it works on all platforms in a browser, no native downloadable app
- Hosting on GitHub Pages
- Any backend (JSON or Python), agent's choice

## Agent workflow the user asked for
- Everything lives in /home/albert/Personal/program/pellet-tracker
- A CONTEXT folder tracks what the user asked, what is done, always kept up to date. It contains everything the
  user said (including these instructions) plus technical info for the other agent. The user switches between
  Claude and another agent; agents communicate through files in CONTEXT, and each must update them.
- Claude should tell the plan before starting and interview the user for details.

## Interview answers (2026-11-15)
- Storage: "probably json on the hosting server, or a free cloud DB, you decide based on whats easier and how much
  data needs to be kept, just keep it fully free and possibly unlimited"  -> Claude chose Firebase Firestore (Spark, free), see ARCHITECTURE.md
- UI language: both, switchable (English + Hungarian)
- Averages time span: custom range picker
- Pellets are ALWAYS added in whole bags, NEVER partial amounts. Everything is measured in "bags" (Hungarian: "zsák").
- Hopper capacity: at the very max 5 bags when fully empty, around 4 or a bit more in practice.
  Usual routine: 2 bags every 2 days. Filling too much (as much as fits) is bad for the boiler because of the mass;
  filling too little runs out fast. The user does not measure how much is left in the hopper.
- Thermostat: label says "computherm wireless thermo control system". Extra buttons besides + and -: HOLD, DAY,
  LIGHT, TEST, COPY, PROG, SET. There is a manual module next to the boiler with 2 cables, 2 buttons and 2 LEDs that
  can switch colors. It is set to automatic mode, which makes the wireless controller detect temperature and send a
  signal to the module to start heating when needed. User knows nothing else (no model number, no API/Wi-Fi known).
- No always-on device at home (that's why free online hosting). Thermostat logging therefore needs a plan (see ARCHITECTURE.md "Future").
- Users: 2 or 3 family members. No accounts wanted: one shared database + a shared password so strangers who find
  the site cannot access the data.

## Later instructions from the user (2026-11-15)
- "you dont need to come back each time for testing, i trust that you will write good code and everything doesnt need to be tested."
- "For now lets leave all the thermostat stuff out and when everything else is done come back to me."

## Paper diary format (user answers, 2026-11-15) - needed when transcribing the old book
- Dates are written MM/DD style (month then day), months mostly as Hungarian short names (e.g. "Nov.", "Okt."), NO years, NO time of day.
  -> when importing: ask/assume the year(s), use a fixed time such as 12:00 for entries without a time.
- Restart is marked with a big dot / filled circle or ellipse shape.
- Cleaning is marked with a big "T".
- Plan: user will upload photos of pages to Claude in chat later; Claude transcribes to a table, flags unreadable parts, user verifies,
  then Claude writes a CSV (iso_time,bags,cleaned,restarted,note) and the user loads it with the app's Import button.

## iOS install note (2026-11-15)
- User reported "install as app" only worked on Android. Cause: iOS Safari has no install prompt API; it needs Share -> Add to Home Screen
  and a PNG apple-touch-icon (SVG icons are ignored). Added PNG icons, iOS meta tags, an in-app Install button (Android) and a how-to hint (iOS).
