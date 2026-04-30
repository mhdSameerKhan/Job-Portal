const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firestore = null;

// Initialize Firebase Admin SDK
function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      firestore = admin.firestore();
      return firestore;
    }

    let serviceAccount;

    // Try to load service account from environment variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (error) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error);
      }
    }

    // Try to load credentials from discrete env vars (client email + private key)
    if (
      !serviceAccount &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      const pk = process.env.FIREBASE_PRIVATE_KEY.trim();
      const looksLikePath = pk.endsWith('.json') || pk.startsWith('/') || pk.includes('\\');
      if (looksLikePath) {
        const keyPath = path.resolve(pk);
        if (fs.existsSync(keyPath)) {
          serviceAccount = require(keyPath);
        }
      } else {
        serviceAccount = {
          project_id: process.env.FIREBASE_PROJECT_ID || 'default-project',
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          private_key: pk.replace(/\\n/g, '\n')
        };
      }
    }

    // Try to load from file path
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (fs.existsSync(keyPath)) {
        serviceAccount = require(keyPath);
      }
    }

    // Try default location
    if (!serviceAccount) {
      const defaultPath = path.resolve(__dirname, '../serviceAccountKey.json');
      if (fs.existsSync(defaultPath)) {
        serviceAccount = require(defaultPath);
      }
    }

    // Try alternative filename (service.json)
    if (!serviceAccount) {
      const altPath = path.resolve(__dirname, '../service.json');
      if (fs.existsSync(altPath)) {
        serviceAccount = require(altPath);
      }
    }

    // Initialize with service account if available
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
      });
      firestore = admin.firestore();
      
      // Configure Firestore settings
      firestore.settings({
        ignoreUndefinedProperties: true
      });

      console.log('Firebase Admin SDK initialized successfully with service account');
      return firestore;
    } else {
      // Try to initialize with application default credentials
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'default-project'
        });
        firestore = admin.firestore();
        firestore.settings({
          ignoreUndefinedProperties: true
        });
        console.warn('Firebase initialized without service account. Using application default credentials.');
        return firestore;
      } catch (defaultError) {
        console.error('Failed to initialize Firebase with default credentials:', defaultError.message);
        // Don't throw - allow server to start but services will fail when used
        console.warn('Server will start but Firestore operations will fail until service account is added.');
        return null;
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // Don't throw - allow server to start
    console.warn('Server will start but Firestore operations will fail until service account is added.');
    return null;
  }
}

// Get Firestore instance
function getFirestore() {
  if (!firestore) {
    firestore = initializeFirebase();
  }
  
  if (!firestore) {
    throw new Error('Firestore not initialized. Please add Firebase service account key to serviceAccountKey.json or set FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
  }
  
  return firestore;
}

module.exports = {
  initializeFirebase,
  getFirestore,
  admin
};

