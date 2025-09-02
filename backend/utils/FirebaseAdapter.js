const { db, convertDoc, buildQuery } = require('../database/firebase');

/**
 * Creates a Firebase Firestore adapter for a collection
 * @param {string} collectionName - The name of the collection
 * @returns {Object} - An object with methods to interact with the collection
 */
function createFirebaseAdapter(collectionName) {
  // Get a reference to the collection
  const getCollection = () => db.collection(collectionName);
  
  return {
    // Find methods
    findById: async (id) => {
      try {
        const doc = await getCollection().doc(id).get();
        if (!doc.exists) {
          return null;
        }
        return convertDoc(doc);
      } catch (error) {
        console.error(`Error in findById for ${collectionName}:`, error);
        return null;
      }
    },
    
    findOne: async (filter = {}) => {
      try {
        const query = buildQuery(getCollection(), filter);
        const snapshot = await query.limit(1).get();
        
        if (snapshot.empty) {
          return null;
        }
        
        return convertDoc(snapshot.docs[0]);
      } catch (error) {
        console.error(`Error in findOne for ${collectionName}:`, error);
        return null;
      }
    },
    
    find: async (filter = {}, sort = {}, limit = 0, skip = 0) => {
      try {
        const query = buildQuery(getCollection(), filter, sort, limit, skip);
        const snapshot = await query.get();
        
        if (snapshot.empty) {
          return [];
        }
        
        return snapshot.docs.map(convertDoc);
      } catch (error) {
        console.error(`Error in find for ${collectionName}:`, error);
        return [];
      }
    },
    
    // Create methods
    create: async (document) => {
      try {
        // If document has an _id, use it as the document ID
        if (document._id) {
          const id = document._id;
          delete document._id; // Remove _id from the document data
          
          await getCollection().doc(id).set(document);
          return { _id: id, ...document };
        } else {
          // Let Firestore generate an ID
          const docRef = await getCollection().add(document);
          return { _id: docRef.id, ...document };
        }
      } catch (error) {
        console.error(`Error in create for ${collectionName}:`, error);
        return null;
      }
    },
    
    insertMany: async (documents) => {
      try {
        const batch = db.batch();
        const results = [];
        
        for (const doc of documents) {
          let id;
          let docData = { ...doc };
          
          if (doc._id) {
            id = doc._id;
            delete docData._id;
          } else {
            id = getCollection().doc().id; // Generate a new ID
          }
          
          const docRef = getCollection().doc(id);
          batch.set(docRef, docData);
          
          results.push({ _id: id, ...docData });
        }
        
        await batch.commit();
        return { acknowledged: true, insertedCount: documents.length, insertedIds: results.map(r => r._id) };
      } catch (error) {
        console.error(`Error in insertMany for ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Update methods
    updateById: async (id, update) => {
      try {
        const docRef = getCollection().doc(id);
        
        // Handle MongoDB update operators
        let updateData = {};
        
        if (update.$set) {
          updateData = { ...update.$set };
        } else if (update.$inc) {
          // For increment, we need to use FieldValue.increment
          const { FieldValue } = require('firebase-admin').firestore;
          
          Object.entries(update.$inc).forEach(([field, value]) => {
            updateData[field] = FieldValue.increment(value);
          });
        } else {
          // If no operators, just use the update object directly
          updateData = update;
        }
        
        await docRef.update(updateData);
        
        // Get the updated document
        const updatedDoc = await docRef.get();
        return convertDoc(updatedDoc);
      } catch (error) {
        console.error(`Error in updateById for ${collectionName}:`, error);
        return null;
      }
    },
    
    updateOne: async (filter, update) => {
      try {
        // Find the document to update
        const query = buildQuery(getCollection(), filter);
        const snapshot = await query.limit(1).get();
        
        if (snapshot.empty) {
          return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        }
        
        const docId = snapshot.docs[0].id;
        await this.updateById(docId, update);
        
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
      } catch (error) {
        console.error(`Error in updateOne for ${collectionName}:`, error);
        return { acknowledged: false, matchedCount: 0, modifiedCount: 0 };
      }
    },
    
    updateMany: async (filter, update) => {
      try {
        // Find all documents to update
        const query = buildQuery(getCollection(), filter);
        const snapshot = await query.get();
        
        if (snapshot.empty) {
          return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        }
        
        const batch = db.batch();
        
        // Handle MongoDB update operators
        let updateData = {};
        
        if (update.$set) {
          updateData = { ...update.$set };
        } else if (update.$inc) {
          // For increment, we need to use FieldValue.increment
          const { FieldValue } = require('firebase-admin').firestore;
          
          Object.entries(update.$inc).forEach(([field, value]) => {
            updateData[field] = FieldValue.increment(value);
          });
        } else {
          // If no operators, just use the update object directly
          updateData = update;
        }
        
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, updateData);
        });
        
        await batch.commit();
        
        return { 
          acknowledged: true, 
          matchedCount: snapshot.size, 
          modifiedCount: snapshot.size 
        };
      } catch (error) {
        console.error(`Error in updateMany for ${collectionName}:`, error);
        return { acknowledged: false, matchedCount: 0, modifiedCount: 0 };
      }
    },
    
    // Delete methods
    deleteById: async (id) => {
      try {
        await getCollection().doc(id).delete();
        return { acknowledged: true, deletedCount: 1 };
      } catch (error) {
        console.error(`Error in deleteById for ${collectionName}:`, error);
        return { acknowledged: false, deletedCount: 0 };
      }
    },
    
    deleteOne: async (filter) => {
      try {
        // Find the document to delete
        const query = buildQuery(getCollection(), filter);
        const snapshot = await query.limit(1).get();
        
        if (snapshot.empty) {
          return { acknowledged: true, deletedCount: 0 };
        }
        
        await snapshot.docs[0].ref.delete();
        
        return { acknowledged: true, deletedCount: 1 };
      } catch (error) {
        console.error(`Error in deleteOne for ${collectionName}:`, error);
        return { acknowledged: false, deletedCount: 0 };
      }
    },
    
    deleteMany: async (filter) => {
      try {
        // Find all documents to delete
        const query = buildQuery(getCollection(), filter);
        const snapshot = await query.get();
        
        if (snapshot.empty) {
          return { acknowledged: true, deletedCount: 0 };
        }
        
        const batch = db.batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        return { 
          acknowledged: true, 
          deletedCount: snapshot.size 
        };
      } catch (error) {
        console.error(`Error in deleteMany for ${collectionName}:`, error);
        return { acknowledged: false, deletedCount: 0 };
      }
    },
    
    // Count methods
    countDocuments: async (filter = {}) => {
      try {
        const query = buildQuery(getCollection(), filter);
        const snapshot = await query.get();
        return snapshot.size;
      } catch (error) {
        console.error(`Error in countDocuments for ${collectionName}:`, error);
        return 0;
      }
    },
    
    // Aggregation methods (simplified)
    aggregate: async (pipeline) => {
      console.warn('Firestore does not support MongoDB-style aggregation. Using a simplified version.');
      
      try {
        // This is a very simplified implementation that only supports basic matching
        let query = getCollection();
        
        for (const stage of pipeline) {
          if (stage.$match) {
            query = buildQuery(query, stage.$match);
          }
          // Other stages like $group, $project, etc. are not supported
        }
        
        const snapshot = await query.get();
        return snapshot.docs.map(convertDoc);
      } catch (error) {
        console.error(`Error in aggregate for ${collectionName}:`, error);
        return [];
      }
    }
  };
}

module.exports = createFirebaseAdapter;