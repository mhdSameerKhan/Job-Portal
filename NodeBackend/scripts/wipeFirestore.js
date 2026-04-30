const { initializeFirebase, getFirestore } = require('../config/firebase');

(async () => {
  try {
    initializeFirebase();
    const db = getFirestore();

    const collections = [
      'users',
      'user_profiles',
      'students',
      'employers',
      'job_listings',
      'applications',
      'students_cv',
      'messaging_conversation',
      'messages',
      'admin_activity_logs'
    ];

    const deleteCollection = async (name) => {
      const colRef = db.collection(name);
      const snapshot = await colRef.get();
      if (snapshot.empty) return;
      let batch = db.batch();
      let count = 0;
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        count++;
        if (count % 450 === 0) {
          await batch.commit();
          batch = db.batch();
        }
      }
      await batch.commit();
    };

    for (const name of collections) {
      await deleteCollection(name);
      console.log(`Deleted collection ${name}`);
    }

    console.log('Firestore wipe completed');
    process.exit(0);
  } catch (err) {
    console.error('Error wiping Firestore:', err);
    process.exit(1);
  }
})();
