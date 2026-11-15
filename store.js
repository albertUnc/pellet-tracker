// Storage layer. Two backends with the same API: local (localStorage) and cloud (Firestore).
import { firebaseConfig, FAMILY_EMAIL } from './firebase-config.js';

const V = '10.12.2';
const CDN = `https://www.gstatic.com/firebasejs/${V}`;
export const isCloud = Boolean(firebaseConfig && firebaseConfig.apiKey);

// ---------- local backend ----------
const LS = 'pellet.entries';
const listeners = new Set();
const readLocal = () => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch { return []; } };
const writeLocal = (list) => {
  localStorage.setItem(LS, JSON.stringify(list));
  listeners.forEach((cb) => cb(list));
};
const local = {
  needsLogin: () => false,
  subscribe(cb) { listeners.add(cb); cb(readLocal()); return () => listeners.delete(cb); },
  async add(e) { writeLocal([...readLocal(), { ...e, id: crypto.randomUUID() }]); },
  async update(id, e) { writeLocal(readLocal().map((x) => (x.id === id ? { ...e, id } : x))); },
  async remove(id) { writeLocal(readLocal().filter((x) => x.id !== id)); },
  async login() {},
  async logout() {},
  // shared settings: local mode just uses localStorage
  subscribeSettings(cb) { try { cb(JSON.parse(localStorage.getItem('pellet.sharedSettings') || '{}')); } catch { cb({}); } return () => {}; },
  async saveSettings(s) { localStorage.setItem('pellet.sharedSettings', JSON.stringify(s)); },
};

// ---------- cloud backend ----------
let cloud = null;
async function initCloud() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-auth.js`),
    import(`${CDN}/firebase-firestore.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  await new Promise((res) => { const off = A.onAuthStateChanged(auth, () => { off(); res(); }); });
  const col = F.collection(db, 'entries');
  cloud = {
    needsLogin: () => !auth.currentUser,
    async login(pw) { await A.signInWithEmailAndPassword(auth, FAMILY_EMAIL, pw); },
    async logout() { await A.signOut(auth); },
    subscribe(cb) {
      return F.onSnapshot(
        F.query(col, F.orderBy('ts', 'desc')),
        (snap) => cb(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
        (err) => console.error('Firestore error', err),
      );
    },
    async add(e) { await F.addDoc(col, e); },
    async update(id, e) { await F.setDoc(F.doc(db, 'entries', id), e); },
    async remove(id) { await F.deleteDoc(F.doc(db, 'entries', id)); },
    subscribeSettings(cb) {
      return F.onSnapshot(F.doc(db, 'meta', 'settings'), (snap) => cb(snap.exists() ? snap.data() : {}), (err) => console.error('Settings error', err));
    },
    async saveSettings(s) { await F.setDoc(F.doc(db, 'meta', 'settings'), s); },
  };
}

let backend = local;
export async function init() {
  if (isCloud) { await initCloud(); backend = cloud; }
}
export const needsLogin = () => backend.needsLogin();
export const login = (pw) => backend.login(pw);
export const logout = () => backend.logout();
export const subscribe = (cb) => backend.subscribe(cb);
export const subscribeSettings = (cb) => backend.subscribeSettings(cb);
export const saveSettings = (s) => backend.saveSettings(s);
export const add = (e) => backend.add(e);
export const update = (id, e) => backend.update(id, e);
export const remove = (id) => backend.remove(id);
