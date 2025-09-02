# Backend Migration from Mongoose to Native MongoDB Driver

This project has been migrated from using Mongoose ODM to the native MongoDB driver for Node.js.

## Key Changes

1. **Database Connection**
   - Using the native MongoDB driver for direct connection to MongoDB Atlas
   - Connection is established in `database/db.js`

2. **Model Adapter Pattern**
   - Created a `ModelAdapter.js` utility that provides Mongoose-like methods
   - All models now use this adapter instead of Mongoose schemas

3. **MongoDB Features**
   - Added support for transactions
   - Added support for aggregation pipelines
   - Added support for bulk operations
   - Added support for populating references

## Usage Examples

### Creating a Model

```javascript
const { createModelAdapter } = require('../utils/ModelAdapter');

const userSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true }
};

const User = createModelAdapter('users', userSchema);

module.exports = User;
```

### Basic CRUD Operations

```javascript
// Create
const newUser = await User.create({ name: 'John', email: 'john@example.com' });

// Read
const user = await User.findById('123456789012');
const users = await User.find({ name: 'John' });

// Update
const updatedUser = await User.findByIdAndUpdate('123456789012', { name: 'Jane' }, { new: true });

// Delete
const deletedUser = await User.findByIdAndDelete('123456789012');
```

### Advanced Features

```javascript
// Populate references
const order = await Order.findById('123456789012');
const populatedOrder = await Order.populate(order, 'user');

// Aggregation
const stats = await Order.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$user', total: { $sum: '$amount' } } }
]);

// Transactions
await User.withTransaction(async (session) => {
  await User.create({ name: 'John' }, { session });
  await Order.create({ user: 'John', amount: 100 }, { session });
});

// Bulk operations
await User.bulkWrite([
  { insertOne: { document: { name: 'John' } } },
  { updateOne: { filter: { name: 'Jane' }, update: { $set: { active: true } } } }
]);
```

## Helper Utilities

- `ObjectIdHelper.js` - Utilities for working with MongoDB ObjectIds
- `ModelAdapter.js` - Creates model adapters with Mongoose-like methods