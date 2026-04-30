const { getFirestore, admin } = require('./firebase');
const db = getFirestore();
module.exports = { db, admin };
