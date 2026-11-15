// The web config is NOT secret. Leave apiKey empty to run in local-only mode (localStorage).
export const firebaseConfig = {
  apiKey: 'AIzaSyCkVQrT9lRmA8KzDGmSQdSd0oAbunGPZUI',
  authDomain: 'pellet-tracker-fbf32.firebaseapp.com',
  projectId: 'pellet-tracker-fbf32',
  appId: '1:801809499458:web:8b37aeb461f25695aff4db',
};

// The one shared family account (created by hand in Firebase console -> Authentication).
// The password is typed in the app and is never stored in the repo.
export const FAMILY_EMAIL = 'family@pellet.local';
