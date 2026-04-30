const { getFirestore } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');

class BaseService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this._db = null;
    this._collection = null;
  }

  // Lazy load Firestore to avoid initialization errors at startup
  get db() {
    if (!this._db) {
      try {
        this._db = getFirestore();
      } catch (error) {
        console.error(`Error getting Firestore for ${this.collectionName}:`, error.message);
        throw error;
      }
    }
    return this._db;
  }

  get collection() {
    if (!this._collection) {
      if (!this.db) {
        throw new Error('Firestore not initialized. Please add Firebase service account key.');
      }
      this._collection = this.db.collection(this.collectionName);
    }
    return this._collection;
  }

  // Convert Firestore document to plain object
  docToObject(doc) {
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamps to ISO strings for JSON serialization
      ...this.convertTimestamps(data)
    };
  }

  // Convert Firestore Timestamps to Date objects or ISO strings
  convertTimestamps(data) {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value.toDate === 'function') {
        // Firestore Timestamp
        converted[key] = value.toDate().toISOString();
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively convert nested objects
        converted[key] = this.convertTimestamps(value);
      }
    }
    return converted;
  }

  // Convert Date/string to Firestore Timestamp
  toTimestamp(value) {
    if (!value) return null;
    if (value instanceof Date) {
      return Timestamp.fromDate(value);
    }
    if (typeof value === 'string') {
      return Timestamp.fromDate(new Date(value));
    }
    return value;
  }

  // Prepare data for Firestore (convert dates to timestamps)
  prepareData(data) {
    const prepared = { ...data };
    const timestampFields = ['created_at', 'updated_at', 'last_login', 'posted_date', 
                            'deadline', 'application_date', 'timestamp', 'date_of_birth'];
    
    for (const field of timestampFields) {
      if (prepared[field]) {
        prepared[field] = this.toTimestamp(prepared[field]);
      }
    }

    // Set updated_at if not provided
    if (!prepared.updated_at && !prepared.id) {
      prepared.updated_at = Timestamp.now();
    }

    // Set created_at if creating new document
    if (!prepared.created_at && !prepared.id) {
      prepared.created_at = Timestamp.now();
    }

    return prepared;
  }

  // Create a new document
  async create(data) {
    try {
      const preparedData = this.prepareData(data);
      const docRef = await this.collection.add(preparedData);
      const doc = await docRef.get();
      return this.docToObject(doc);
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Find document by ID
  async findById(id) {
    try {
      if (!id) {
        return null;
      }
      const doc = await this.collection.doc(id).get();
      return this.docToObject(doc);
    } catch (error) {
      console.error(`Error finding document by ID in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Find all documents with optional query
  async findAll(query = {}, orderBy = null, limitCount = null) {
    try {
      let queryRef = this.collection;

      // Apply where clauses
      for (const [field, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.operator) {
            // Handle operators like { operator: '==', value: 'something' }
            queryRef = queryRef.where(field, value.operator, value.value);
          } else {
            queryRef = queryRef.where(field, '==', value);
          }
        }
      }

      // Apply ordering
      if (orderBy) {
        const { field, direction = 'asc' } = orderBy;
        queryRef = queryRef.orderBy(field, direction);
      }

      // Apply limit
      if (limitCount) {
        queryRef = queryRef.limit(limitCount);
      }

      const snapshot = await queryRef.get();
      return snapshot.docs.map(doc => this.docToObject(doc));
    } catch (error) {
      console.error(`Error finding all documents in ${this.collectionName}:`, error);
      // Log quota errors specifically
      if (error.code === 8 || error.message?.includes('Quota exceeded')) {
        console.error(`Firebase quota exceeded for ${this.collectionName} collection`);
      }
      throw error;
    }
  }

  // Find one document with query
  async findOne(query) {
    try {
      const results = await this.findAll(query, null, 1);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding one document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update document by ID
  async update(id, data) {
    try {
      if (!id) {
        throw new Error('Document ID is required for update');
      }
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Document with ID ${id} not found`);
      }

      const preparedData = this.prepareData(data);
      // Don't update created_at on update
      delete preparedData.created_at;
      preparedData.updated_at = Timestamp.now();

      await docRef.update(preparedData);
      const updatedDoc = await docRef.get();
      return this.docToObject(updatedDoc);
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete document by ID
  async delete(id) {
    try {
      if (!id) {
        throw new Error('Document ID is required for delete');
      }
      const docRef = this.collection.doc(id);
      await docRef.delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Count documents with query
  async count(query = {}) {
    try {
      let queryRef = this.collection;

      for (const [field, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.operator) {
            queryRef = queryRef.where(field, value.operator, value.value);
          } else {
            queryRef = queryRef.where(field, '==', value);
          }
        }
      }

      const snapshot = await queryRef.get();
      return snapshot.size;
    } catch (error) {
      console.error(`Error counting documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Paginate results
  async paginate(query = {}, orderBy = null, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let queryRef = this.collection;

      // Apply where clauses
      for (const [field, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.operator) {
            queryRef = queryRef.where(field, value.operator, value.value);
          } else {
            queryRef = queryRef.where(field, '==', value);
          }
        }
      }

      // Apply ordering
      if (orderBy) {
        const { field, direction = 'asc' } = orderBy;
        queryRef = queryRef.orderBy(field, direction);
      }

      // Get total count
      const countSnapshot = await queryRef.get();
      const total = countSnapshot.size;

      // Apply pagination
      if (offset > 0) {
        const offsetSnapshot = await queryRef.limit(offset).get();
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        if (lastDoc) {
          queryRef = queryRef.startAfter(lastDoc);
        }
      }
      queryRef = queryRef.limit(limit);

      const snapshot = await queryRef.get();
      const items = snapshot.docs.map(doc => this.docToObject(doc));

      return {
        items,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      };
    } catch (error) {
      console.error(`Error paginating documents in ${this.collectionName}:`, error);
      throw error;
    }
  }
}

module.exports = BaseService;

