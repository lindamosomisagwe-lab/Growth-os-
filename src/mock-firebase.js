// Self-contained Mock Firebase Implementation for Offline-compatible Verification

// --- Mock Database Helper ---
const getMockDB = () => {
  try {
    const data = localStorage.getItem('firebase_mock_db');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const saveMockDB = (db) => {
  localStorage.setItem('firebase_mock_db', JSON.stringify(db));
};

// --- Mock Auth Helper ---
const getMockUser = () => {
  try {
    const data = localStorage.getItem('firebase_mock_user');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const saveMockUser = (user) => {
  if (user) {
    localStorage.setItem('firebase_mock_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('firebase_mock_user');
  }
};

const authListeners = new Set();

const notifyAuthState = (user) => {
  for (const listener of authListeners) {
    listener(user);
  }
};

// --- Exports for firebase/app ---
export const initializeApp = () => ({});

// --- Exports for firebase/auth ---
export const auth = {
  get currentUser() {
    return getMockUser();
  }
};

export const getAuth = () => auth;

export const onAuthStateChanged = (authObj, callback) => {
  authListeners.add(callback);
  // Call callback with current user immediately
  setTimeout(() => {
    callback(getMockUser());
  }, 20);
  return () => {
    authListeners.delete(callback);
  };
};

export const createUserWithEmailAndPassword = async (authObj, email, password) => {
  const user = {
    uid: 'uid_' + Math.random().toString(36).substr(2, 9),
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    metadata: { creationTime: new Date().toUTCString() }
  };
  saveMockUser(user);
  notifyAuthState(user);
  return { user };
};

export const signInWithEmailAndPassword = async (authObj, email, password) => {
  const user = {
    uid: 'uid_' + email.replace(/[^a-zA-Z0-9]/g, ''),
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    metadata: { creationTime: new Date().toUTCString() }
  };
  saveMockUser(user);
  notifyAuthState(user);
  return { user };
};

export const signInWithPopup = async (authObj, provider) => {
  const user = {
    uid: 'uid_google_mock',
    email: 'googleuser@example.com',
    displayName: 'Google Explorer',
    photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    metadata: { creationTime: new Date().toUTCString() }
  };
  saveMockUser(user);
  notifyAuthState(user);
  return { user };
};

export const signOut = async (authObj) => {
  saveMockUser(null);
  notifyAuthState(null);
};

export const updateProfile = async (user, profileData) => {
  const current = getMockUser();
  if (current && current.uid === user.uid) {
    const updated = { ...current, ...profileData };
    saveMockUser(updated);
    Object.assign(user, profileData);
    notifyAuthState(updated);
  }
};

export const deleteUser = async (user) => {
  saveMockUser(null);
  notifyAuthState(null);
};

export class GoogleAuthProvider {}

// --- Exports for firebase/firestore ---
export const db = {};
export const getFirestore = () => db;

export const doc = (dbObj, colName, ...idParts) => {
  const id = idParts.join('/');
  return { colName, id, path: `${colName}/${id}` };
};

export const collection = (dbObj, colName) => {
  return { colName };
};

export const getDoc = async (docRef) => {
  const dbData = getMockDB();
  const col = dbData[docRef.colName] || {};
  const data = col[docRef.id];
  return {
    exists: () => !!data,
    data: () => data ? JSON.parse(JSON.stringify(data)) : undefined,
    id: docRef.id,
    ref: docRef
  };
};

export const setDoc = async (docRef, data, options = {}) => {
  const dbData = getMockDB();
  if (!dbData[docRef.colName]) dbData[docRef.colName] = {};
  if (options.merge && dbData[docRef.colName][docRef.id]) {
    dbData[docRef.colName][docRef.id] = {
      ...dbData[docRef.colName][docRef.id],
      ...data
    };
  } else {
    dbData[docRef.colName][docRef.id] = data;
  }
  saveMockDB(dbData);
};

export const addDoc = async (colRef, data) => {
  const dbData = getMockDB();
  if (!dbData[colRef.colName]) dbData[colRef.colName] = {};
  const id = 'id_' + Math.random().toString(36).substr(2, 9);
  dbData[colRef.colName][id] = data;
  saveMockDB(dbData);
  return { id, ref: { colName: colRef.colName, id } };
};

export const updateDoc = async (docRef, data) => {
  const dbData = getMockDB();
  if (!dbData[docRef.colName]) dbData[docRef.colName] = {};
  dbData[docRef.colName][docRef.id] = {
    ...(dbData[docRef.colName][docRef.id] || {}),
    ...data
  };
  saveMockDB(dbData);
};

export const deleteDoc = async (docRef) => {
  const dbData = getMockDB();
  if (dbData[docRef.colName]) {
    delete dbData[docRef.colName][docRef.id];
    saveMockDB(dbData);
  }
};

export const getDocs = async (queryRef) => {
  const dbData = getMockDB();
  const colName = queryRef.colName;
  const colData = dbData[colName] || {};
  
  let docs = Object.keys(colData).map(id => ({
    id,
    data: () => JSON.parse(JSON.stringify(colData[id])),
    ref: { colName, id }
  }));

  // Apply filters
  if (queryRef.filters) {
    for (const filter of queryRef.filters) {
      const { field, op, value } = filter;
      docs = docs.filter(doc => {
        const docVal = doc.data()[field];
        if (op === '==') return docVal === value;
        if (op === '>=') return docVal >= value;
        if (op === '<=') return docVal <= value;
        if (op === 'array-contains') return Array.isArray(docVal) && docVal.includes(value);
        return true;
      });
    }
  }

  // Apply ordering
  if (queryRef.orderBys) {
    for (const ob of queryRef.orderBys) {
      const { field, direction = 'asc' } = ob;
      docs.sort((a, b) => {
        const valA = a.data()[field];
        const valB = b.data()[field];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  // Apply limit
  if (queryRef.limitCount !== undefined) {
    docs = docs.slice(0, queryRef.limitCount);
  }

  return {
    docs,
    empty: docs.length === 0,
    size: docs.length
  };
};

export const query = (colRef, ...constraints) => {
  const q = { colName: colRef.colName, filters: [], orderBys: [] };
  for (const c of constraints) {
    if (c.type === 'where') {
      q.filters.push({ field: c.field, op: c.op, value: c.value });
    } else if (c.type === 'orderBy') {
      q.orderBys.push({ field: c.field, direction: c.direction });
    } else if (c.type === 'limit') {
      q.limitCount = c.value;
    }
  }
  return q;
};

export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });
export const limit = (value) => ({ type: 'limit', value });

export const writeBatch = () => {
  const operations = [];
  return {
    set: (docRef, data, options) => { operations.push({ type: 'set', docRef, data, options }); },
    update: (docRef, data) => { operations.push({ type: 'update', docRef, data }); },
    delete: (docRef) => { operations.push({ type: 'delete', docRef }); },
    commit: async () => {
      for (const op of operations) {
        if (op.type === 'set') {
          await setDoc(op.docRef, op.data, op.options);
        } else if (op.type === 'update') {
          await updateDoc(op.docRef, op.data);
        } else if (op.type === 'delete') {
          await deleteDoc(op.docRef);
        }
      }
    }
  };
};

export const serverTimestamp = () => new Date().toISOString();

export class Timestamp {
  constructor(seconds, nanoseconds) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static now() {
    return Timestamp.fromDate(new Date());
  }
  static fromDate(date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }
  toDate() {
    return new Date(this.seconds * 1000);
  }
}
