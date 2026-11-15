# Pellet tracker

Digital diary for the pellet boiler: log refills (bags), cleaning and restarts, see average use and a refill estimate.
Plain HTML/CSS/JS, no build step. Works in any browser (EN/HU).

## Try it right now (local mode)
Serve the folder (ES modules don't work from file://):

    cd /home/albert/Personal/program/pellet-tracker
    python3 -m http.server 8000

Open http://localhost:8000. Without Firebase config, data is stored only in that browser.

## Share it with the family (Firebase, free)
Firebase renames menus often. If a name below doesn't match, use "Search for products" at the top of the left sidebar.
1. https://console.firebase.google.com -> create a project (Analytics not needed). Stay on the free Spark plan.
2. Left sidebar -> Databases & Storage -> Firestore -> Create database (production mode, pick an EU region).
3. Left sidebar -> Security -> Authentication -> Get started -> Sign-in method -> enable Email/Password.
   Users tab -> Add user: email `family@pellet.local` (or your own, keep it in sync below) + the shared password.
   Then Authentication -> Settings -> User actions -> turn OFF "Enable create (sign-up)".
4. Databases & Storage -> Firestore -> Rules tab: paste the contents of `firestore.rules` (fix the email) and Publish.
5. Project Overview -> Add app -> Web (</>) -> give it a name, skip Firebase Hosting -> copy the config values into
   `firebase-config.js` (apiKey, authDomain, projectId, appId) and set `FAMILY_EMAIL`.
6. Authentication -> Settings -> Authorized domains: add `<your-github-user>.github.io`.

## Deploy on GitHub Pages
Push this folder to a GitHub repo, then Settings -> Pages -> Deploy from branch `main` / root.

## Install on the phone
Open the GitHub Pages link in the phone browser -> menu -> "Add to Home screen" / "Install app". It then opens like an app.

## Agents
See CONTEXT/README_FOR_AGENTS.md.
